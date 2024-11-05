import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

export type EmpowerOnesType = {
  id: number;
  locationId: number;
  locationType: string;
  userId: number;
  createdAt?: Date;
};

@Entity()
export class EmpowerOnes extends BaseEntity implements EmpowerOnesType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  locationType: string;

  @Column()
  locationId: number;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt!: Date;
}
