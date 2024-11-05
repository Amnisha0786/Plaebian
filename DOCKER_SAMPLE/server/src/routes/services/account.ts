import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { Account } from "../../entities/Account";
import { Country } from "../../entities/Country";
import { State } from "../../entities/State";
import { City } from "../../entities/City";

class AccountService {
  private accountRepository: Repository<Account>;

  constructor() {
    createConnection(ormconfig);
    this.accountRepository = getRepository(Account);
  }

  getAccount(condition: Object): Promise<Account | null> {
    return this.accountRepository.findOne({ where: condition });
  }

  async getUserWithLocation(id: string) {
    return await this.accountRepository
      .createQueryBuilder("user")
      .leftJoinAndMapOne(
        "user.country",
        Country,
        "country",
        "country.id = user.country"
      )
      .leftJoinAndMapOne("user.state", State, "state", "state.id = user.state")
      .leftJoinAndMapOne("user.city", City, "city", "city.id = user.city")
      .where("user.id =:id", { id })
      .select(["user", "country", "state", "city"])
      .getOne();
  }

  getUserWithFollowers(id: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["followers"],
    });
  }

  async getFollowerAndLocation(userId: number) {
    return await this.accountRepository
      .createQueryBuilder("account")
      .where("account.id=:id", { id: userId })
      .leftJoinAndSelect("account.followers", "followers")
      .leftJoinAndSelect("followers.city", "city")
      .leftJoinAndSelect("followers.state", "state")
      .getOne();
  }

  getUserByCondition(condition: object): Promise<Account | null> {
    return this.accountRepository.findOne(condition);
  }

  getUsersWithFollowers(): Promise<Account[]> {
    return this.accountRepository.find({
      relations: ["followers", "state", "city"],
    });
  }

  getUserByEmail(email: string): Promise<Account | null> {
    return this.accountRepository.findOne({ where: { email } });
  }

  async getUserCountByCity(id: number) {
    return await this.accountRepository
      .createQueryBuilder("user")
      .where("user.city = :id", { id })
      .getCount();
  }

  async getUserCountByState(id: number) {
    return await this.accountRepository
      .createQueryBuilder("user")
      .where("user.state = :id", { id })
      .getCount();
  }

  async getUserCountByCountry(id: number) {
    return await this.accountRepository
      .createQueryBuilder("user")
      .where("user.country = :id", { id })
      .getCount();
  }

  async getUserBySubscription(userId: number) {
    return await this.accountRepository.findOne({
      where: { id: userId },
    });
  }

  async getUsersWithQuery(
    query: string,
    userId: number,
    take: number,
    skip: number
  ) {
    return await this.accountRepository
      .createQueryBuilder("user")
      .take(take)
      .skip(skip)
      .leftJoinAndSelect("user.city", "city")
      .leftJoinAndSelect("user.state", "state")
      .where(query, { id: userId })
      .orderBy("user.followerCount", "DESC")
      .addOrderBy("user.power", "DESC")
      .getManyAndCount();
  }
  getUsersByTakeSkip(take: number, skip: number) {
    return this.accountRepository
      .createQueryBuilder("user")
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
        "country.name",
        "country.power",
        "state.name",
        "state.power",
        "city.name",
        "city.power",
      ])
      .take(take)
      .skip(skip);
  }
  async getUserByCommonUserQuery(
    commonUserQuery: any,
    query: string,
    userIds: number
  ) {
    return await commonUserQuery
      .where(query, { id: userIds })
      .orderBy("user.followerCount", "DESC")
      .addOrderBy("user.power", "DESC")
      .getManyAndCount();
  }

  async getAccountByJoinGroup(userId: number) {
    return await this.accountRepository.findOne({
      where: { id: userId },
      relations: ["group"],
    });
  }

  async getUsersByIdAndFollowers(id: number) {
    return await this.accountRepository.find({
      where: { id: id },
      relations: ["followers"],
    });
  }
}

export const accountService = new AccountService();
