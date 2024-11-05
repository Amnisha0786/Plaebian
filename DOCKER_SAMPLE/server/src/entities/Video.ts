import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryColumn,
  Not,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Account } from "./Account";

@Entity()
export class Video extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  url!: string;

  @Column()
  groupId!: number;

  @Column({ nullable: true })
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  thumbnail!: string;

  @Column({ default: 0 })
  power!: number;

  @Column({ default: 0 })
  powerTransferred!: number;

  @Column({ default: null })
  totalPowerTransferredDate: Date;

  @Column({ default: 0 })
  videoReviveCount: number;

  @ManyToOne(() => Account)
  account!: Account;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  static validate(video: Video): string | null {
    if (!video.title) return "Title is required";
    if (!video.description) return "Description is required";
    return null;
  }

  static validatPowerAPI(body: any): string | null {
    if (!body.power) return "Power is required";
    if (!body.videoId) return "Video Id is required";
    return null;
  }

  static sanatizePublic(video: Video): Video {
    const copy = { ...video } as Video;
    copy.account = Account.sanatizePublic(video.account) as Account;
    return copy;
  }

  static async createVideo(v: Video): Promise<Video> {
    const video = new Video();
    video.account = v.account as Account;
    video.url = v.url;
    video.title = v.title;
    video.description = v.description;
    await video.save();
    return video;
  }

  static async getVideosByAccount(
    accountId: number,
    take: number,
    skip: number
  ) {
    return await Video.findAndCount({
      where: { account: { id: accountId } },
      take,
      skip,
      relations: ["account"],
      order: {
        createdAt: "DESC",
      },
    });
  }

  static async getVideosWithoutAccount(accountId: number): Promise<Video[]> {
    return await Video.find({
      where: { account: { id: Not(accountId) }, power: Not(0) },
      relations: ["account"],
    });
  }

  static async getVideosTransactionByAccount(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const result = Object.values(
        data.reduce(
          (transactions: any, video: any) => (
            transactions[video.videoId]
              ? (transactions[video.videoId].powerTransferred +=
                video.powerTransferred)
              : (transactions[video.videoId] = { ...video }),
            transactions
          ),
          {}
        )
      );
      resolve(result);
    });
  }
}
