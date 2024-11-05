/* example:
    const foo = ():Result<V, Error> => {
        return [null, new Error('')];
        OR
        return [V, null];
    } 
 */

import { Account } from "../entities/Account";
import { City } from "../entities/City";
import { Country } from "../entities/Country";
import { State } from "../entities/State";

export type Success<T> = [T, null];
export type Failure<Error> = [null, Error];
export type Result<V, Error> = Success<V> | Failure<Error>;

export type WithPower = {
  power: number;
};

export type AccountType = WithPower & {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: Country;
  city: City;
  state: State;
  pfp?: string;
  // county?: string;
  followerCount: number;
  followers?: Account[];
};

export type SignUpType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  state: string;
  // county?: string;
  pfp: FileInputType;
  referralCode?: string;
};

export type VideoType = WithPower & {
  id?: string;
  url: string;
  groupId: number;
  title: string;
  thumbnail?: string;
  description: string;
  account: Account;
  powerTransferred?: number;
  createdAt?: Date;
};

export type FileInputType = {
  file: string;
  extension: string;
};

export type PowerTransactionType = {
  id?: number;
  powerTransferred: number;
  videoId: string;
  userId: number;
  type: string;
  createdAt?: Date;
};

export type CommentType = WithPower & {
  id?: string;
  description: string;
  account: Account;
  video: VideoType;
  powerTransferred?: number;
  createdAt?: Date;
};

export type CommentEmpowerType = WithPower & {
  id?: number;
  account: Account;
  power: number;
  comment: Comment;
  createdAt?: Date;
};

export type LocationType = WithPower & {
  id: string;
  power: number;
  country: string;
  state: string;
  city: string;
};
