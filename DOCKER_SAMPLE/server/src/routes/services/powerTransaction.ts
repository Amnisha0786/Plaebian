import { Repository, createConnection, getRepository } from "typeorm";

import { PowerTransaction } from "../../entities/PowerTransactions";
import ormconfig from "../../ormconfig";

class PowerTransactionService {
  private transactionRepository: Repository<PowerTransaction>;

  constructor() {
    createConnection(ormconfig);
    this.transactionRepository = getRepository(PowerTransaction);
  }
  async getPowerTransactionByQuery(query: any) {
    return await this.transactionRepository.find({
      where: query,
    });
  }
  async getSinglePowerTransactionByQuery(query: any) {
    return await this.transactionRepository.findOne({
      where: query,
    });
  }
  async deleteTransaction(idArr: []) {
    return await this.transactionRepository
      .createQueryBuilder("powerTransaction")
      .delete()
      .where("id IN (:...id)", { id: idArr })
      .execute();
  }
}
export const powerTransactionService = new PowerTransactionService();
