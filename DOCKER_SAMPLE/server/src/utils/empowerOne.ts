import { Account } from "../entities/Account";
import { City } from "../entities/City";
import { State } from "../entities/State";
export const getEmpowerOneOfALocation = async (
  locationId: number,
  locationType: string
) => {
  let query = "user.country =:id";

  const users = await Account.createQueryBuilder("user")
    .where(query, { id: 1 })
    .leftJoinAndSelect("user.country", "country")
    .leftJoinAndSelect("user.state", "state")
    .leftJoinAndSelect("user.city", "city")
    .orderBy("user.followerCount", "DESC")
    .addOrderBy("user.power", "DESC")
    // .addOrderBy('user.createdAt', 'DESC')
    .getMany();

  // console.log(users[0]?.id, "users[0]?.id")
  const stateUsers = await Account.createQueryBuilder("user")
    .leftJoinAndSelect("user.country", "country")
    .leftJoinAndSelect("user.state", "state")
    .leftJoinAndSelect("user.city", "city")
    .where("user.state =:id", { id: locationId })
    // .andWhere("user.id != :userId", { userId: users[0]?.id })
    .orderBy("user.followerCount", "DESC")
    .addOrderBy("user.power", "DESC")
    .getMany();

  if (locationType === "country") {
    return users[0];
  }

  let usersofstate: any;
  if (locationType === "state") {
    if (users[0]?.id && users[0]?.id === stateUsers[0]?.id) {
      if (stateUsers[1]) {
        usersofstate = stateUsers[1];
      } else {
        usersofstate = null;
      }
    } else {
      usersofstate = stateUsers[0];
    }

    return usersofstate;
  }
  let usersofcity: any;
  if (locationType === "city") {
    const data: any = await City.createQueryBuilder("city")
      .where("city.id=:id", { id: locationId })
      .getOne();
    const getStateofCity = await State.createQueryBuilder("state")
      .where("state.id=:id", { id: data?.state })
      .getOne();

    if (getStateofCity) {
      const getEmpowerOfState: any = await getEmpowerOneOfALocation(
        getStateofCity?.id,
        "state"
      );
      const cityUsers = await Account.createQueryBuilder("user")
        .leftJoinAndSelect("user.country", "country")
        .leftJoinAndSelect("user.state", "state")
        .leftJoinAndSelect("user.city", "city")
        .where("user.city =:id", { id: locationId })
        .orderBy("user.followerCount", "DESC")
        .addOrderBy("user.power", "DESC")
        .getMany();
      if (users[0]?.id && users[0]?.id === cityUsers[0]?.id) {
        if (cityUsers[1] && cityUsers[1]?.id === getEmpowerOfState?.id) {
          if (cityUsers[2]) {
            usersofcity = cityUsers[2];
          }
        } else {
          usersofcity = cityUsers[1];
        }
      } else if (cityUsers[0] && cityUsers[0]?.id === getEmpowerOfState?.id) {
        if (cityUsers[1]) {
          usersofcity = cityUsers[1];
        } else {
          usersofcity = null;
        }
      } else {
        usersofcity = cityUsers[0];
      }
      return usersofcity;
    }
  }
  return users[0];
};
