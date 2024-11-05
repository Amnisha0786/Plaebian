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
import { Comment } from "./Comment";

@Entity()
export class CommentEmpower extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  power!: number;

  @ManyToOne(() => Account)
  account!: Account;

  @ManyToOne(() => Comment)
  comment!: Comment;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  static async validateCommentEmpower(
    commentEmp: any
  ): Promise<string | null> {
    if (!commentEmp.account) return "Account id is required";
    if (!commentEmp.power) return "Power id is required";
    if (commentEmp.power < 1) return "Minimum one power is required";
    if (!commentEmp.comment) return "Comment id is required";
    const account = await Account.findOne({
      where: { id: commentEmp.account },
    });
    if (!account) return "Invalid account Id";
    if (account && account.power < commentEmp.power) {
      return "Your account does not have enough power";
    }

    const comemnt = await Comment.findOne({
      where: { id: commentEmp.comment.id },
    });
    if (!comemnt) return "Invalid comment Id";

    return null;
  }

  static async powerValidation(comment: any): Promise<string | null> {
    if (comment.power < 1) return "Minimum one power is required";

    let account = await Account.findOne({
      where: { id: comment.account },
    });
    if (!account) return "Invalid account Id";
    if (account && account.power < comment.power) {
      return "Your account does not have enough power";
    }

    return null;
  }
}
