import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

import { PowerTransactionType } from "../shared/types";

@Entity()
export class PowerTransaction
  extends BaseEntity
  implements PowerTransactionType
{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  videoId: string;

  @Column()
  powerTransferred: number;

  @Column()
  userId: number;

  @Column()
  type: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  url: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
