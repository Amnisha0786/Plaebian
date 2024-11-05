import { createConnection } from "typeorm";

import { Account } from "./entities/Account";
import { Group } from "./entities/Group";
import { Video } from "./entities/Video";
import { Comment } from "./entities/Comment";
import { PowerTransaction } from "./entities/PowerTransactions";
import { SpecialPowerTransaction } from "./entities/SpecialPowerTransaction";
import { CommentEmpower } from "./entities/CommentEmpower";
import { Location } from "./entities/Location";
import { Admin } from "./entities/Admin";
import { TutorialVideo } from "./entities/TutorialVideo";
import { City } from "./entities/City";
import { State } from "./entities/State";
import { Country } from "./entities/Country";
import { Track } from "./entities/Track";
import "dotenv/config";
import { EmpowerOnes } from "./entities/EmpowerOnes";
import { Subscription } from "./entities/Subscription";
import { CoinPrice } from "./entities/CoinPrice";

console.log("process.env.DB_HOST", process.env.DB_HOST);
export default {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT!) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "postgres1",
  synchronize: true, //? probably should comment out in production
  // logging: true, //? turn on if you wanna look at sql
  entities: [
    Account,
    Group,
    Video,
    PowerTransaction,
    SpecialPowerTransaction,
    Comment,
    CommentEmpower,
    Location,
    Admin,
    TutorialVideo,
    City,
    State,
    Country,
    Track,
    EmpowerOnes,
    Subscription,
    CoinPrice,
  ],
} as Parameters<typeof createConnection>[0];
