import { AppIOManager } from "../IO";
import { Account } from "../entities/Account";
import { City } from "../entities/City";
import { CoinPrice } from "../entities/CoinPrice";
import { Country } from "../entities/Country";
import { EmpowerOnes } from "../entities/EmpowerOnes";
import { State } from "../entities/State";
import { Video } from "../entities/Video";
import { centsToUSD } from "./common";
import { deleteVideo } from "./deleteVideo";
import { getEmpowerOneOfALocation } from "./empowerOne";
import dayjs from "dayjs";

export const deductCoin = async () => {
  try {
    const users: any = await Account.find({
      relations: ["city", "state", "country", "followers"],
    });

    for (const user of users) {
      if (user) {
        // Find the corresponding state and city for the user
        const country: any = await Country.findOne({
          where: { id: user.country.id },
        });
        const state: any = await State.findOne({
          where: { id: user.state.id },
        });
        const city: any = await City.findOne({ where: { id: user.city.id } });

        // Distribute coins to the state and city
        if (country && user.power > 0) {
          country.power = (parseFloat(country.power) + 0.1).toFixed(1);
          await Country.save(country);
          user.power = (parseFloat(user.power) - 0.1).toFixed(1);
          console.log("power after country", user.power);
        }
        if (state && user.power > 0) {
          state.power = (parseFloat(state.power) + 0.1).toFixed(1);
          await State.save(state);
          user.power = (parseFloat(user.power) - 0.1).toFixed(1);
          console.log("power after state", user.power);
        }
        if (city && user.power > 0) {
          city.power = (parseFloat(city.power) + 0.1).toFixed(1);
          await City.save(city);
          user.power = (parseFloat(user.power) - 0.1).toFixed(1);
          console.log("power after city", user.power);
        }

        AppIOManager.send("powerDecrease", user.id.toString(), {
          data: user.power,
        });

        console.log(user.id, "has", user.power, "coins");
        if (user.power > 0) {
          const accounts: any = await Account.find({
            relations: ["followers"],
          });
          // console.log(users,"user .....")
          const followings = accounts.map((elem: any) => {
            return new Promise((resolve, reject) => {
              if (elem.followers.some((a: any) => a.id == user.id)) {
                // console.log(usert.power)
                resolve(Account.sanatizePublic(elem));
              } else {
                resolve(null);
              }
            });
          });
          // await Account.save(user);
          Promise.all(followings)
            .then(async (result: any) => {
              const res = result.filter((x: any) => x);
              if (res.length > 0) {
                for (let index = 0; index < res.length; index++) {
                  const following = res[index];
                  // console.log(res[index], "res[index];");
                  if (user.power > 0) {
                    console.log(
                      "existing power of (dec)user",
                      user.id,
                      ": ",
                      user.power
                    );
                    user.power = (parseFloat(user.power) - 0.1).toFixed(1);
                    await Account.save(user);
                    AppIOManager.send("powerDecrease", user.id.toString(), {
                      data: user.power,
                    });
                    console.log(
                      "resultant power after decreased",
                      user.id,
                      ": ",
                      user.power
                    );
                    console.log(
                      "Before adding power to followers",
                      following.id,
                      ": ",
                      following.power
                    );
                    following.power = (
                      parseFloat(following.power) + 0.1
                    ).toFixed(1);

                    // following.power.save()
                    await Account.save(following);
                    await Account.save(res);
                    AppIOManager.send(
                      "powerIncrease",
                      following.id.toString(),
                      {
                        data: following.power,
                      }
                    );
                    // await Account.save(user);
                    console.log(
                      "AFter added",
                      following.id,
                      ": ",
                      following.power
                    );
                  } else {
                    break;
                  }
                  await Account.save(res);
                  await Account.save(user);
                }
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
        await Account.save(user);
      }
    }

    console.log(`Transferred 0.1 coin to cities, states, and countries.`);
  } catch (error) {
    console.error("Error:", error);
  }
};

export const calculateEmpowerOnes = async () => {
  interface DataObject {
    [key: number]: number | undefined;
  }
  try {
    const commonUserQuery = Account.createQueryBuilder("user")
      .leftJoinAndSelect("user.country", "country")
      .leftJoinAndSelect("user.state", "state")
      .leftJoinAndSelect("user.city", "city")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.pfp",
        "user.power",
        "user.followerCount",
        "country.id",
        "country.name",
        "country.power",
        "state.id",
        "state.name",
        "state.power",
        "city.id",
        "city.name",
        "city.power",
      ]);

    const countries: any = await Country.find({});

    if (countries?.length) {
      let id = countries?.[0]?.id,
        type = "country";

      let query = "user.country =:id";
      if (type === "country") {
        const country = await Country.createQueryBuilder("country")
          .where("country.id=:id", { id: id })
          .getOne();
        let countryObj: DataObject = {};
        let empowerOne = await getEmpowerOneOfALocation(id, "country");
        if (empowerOne) {
          countryObj[empowerOne.id] = country?.id;
        }

        const allStates = await State.createQueryBuilder("state").getMany();
        let stateObj: DataObject = {};

        for (let i = 0; i < allStates.length; i++) {
          let empowerOne = await getEmpowerOneOfALocation(
            allStates[i].id,
            "state"
          );

          if (empowerOne && !countryObj.hasOwnProperty(empowerOne.id)) {
            stateObj[empowerOne.id] = allStates[i]?.id;
          }
        }

        const allCities = await City.createQueryBuilder("city").getMany();
        let cityObj: DataObject = {};
        for (let i = 0; i < allCities.length; i++) {
          let empowerOne = await getEmpowerOneOfALocation(
            allCities[i].id,
            "city"
          );

          if (empowerOne && !stateObj.hasOwnProperty(empowerOne.id)) {
            cityObj[empowerOne.id] = allCities[i]?.id;
          }
        }

        const user = await commonUserQuery
          .where(query, { id: id })
          .orderBy("user.followerCount", "DESC")
          .addOrderBy("user.power", "DESC")
          .getManyAndCount();

        let userArray: any = user[0].map(Account.sanatizePublic);
        for (let i = 0; i < userArray.length; i++) {
          if (
            Object.keys(countryObj).some(
              (key) => Number(key) === userArray[i].id
            )
          ) {
            userArray[i].empowerLocationCountryName =
              countryObj[userArray[i].id];
          }
        }

        for (let i = 0; i < userArray.length; i++) {
          if (
            Object.keys(stateObj).some((key) => Number(key) === userArray[i].id)
          ) {
            userArray[i].empowerLocationStateName = stateObj[userArray[i].id];
          }
        }

        for (let i = 0; i < userArray.length; i++) {
          if (
            Object.keys(cityObj).some((key) => Number(key) === userArray[i].id)
          ) {
            userArray[i].empowerLocationCityName = cityObj[userArray[i].id];
          }
        }

        if (userArray && userArray?.length) {
          await EmpowerOnes.clear();
          userArray?.map(async (user: any) => {
            const empowerers = new EmpowerOnes();
            if (
              user.empowerLocationCountryName ||
              user.empowerLocationStateName ||
              user.empowerLocationCityName
            ) {
              empowerers.userId = user.id;
              if (user.empowerLocationCountryName) {
                empowerers.locationId = user.empowerLocationCountryName;
                empowerers.locationType = "country";
              } else if (user.empowerLocationStateName) {
                empowerers.locationId = user.empowerLocationStateName;
                empowerers.locationType = "state";
              } else if (user.empowerLocationCityName) {
                empowerers.locationId = user.empowerLocationCityName;
                empowerers.locationType = "city";
              }
              await empowerers.save();
            }
          });
        }
      }
    }
  } catch (error) {
    console.log(error, "er");
  }
};

export const deleteVideoAfter24Hours = async () => {
  try {
    const videos = await Video.createQueryBuilder("video")
      .where("video.totalPowerTransferredDate IS NOT NULL")
      .getMany();
    console.log(videos, "videos,,,");
    for (const video of videos) {
      const totalPowerTransferredDate = dayjs(video.totalPowerTransferredDate);
      const twentyFourHoursAgo = dayjs().subtract(24, "hours");

      if (
        totalPowerTransferredDate.isBefore(twentyFourHoursAgo) &&
        video.power === video.powerTransferred
      ) {
        // Delete the video
        const response = await deleteVideo(video.id);
        if (!response?.error) {
          console.log(`Deleted video with id ${video.id}`);
        } else {
          console.log(response?.error, "er");
        }
      }
    }
  } catch (error) {
    console.log(error, "error");
  }
};

export const calculatePrice = async () => {
  try {
    const usersCount = await Account.createQueryBuilder("user")
      .select("COUNT(*)", "count")
      .addSelect("SUM(user.power)", "totalCoins")
      .getRawOne();

    const totalCoinsOfAllUsers = usersCount?.totalCoins;
    const appCoins = usersCount.count * 1000;
    const average = appCoins / 2;
    const coinPrice = (0.1 / average) * totalCoinsOfAllUsers;

    const coinBank = await CoinPrice.find({});
    if (!coinBank || coinBank?.length === 0) {
      const bank = new CoinPrice();
      bank.price = coinPrice;
      bank.appCoins = appCoins;
      await bank.save();
    } else {
      const priceTransaction = await CoinPrice.createQueryBuilder()
        .update(CoinPrice)
        .set({ price: coinPrice, appCoins: appCoins })
        .execute();
      if (priceTransaction?.affected === 0) {
        console.log("No data found !!");
      } else {
        console.log("Updated Successfully !");
      }
    }
  } catch (error) {
    console.log(error, "COIN_PRICE ERROR");
  }
};
