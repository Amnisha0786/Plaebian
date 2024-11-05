import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type PriceType = {
  id: number;
  price: number;
};

@Entity()
export class CoinPrice extends BaseEntity implements PriceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 5,
    default: 0.0,
  })
  price: number;

  @Column({
    type: "decimal",
    default: 0.0,
  })
  appCoins: number;
}
