import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type CityType = {
  id: number;
  name: string;
  state: number;
  country: number;
  power: number;
};

@Entity()
export class City extends BaseEntity implements CityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  state: number;

  @Column()
  country: number;

  @Column({ type: "decimal", default: 0, precision: 10, scale: 1 })
  power: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
