import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./Account";

export type SubscriptionType = {
  id: number;
  userId: number;
  sessionId: string;
  planDuration: number;
  planEndDate: Date;
  planStartDate: Date;
  planId: string;
};

@Entity()
export class Subscription extends BaseEntity implements SubscriptionType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  sessionId: string;

  @Column()
  planDuration: number;

  @Column()
  planEndDate: Date;

  @Column()
  planStartDate: Date;

  @OneToOne(() => Account, (user) => user.subscription)
  @JoinColumn()
  user: Account;

  @Column()
  planId: string;
}
