import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { Video } from "../../entities/Video";
import { Account } from "../../entities/Account";
import { Track } from "../../entities/Track";
import { PowerTransaction } from "../../entities/PowerTransactions";

class VideoService {
  private videoRepository: Repository<Video>;

  constructor() {
    createConnection(ormconfig);
    this.videoRepository = getRepository(Video);
  }

  async getVideoByCondition(condition: any) {
    return await this.videoRepository.findOne({ where: condition });
  }

  async getVideoByJoinAccount(condition: any) {
    return this.videoRepository.findOne({
      relations: ["account"],
      where: condition,
    });
  }

  getAllVideos(skip: number, take: number): Promise<[Video[], number]> {
    return this.videoRepository
      .createQueryBuilder("video")
      .where("video.power != video.powerTransferred")
      .leftJoinAndSelect("video.account", "account")
      .take(take)
      .skip(skip)
      .getManyAndCount();
  }

  async getVideosByLocation(
    id: string,
    type: string,
    userId: number,
    skip: number,
    take: number
  ) {
    return await this.videoRepository
      .createQueryBuilder("video")
      .skip(skip)
      .limit(take)
      .leftJoinAndMapOne(
        "video.account",
        Account,
        "account",
        "account.id = video.account"
      )
      .leftJoinAndMapOne(
        "account.track",
        Track,
        "track",
        "track.accountId =account.id AND track.trackerId =:uId",
        { uId: userId }
      )
      .leftJoinAndMapMany(
        "video.empower",
        PowerTransaction,
        "empower",
        "empower.videoId = video.id AND empower.type =:type AND empower.userId !=:uId",
        { type: "addPowerToVideo", uId: userId }
      )
      .select([
        "video",
        "account.id",
        "account.email",
        "account.firstName",
        "account.lastName",
        "account.pfp",
        "account.isAdmin",
        "track",
      ])
      .where(`account.${type} =:id`, { id })
      .andWhere("video.power > video.powerTransferred")
      .groupBy("video.id, account.id, track.id")
      .orderBy("video.power", "DESC")
      .addOrderBy("SUM(empower.powerTransferred)", "DESC")
      .getManyAndCount();
  }

  getVideos(
    id: number,
    skip: number,
    take: number
  ): Promise<[Video[], number]> {
    return this.videoRepository
      .createQueryBuilder("video")
      .where(
        "video.power != video.powerTransferred AND video.account.id != :id",
        { id }
      )
      .leftJoinAndSelect("video.account", "account")
      .leftJoinAndMapOne(
        "account.track",
        Track,
        "track",
        "track.accountId =account.id AND track.trackerId =:id",
        { id }
      )
      .take(take)
      .skip(skip)
      .getManyAndCount();
  }

  async getVideoByUserId(userId: number) {
    return await this.videoRepository
      .createQueryBuilder("video")
      .where("video.totalPowerTransferredDate IS NOT NULL")
      .leftJoinAndSelect("video.account", "account")
      .where("account.id = :id", { id: userId })
      .getMany();
  }
}

export const videoService = new VideoService();
