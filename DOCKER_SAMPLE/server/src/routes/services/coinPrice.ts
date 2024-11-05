import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { CoinPrice } from "../../entities/CoinPrice";

class CoinPriceService {
  private priceRepository: Repository<CoinPrice>;

  constructor() {
    createConnection(ormconfig);
    this.priceRepository = getRepository(CoinPrice);
  }

  async getPrice() {
    return await this.priceRepository.find({});
  }
}
export const priceService = new CoinPriceService();
