import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  FindOptionsWhere,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { FileInputType, WithPower } from "../shared/types";
import { Group } from "./Group";
import { Location } from "./Location";
import { Country } from "./Country";
import { State } from "./State";
import { City } from "./City";
type AccountSanatizeFunction = (account: Partial<Account>) => Account;

type SignUpType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  state: string;
  subscription: string;
  // county?: string;
  pfp: FileInputType;
  referralCode?: string;
  isCodeValid?: boolean;
};

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => Country, (country) => country.id, {
    nullable: true,
  })
  country: Country;

  @ManyToOne(() => State, (state) => state.id, {
    nullable: true,
  })
  state: State;

  @ManyToOne(() => City, (city) => city.id, {
    nullable: true,
  })
  city: City;

  @Column({ nullable: true })
  pfp: string;

  @Column({ nullable: true })
  subscription: string;

  @Column({ default: false })
  subscription_success: boolean;

  @Column({ nullable: true })
  cashin_success: string;

  @Column({ type: "decimal", default: 0 })
  cashin_coins: number;

  @Column({ nullable: true, type: "numeric" })
  otp: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 1,
    default: 20,
  })
  power: number;

  @ManyToMany(() => Account)
  @JoinTable({
    name: "follows",
  })
  followers: Account[];

  @Column({ default: 0 })
  followerCount: number;

  @ManyToOne(() => Group, (group) => group.members, {
    nullable: true,
    cascade: true,
  })
  group: Group;

  @Column({ default: null })
  referralCode: string;

  @Column({ default: null })
  stripe_id: string;

  @Column({ default: null })
  stripe_account: string;

  @Column({ default: null })
  usedReferralCode: string;

  @Column({ default: false })
  isCodeValid: boolean;

  @ManyToOne(() => Location, (location) => location.id)
  location: Location;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  static async validateRegister(account: SignUpType): Promise<string | null> {
    if (!account.email) return "Email is required";
    if (!account.password) return "Password is required";
    if (!account.firstName) return "First name is required";
    if (!account.lastName) return "Last name is required";
    if (!account.country) return "Country is required";
    if (!account.city) return "City is required";
    if (!account.state) return "State is required";
    // if (!account.county) return "County is required";
    // if (!account.pfp.file || !account.pfp.extension) return "PFP is required";
    if (
      await Account.findOne({
        where: { email: account.email },
      })
    )
      return "Email is already in use";

    if (account.referralCode) {
      const check = await Account.find({
        where: { referralCode: account.referralCode },
      });
      if (!check) {
        return "Invalid referral code";
      }
    }

    return null;
  }

  static validateLogin(account: Account): string | null {
    if (!account.email) return "Email is required";
    if (!account.password) return "Password is required";
    return null;
  }

  static validateForgotPassword(account: Account): string | null {
    if (!account.email) return "Email is required";
    return null;
  }

  static validateVerifyOtp(account: Account): string | null {
    if (!account.email) return "Email is required";
    if (!account.otp) return "Otp is required";
    return null;
  }

  static validateResetPassword(account: Account): string | null {
    if (!account.email) return "Email is required";
    if (!account.password) return "password is required";
    return null;
  }

  static sanatizeMap(
    accounts: Partial<Account>[],
    sanatizeFunction: AccountSanatizeFunction
  ): Partial<Account>[] {
    return accounts.map(sanatizeFunction);
  }

  static sanatize(account: Partial<Account>): Partial<Account> {
    const copy = { ...account };
    delete copy.password;
    delete copy.isAdmin;
    delete copy.followers;
    return copy;
  }

  static sanatizePublic(account: Partial<Account>): Partial<Account> {
    const copy = Account.sanatize(account) as Partial<Account>;
    // delete copy.email;
    // delete copy.firstName;
    // delete copy.lastName;
    return copy as Partial<Account>;
  }

  static async getAccount(
    params: number | FindOptionsWhere<Account>,
    relations?: string[]
  ): Promise<Account> {
    const where = typeof params === "number" ? { id: params } : params;
    const acc = await Account.findOne({
      relations,
      where,
    });
    if (!acc) throw new Error(`Account not found with id ${params}`);
    return acc as Account;
  }

  static async getWithFollowers(
    params: number | FindOptionsWhere<Account>
  ): Promise<Account> {
    const acc = await Account.getAccount(params, ["followers"]);
    return acc as Account;
  }

  async addFollower(follower: Account, followers: Account[]) {
    if (this.isFollowing(follower)) return false;
    this.followers.push(follower);

    console.log("after", this.followers);

    this.followerCount++;
    await this.save();
    return true;
  }

  async removeFollower(follower: Account) {
    if (!this.isFollowing(follower)) return false;
    this.followers = this.followers.filter((a) => a.id !== follower.id);
    this.followerCount = Math.max(this.followerCount - 1, 0);
    await this.save();
    return true;
  }

  isFollowing(follower: Account): boolean {
    if (!this.followers) this.followers = [];
    const result = this.followers.find((a) => a.id === follower.id);
    console.log(result);
    return !!result;
  }

  increasePower(amount: number) {
    this.power += amount * this.followers.length;
  }

  /**
   *
   * @param from Account to send the power from
   * @param amount Amount of power to send
   */
  async transferPower(from: number | (WithPower & BaseEntity), amount: number) {
    const fromAccount =
      typeof from === "number" ? await Account.getAccount(from) : from;
    if (fromAccount.power < amount) throw new Error("Not enough power!");
    fromAccount.power -= amount;
    this.power += amount;
    await fromAccount.save();
    await this.save();
  }

  static async massTransferPower() {
    const query = Account.createQueryBuilder("account");
    query.innerJoinAndSelect("account.followers", "follower");
    //select all accounts that have followers
    const accounts = await query.getMany();
    for (const account of accounts) {
      if (account.followers.length === 0) continue;

      account.followers.forEach((follower) => {
        account.transferPower(follower as Account, 0.1).catch(console.error);
      });
    }
  }

  static async generateRewardCoin(referralCode: string): Promise<number> {
    const firstUser = await Account.createQueryBuilder("account")
      .where("account.usedReferralCode IS NOT NULL")
      .getOne();

    const check = await Account.find({
      where: { usedReferralCode: referralCode },
    });

    // first referral user
    if (!firstUser) {
      return 10000;
    }

    let coins = 100;
    // First 10 referral users
    if (check.length <= 10) {
      return coins;
    }
    for (let x = 10; x < 56; x += 5) {
      if (check.length <= x) {
        console.log("Return", coins);
        return coins;
      }
      coins = coins - 10;
    }
    return 0;
  }
}
