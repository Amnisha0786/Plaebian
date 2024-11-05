import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { EmpowerOnes } from "../../entities/EmpowerOnes";
import { Account } from "../../entities/Account";
import { City } from "../../entities/City";
import { Country } from "../../entities/Country";
import { State } from "../../entities/State";

class EmpowerOnesService {
  private empowerOnesRepository: Repository<EmpowerOnes>;

  constructor() {
    createConnection(ormconfig);
    this.empowerOnesRepository = getRepository(EmpowerOnes);
  }

  async getEmpowerWithState(stateId: number) {
    return await this.empowerOnesRepository
      .createQueryBuilder("empowerones")
      .leftJoinAndMapOne(
        "empowerones.user",
        Account,
        "user",
        "user.id = empowerones.userId"
      )
      .leftJoinAndMapOne("user.city", City, "city", "city.id = user.city")
      .where(
        "empowerones.locationId = :id AND empowerones.locationType=:state",
        {
          id: stateId,
          state: "state",
        }
      )
      .getOne();
  }

  async getEmpowerOneByLocation(locationId: number, type: string) {
    return await this.empowerOnesRepository
      .createQueryBuilder("empowerones")
      .where(
        "empowerones.locationType = :locationType AND empowerones.locationId=:id",
        {
          id: locationId,
          locationType: type,
        }
      )
      .getOne();
  }

  async getEmpowerOneWithLocation(id: number) {
    return await this.empowerOnesRepository
      .createQueryBuilder("empowerones")
      .leftJoinAndMapOne(
        "empowerones.country",
        Country,
        "country",
        "country.id = (CASE WHEN empowerones.locationType = 'country' THEN empowerones.locationId END )"
      )
      .leftJoinAndMapOne(
        "empowerones.state",
        State,
        "state",
        "state.id = (CASE WHEN empowerones.locationType = 'state' THEN empowerones.locationId END )"
      )
      .leftJoinAndMapOne(
        "empowerones.city",
        City,
        "city",
        "city.id = (CASE WHEN empowerones.locationType = 'city' THEN empowerones.locationId END )"
      )
      .where("empowerones.userId =:id", { id })
      .getOne();
  }
}

export const empowerOnesService = new EmpowerOnesService();
