import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export type AdminType = {
  id: number;
  password: string;
  email: string;
};

@Entity()
export class Admin extends BaseEntity implements AdminType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  static validateLogin(account: Admin): string | null {
    if (!account.email) return "Email is required";
    if (!account.password) return "Password is required";
    return null;
  }

  static sanatize(account: Partial<Admin>): AdminType {
    const copy = { ...account };
    delete copy.password;
    return copy as AdminType;
  }
}
