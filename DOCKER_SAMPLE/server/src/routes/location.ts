import { Router } from "express";

import { Account } from "../entities/Account";
import { requireAuth } from "./utils/requireAuth";
import { Country, CountryType } from "../entities/Country";
import { State, StateType } from "../entities/State";
import { City } from "../entities/City";
import { getEmpowerOneOfALocation } from "../utils/empowerOne";
import { successMessages, errorMessages } from "./utils/responseMessages";
import { locationService } from "./services/location";
import { accountService } from "./services/account";
import { stateService } from "./services/state";
import { cityService } from "./services/city";
import { countryService } from "./services/country";
import { empowerOnesService } from "./services/empowerOnes";

export const location = Router();

location.get("/", requireAuth, async (req, res) => {
  try {
    let countries: any = await Country.find({});
    let states: any = await State.find({});
    let cities: any = await City.find({});

    const locations: { id: number; name: string; type: string }[] = [];

    if (countries?.length) {
      countries.forEach((country: CountryType) => {
        locations.push({
          id: country.id,
          name: country.name,
          type: "country",
        });
      });
    }

    if (states?.length) {
      states.forEach((state: StateType) => {
        locations.push({
          id: state.id,
          name: state.name,
          type: "state",
        });
      });
    }

    if (cities?.length) {
      cities.forEach((city: CountryType) => {
        locations.push({
          id: city.id,
          name: city.name,
          type: "city",
        });
      });
    }

    if (locations.length) {
      res.locals.sendSuccess(successMessages.CONTENT_FOUND, { locations });
    } else {
      res.locals.sendSuccess(successMessages.NO_CONTENT, { locations });
    }
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

location.get("/users/:id", requireAuth, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.locals.sendError(errorMessages.INVALID_PARAMS, {
        id: req.params.id,
      });
    }
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;

    let location: any;

    let query = "user.country =:id";
    if (req.query.type === "city") {
      location = await cityService.getCityByCondition({ id: req.params.id });
      let empowerOne = await getEmpowerOneOfALocation(
        parseInt(req.params.id),
        "city"
      );
      location.empowerOne = empowerOne;
      query = "user.city =:id";
    } else if (req.query.type === "state") {
      query = "user.state =:id";
      location = await stateService.getStateById(parseInt(req.params.id));
      let empowerOne = await getEmpowerOneOfALocation(
        parseInt(req.params.id),
        "state"
      );
      location.empowerOne = empowerOne;
    } else {
      location = await countryService.getCountryById(parseInt(req.params.id));
      let empowerOne = await getEmpowerOneOfALocation(
        parseInt(req.params.id),
        "country"
      );
      location.empowerOne = empowerOne;
    }

    const user = await accountService.getUsersWithQuery(
      query,
      parseInt(req.params.id),
      take,
      skip
    );

    if (user[1] > 0) {
      res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
        users: user[0].map(Account.sanatizePublic),
        location,
        totalCount: user[1],
      });
    } else {
      res.locals.sendSuccess(successMessages.NO_CONTENT, {
        users: [],
        location,
        totalCount: 0,
      });
    }
  } catch (err) {
    console.log(err, "ERR");
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

location.get("/states/:countryId", requireAuth, async (req, res) => {
  try {
    const countryId = req.params.countryId;
    if (!countryId) {
      return res.locals.sendError(errorMessages.INVALID_PARAMS, { countryId });
    }

    const country = await countryService.getCountryById(parseInt(countryId));

    const countryUserCount = accountService.getUserCountByCountry(
      parseInt(countryId)
    );
    const countryEmpOne = await getEmpowerOneOfALocation(
      parseInt(countryId),
      "country"
    );

    let states = await stateService.getStatesByCountry(parseInt(countryId));

    let statesWithCounts = states[0].map((state: any) => {
      return new Promise(async (resolve) => {
        console.log(state, "state");
        let usersCount = await accountService.getUserCountByState(
          parseInt(state.id)
        );
        let empowerOne: any = await empowerOnesService.getEmpowerWithState(
          state.id
        );

        state["empowerOne"] = Account.sanatizePublic(empowerOne?.user);
        state["usersCount"] = usersCount || 0;
        resolve(state);
      });
    });

    if (statesWithCounts.length > 0) {
      Promise.all(statesWithCounts).then((result: any) => {
        res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          country: {
            ...country,
            usersCount: countryUserCount,
            empowerOne: Account.sanatize(countryEmpOne),
          },
          states: result,
          totalCount: states[1],
        });
      });
    } else {
      res.locals.sendSuccess(successMessages.NO_CONTENT);
    }
  } catch (err) {
    console.log(err, "ERR");
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

location.get("/cities/:stateId", requireAuth, async (req, res) => {
  try {
    const stateId = req.params.stateId;
    if (!stateId) {
      return res.locals.sendError(errorMessages.INVALID_PARAMS, { stateId });
    }

    const cities = await cityService.getByStateId(parseInt(stateId));
    console.log(cities);

    const state = await stateService.getStateById(parseInt(stateId));
    const stateUserCount = await accountService.getUserCountByState(
      parseInt(stateId)
    );
    const countryEmpOne = await getEmpowerOneOfALocation(
      parseInt(stateId),
      "state"
    );

    let citiesWithCounts = cities.map((city: any) => {
      return new Promise(async (resolve) => {
        console.log(city, "city");
        let usersCount = await accountService.getUserCountByCity(city.city_id);
        let empowerOne = await getEmpowerOneOfALocation(city.city_id, "city");

        city["empowerOne"] = Account.sanatizePublic(empowerOne);
        city["usersCount"] = usersCount || 0;
        resolve(city);
      });
    });

    if (cities.length > 0) {
      Promise.all(citiesWithCounts).then((result: any) => {
        res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          state: {
            ...state,
            usersCount: stateUserCount,
            empowerOne: Account.sanatize(countryEmpOne),
          },
          cities: result,
          totalCount: cities.length,
        });
      });
    } else {
      res.locals.sendSuccess(successMessages.NO_CONTENT);
    }
  } catch (err) {
    console.log(err, "ERR");
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

location.get("/empowerOne/list", requireAuth, async (req, res) => {
  try {
    let data = await locationService.getEmpowerOneLocations();
    if (data && data.length > 0) {
      data = data.filter(
        (item: any) =>
          (item.location_type === "country" &&
            item.user_followerCount === item.country_max_followerCount) ||
          (item.location_type === "state" &&
            item.user_followerCount === item.state_max_followerCount) ||
          (item.location_type === "city" &&
            item.user_followerCount === item.city_max_followerCount)
      );
    }

    res.locals.sendSuccess(successMessages.CONTENT_FOUND, data);
  } catch (err) {
    console.log(err);
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

location.get("/users/empower/:id", requireAuth, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.locals.sendError(errorMessages.INVALID_PARAMS, {
        id: req.params.id,
      });
    }
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;

    const commonUserQuery = accountService.getUsersByTakeSkip(take, skip);

    let location: any;

    let query = "user.country =:id";

    if (req.query.type === "city") {
      location = await cityService.getCityById(parseInt(req.params.id));
      if (!location) {
        return res.locals.sendError(errorMessages.CITY_NOT_FOUND);
      }
      let empowerOne = await empowerOnesService.getEmpowerOneByLocation(
        parseInt(req.params.id),
        "city"
      );

      location.empowerOne = empowerOne;
      query = "user.city =:id";
      const user = await accountService.getUserByCommonUserQuery(
        commonUserQuery,
        query,
        parseInt(req.params.id)
      );
      let userArray: any = user[0].map(Account.sanatizePublic);
      for (let i = 0; i < userArray.length; i++) {
        if (userArray[i].id === location.empowerOne?.userId) {
          userArray[i].empowerLocationCityName = location.name;
        }
      }
      if (user[1] > 0) {
        res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          users: userArray,
          totalCount: user[1],
        });
      } else {
        res.locals.sendSuccess(successMessages.NO_CONTENT);
      }
    } else if (req.query.type === "state") {
      location = await stateService.getStateById(parseInt(req.params.id));

      if (!location) {
        return res.locals.sendError(errorMessages.STATE_NOT_FOUND);
      }
      const getAllCity = await cityService.getCitiesByStateId(location.id);

      let allCitiesOfState: any = {};
      for (let i = 0; i < getAllCity.length; i++) {
        let empowerOne = await empowerOnesService.getEmpowerOneByLocation(
          getAllCity[i].id,
          "city"
        );

        if (empowerOne) {
          allCitiesOfState[empowerOne.userId] = getAllCity[i]?.name;
        }
      }
      query = "user.state =:id";

      let empowerOne = await empowerOnesService.getEmpowerOneByLocation(
        parseInt(req.params.id),
        "state"
      );

      location.empowerOne = empowerOne;
      const user = await accountService.getUserByCommonUserQuery(
        commonUserQuery,
        query,
        parseInt(req.params.id)
      );

      let userArray: any = user[0].map(Account.sanatizePublic);
      for (let i = 0; i < userArray.length; i++) {
        if (userArray[i].id === location.empowerOne?.userId) {
          userArray[i].empowerLocationStateName = location.name;
        }
      }
      for (let i = 0; i < userArray.length; i++) {
        if (
          Object.keys(allCitiesOfState).some(
            (key) => Number(key) === userArray[i].id
          )
        ) {
          userArray[i].empowerLocationCityName =
            allCitiesOfState[userArray[i].id];
        }
      }
      if (user[1] > 0) {
        res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          users: userArray,
          totalCount: user[1],
        });
      } else {
        res.locals.sendSuccess(successMessages.NO_CONTENT);
      }
    } else {
      const getAllState = await stateService.getAllStates();
      let allStates: any = [];
      for (let i = 0; i < getAllState.length; i++) {
        let empowerOne = await empowerOnesService.getEmpowerOneByLocation(
          getAllState[i].id,
          "state"
        );

        if (empowerOne) {
          allStates[empowerOne.userId] = getAllState[i]?.name;
        }
      }

      const getAllCity = await cityService.getAllCities();
      let allCities: any = {};
      for (let i = 0; i < getAllCity.length; i++) {
        let empowerOne = await empowerOnesService.getEmpowerOneByLocation(
          getAllCity[i].id,
          "city"
        );

        if (empowerOne) {
          allCities[empowerOne.userId] = getAllCity[i]?.name;
        }
      }
      const countries: any = await Country.find({});
      location = countries[0];

      if (!location) {
        return res.locals.sendError(errorMessages.STATE_NOT_FOUND);
      }

      let empowerOne = await empowerOnesService.getEmpowerOneByLocation(
        location.id,
        "country"
      );

      location.empowerOne = empowerOne;

      const user = await accountService.getUserByCommonUserQuery(
        commonUserQuery,
        query,
        parseInt(req.params.id)
      );
      let userArray: any = user[0].map(Account.sanatizePublic);
      for (let i = 0; i < userArray.length; i++) {
        if (userArray[i].id === location.empowerOne?.userId) {
          userArray[i].empowerLocationCountryName = location.name;
        }
      }

      for (let i = 0; i < userArray.length; i++) {
        if (
          Object.keys(allStates).some((key) => Number(key) === userArray[i].id)
        ) {
          userArray[i].empowerLocationStateName = allStates[userArray[i].id];
        }
      }

      for (let i = 0; i < userArray.length; i++) {
        if (
          Object.keys(allCities).some((key) => Number(key) === userArray[i].id)
        ) {
          userArray[i].empowerLocationCityName = allCities[userArray[i].id];
        }
      }

      if (user[1] > 0) {
        res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          users: userArray,
          totalCount: user[1],
        });
      }
    }
  } catch (err) {
    console.log(err, "ERR");
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});
