import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { Location } from "../../entities/Location";
import { City } from "../../entities/City";
import { Country } from "../../entities/Country";
import { State } from "../../entities/State";
import { Account } from "../../entities/Account";

class LocationService {
    private locationRepository: Repository<Location>;

    constructor() {
        createConnection(ormconfig)
        this.locationRepository = getRepository(Location);
    }

    async saveLocation(location: { locationId: number, type: string, name: string }) {
        let data = this.locationRepository.create(location)
        return await data.save()
    }

    async getEmpowerOneLocations() {
        return await this.locationRepository.createQueryBuilder("location")
            .leftJoinAndMapOne(
                "location.country",
                Country,
                "country",
                `country.id = (CASE WHEN location.type = 'country' THEN location.locationId END ) `
            )
            .leftJoinAndMapMany(
                "country.countryUsers",
                Account,
                "countryUsers",
                "countryUsers.country = country.id"
            )
            .leftJoinAndMapOne(
                "location.state",
                State,
                "state",
                "state.id = (CASE WHEN location.type = 'state' THEN location.locationId END )"
            )
            .leftJoinAndMapMany(
                "state.stateUsers",
                Account,
                "stateUsers",
                "stateUsers.state = state.id"
            )
            .leftJoinAndMapOne(
                "location.city",
                City,
                "city",
                "city.id = (CASE WHEN location.type = 'city' THEN location.locationId END )"
            )
            .leftJoinAndMapMany(
                "city.cityUsers",
                Account,
                "cityUsers",
                "cityUsers.city = city.id"
            )
            .leftJoinAndMapOne(
                "location.user",
                Account,
                "user",
                `(location.locationId = user.country OR location.locationId = user.state OR location.locationId = user.city) AND location.deletedAt IS NULL`
            )
            .where(
                `user.followerCount = (
        CASE
          WHEN location.type = 'country' THEN country_max_followerCount
          WHEN location.type = 'state' THEN state_max_followerCount
          WHEN location.type = 'city' THEN city_max_followerCount
          ELSE 0
        END
      )`
            )
            .select([
                "location.id",
                "location.name",
                "location.type",
                "location.locationId",
                "user.id",
                "user.email",
                "user.firstName",
                "user.lastName",
                "user.pfp",
                "user.power",
                "user.followerCount",
                "user.country",
                "user.state",
                "user.city",
            ])
            .addSelect(
                `MAX(CASE WHEN location.type = \'country\' THEN countryUsers.followerCount ELSE 0 END)`,
                "country_max_followerCount"
            )
            .addSelect(
                `MAX(CASE WHEN location.type = \'state\' THEN stateUsers.followerCount ELSE 0 END)`,
                "state_max_followerCount"
            )
            .addSelect(
                `MAX(CASE WHEN location.type = \'city\' THEN cityUsers.followerCount ELSE 0 END)`,
                "city_max_followerCount"
            )
            .addSelect(
                `COUNT(CASE WHEN location.type = 'country' THEN countryUsers.id WHEN location.type = 'state' THEN stateUsers.id ELSE cityUsers.id END)`,
                "userCount"
            )
            .orderBy(
                `COUNT(CASE WHEN location.type = 'country' THEN countryUsers.id WHEN location.type = 'state' THEN stateUsers.id ELSE cityUsers.id END)`,
                "DESC"
            )
            .addOrderBy("user.followerCount", "DESC")
            .groupBy("location.id, user.id ")
            .where("user.id IS NOT NULL")
            .distinctOn([
                `location.id, user.followerCount, COUNT(CASE WHEN location.type = 'country' THEN countryUsers.id WHEN location.type = 'state' THEN stateUsers.id ELSE cityUsers.id END)`,
            ])
            .distinct(true)
            .getRawMany();
    }
}

export const locationService = new LocationService()