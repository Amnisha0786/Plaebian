import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type SpecialPowerTransactionType = {
  id?: number;
  powerTransferred: number;
  videoId: string;
  userId: number;
  locationId: number;
  locationType: string;
  type: string;
  createdAt?: Date;
};

@Entity()
export class SpecialPowerTransaction
  extends BaseEntity
  implements SpecialPowerTransactionType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  videoId: string;

  @Column()
  powerTransferred: number;

  @Column()
  userId: number;

  @Column()
  locationId: number;

  @Column()
  locationType: string;

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
