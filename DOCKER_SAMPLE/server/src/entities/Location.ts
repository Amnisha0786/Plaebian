import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

export type LocationType = {
  id: string;
  type: string;
  name: string;
  locationId: number;
};
export enum Type {
  COUNTRY = "country",
  STATE = "state",
  CITY = "city",
}

@Entity()
export class Location extends BaseEntity implements LocationType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: Type })
  type!: string;

  @Column()
  name!: string;

  @Column()
  locationId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
