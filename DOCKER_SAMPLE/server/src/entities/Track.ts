import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Account } from "./Account";

export type TrackType = {
  id: number;
  tracker: Account;
  account: Account;
};

@Entity()
export class Track extends BaseEntity implements TrackType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account)
  account: Account;

  @ManyToOne(() => Account)
  tracker: Account;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
