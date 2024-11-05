/* example:
    const foo = ():Result<V, Error> => {
        return [null, new Error('')];
        OR
        return [V, null];
    } 
 */

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
  // userName: string;
  country: string;
  city: string;
  state: string;
  pfp?: string;
  county?: string;
  followerCount: number;
  followers?: AccountType[];
};

export type SignUpType = {
  firstName: string;
  lastName: string;
  email: string;
  // userName: string;
  password: string;
  country: string;
  city: string;
  state: string;
  county?: string;
  pfp: FileInputType;
};

export type VideoType = WithPower & {
  id?: string;
  url: string;
  groupId: number;
  title: string;
  thumbnail?: string;
  description: string;
  powerTransferred?: number;
  account: AccountType;
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

export type LocationType = WithPower & {
  id: string;
  power: number
  country: string,
  state: string,
  city: string,
}