import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { Account } from "./Account";
import { Video } from "./Video";

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ nullable: false })
  description!: string;

  @Column({ default: 0 })
  power!: number;

  @ManyToOne(() => Account)
  account!: Account;

  @ManyToOne(() => Video)
  video!: Video;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  static async validateComment(comment: Comment): Promise<string | null> {
    if (!comment.description) return "Description is required";
    if (!comment.account) return "Account id is required";
    if (!comment.video) return "Video id is required";
    if (comment.power < 1) return "Minimum one power is required";

    let account = await Account.findOne({
      where: { id: comment.account.id },
    });
    if (!account) return "Invalid account Id";
    if (account && account.power < comment.power) {
      return "Your account does not have enough power";
    }

    let video = await Video.findOne({
      where: { id: comment.video.id },
    });
    if (!video) return "Invalid video Id";

    return null;
  }
}
