import { MoreThan, Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { SpecialPowerTransaction } from "../../entities/SpecialPowerTransaction";

class SpecialPowerTransactionService {
  private specialPowertransactionRepository: Repository<SpecialPowerTransaction>;

  constructor() {
    createConnection(ormconfig);
    this.specialPowertransactionRepository = getRepository(
      SpecialPowerTransaction
    );
  }
  async deleteSpecialTransaction(idArr: []) {
    return await this.specialPowertransactionRepository
      .createQueryBuilder("specialPowerTransaction")
      .delete()
      .where("id IN (:...id)", { id: idArr || 0 })
      .execute();
  }

  async getspecialVideoTrxn(userId: number, id: string) {
    return await this.specialPowertransactionRepository.find({
      where: {
        userId: userId,
        videoId: id,
        createdAt: MoreThan(new Date(Date.now() - 1000 * 60)),
      },
    });
  }

  async getspecialVideoTrxns(userId: number, id: string) {
    return await this.specialPowertransactionRepository.find({
      where: {
        userId: userId,
        videoId: id,
      },
    });
  }
  async getspecialVideoTrxnsByLocation(id: number, type: string) {
    return await this.specialPowertransactionRepository.find({
      where: { locationId: id, locationType: type },
    });
  }
}
export const specialPowerTransactionService =
  new SpecialPowerTransactionService();
