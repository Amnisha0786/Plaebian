import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { Location } from "../../entities/Location";
import { City } from "../../entities/City";
import { Account } from "../../entities/Account";

class CityService {
  private cityRepository: Repository<City>;
  private locationRepository: Repository<Location>;

  constructor() {
    createConnection(ormconfig);
    this.cityRepository = getRepository(City);
    this.locationRepository = getRepository(Location);
  }

  async saveCityIfNotExist(city: {
    name: string;
    state: number;
    country: number;
    power: number;
  }) {
    const ifExist = await this.getCityByName(city.name);
    if (ifExist) return ifExist;

    let data = await this.cityRepository.create(city).save();
    await this.locationRepository
      .create({
        locationId: data.id,
        type: "city",
        name: city.name,
      })
      .save();
    return data;
  }

  async getAllCities(){
    return this.cityRepository.createQueryBuilder("city").getMany();
  }

  async getCityByName(name: string) {
    return await this.cityRepository.findOne({ where: { name } });
  }

  async getCityByCondition(condition: any) {
    return await this.cityRepository.findOne({ where: condition });
  }

  async getByStateId(id: number) {
    return await City.createQueryBuilder("city")
      .where("city.state=:id", { id })
      .leftJoinAndMapMany(
        "city.plebeian",
        Account,
        "plebeian",
        "plebeian.city = city.id"
      )
      .select(["city"])
      .groupBy("city.id")
      .orderBy("COUNT (DISTINCT plebeian.id)", "DESC")
      .getRawMany();
  }

  async getCityById(cityId: number) {
    return await this.cityRepository
      .createQueryBuilder("city")
      .where("city.id=:id", { id: cityId })
      .getOne();
  }
  async getCitiesByStateId(stateId: number) {
    return await this.cityRepository
      .createQueryBuilder("city")
      .where("city.state=:id", { id: stateId })
      .getMany();
  }
}

export const cityService = new CityService();
