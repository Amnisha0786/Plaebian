import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { State } from "../../entities/State";
import { Location } from "../../entities/Location";

class StateService {
  private stateRepository: Repository<State>;
  private locationRepository: Repository<Location>;

  constructor() {
    createConnection(ormconfig);
    this.stateRepository = getRepository(State);
    this.locationRepository = getRepository(Location);
  }

  async getAllStates() {
    return await this.stateRepository.createQueryBuilder("state").getMany();
  }

  async getStateWithCountry(state: { name: string; country: number }) {
    return await this.stateRepository
      .createQueryBuilder("state")
      .where("state.name=:name AND state.country=:country", state)
      .getOne();
  }

  async getStateByname(name: string) {
    return await this.stateRepository.findOne({ where: { name } });
  }

  async getStateById(id: number) {
    return await this.stateRepository.findOne({ where: { id: id } });
  }

  async saveState(state: { name: string; country: number }) {
    let data = this.stateRepository.create(state);
    return await data.save();
  }

  async saveStateIfNotExist(state: { name: string; country: number }) {
    const ifExist = await this.getStateWithCountry(state);
    if (ifExist) return ifExist;

    let data = this.stateRepository.create(state);
    await data.save();
    await this.locationRepository
      .create({
        locationId: data.id,
        type: "state",
        name: state.name,
      })
      .save();
    return data;
  }

  async getStatesByCountry(id: number) {
    return await this.stateRepository
      .createQueryBuilder("state")
      .where("state.country =:id", { id })
      .getManyAndCount();
  }

  //   async getSingleStateById(stateId: number) {
  //     return await this.stateRepository
  //       .createQueryBuilder("state")
  //       .where("state.id=:id", { id: stateId })
  //       .getOne();
  //   }
}

export const stateService = new StateService();
