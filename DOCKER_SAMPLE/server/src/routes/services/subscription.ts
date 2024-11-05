import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { Subscription } from "../../entities/Subscription";

class SubscriptionService {
  private subscriptionRepository: Repository<Subscription>;

  constructor() {
    createConnection(ormconfig);
    this.subscriptionRepository = getRepository(Subscription);
  }

  async getSubscriptionByUserId(userId: number) {
    return await this.subscriptionRepository
      .createQueryBuilder("subscription")
      .where("subscription.userId = :id", { id: userId })
      .getOne();
  }
}
export const subscriptionService = new SubscriptionService();
