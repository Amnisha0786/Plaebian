import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { TutorialVideo } from "../../entities/TutorialVideo";

class TutorialService {
  private tutorialRepository: Repository<TutorialVideo>;

  constructor() {
    createConnection(ormconfig);
    this.tutorialRepository = getRepository(TutorialVideo);
  }

  async getTutorial(query: any) {
    return await this.tutorialRepository.findOne({
      where: query,
    });
  }

  getVisibleTutorials(skip: number, take: number): Promise<TutorialVideo[]> {
    return this.tutorialRepository
      .createQueryBuilder("tutorial")
      .where("tutorial.showToUser = :id", { id: true })
      .take(take)
      .skip(skip)
      .getMany();
  }
}

export const tutorialService = new TutorialService();
