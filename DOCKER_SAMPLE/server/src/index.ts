import cors from "cors";
import express from "express";
import { createServer } from "http";
import { createConnection } from "typeorm";
import "dotenv/config";

import ormconfig from "./ormconfig";
import { router } from "./routes";
import cron from "node-cron";
import {
  calculateEmpowerOnes,
  calculatePrice,
  deductCoin,
  deleteVideoAfter24Hours,
} from "./utils/cron";
import "dotenv/config";
import { setCommonAPIResponse } from "./routes/utils/response";
import { AppIOManager } from "./IO";
import { Server } from "socket.io";
declare global {
  namespace Express {
    interface User {
      id: number;
      iat: number;
    }
  }
}
const main = async () => {
  //Attempt to create typeORM connection to db
  try {
    await createConnection(ormconfig);
  } catch (e) {
    console.log("ERROR CONNECTING TO DATABASE: \n", e);
  }

  //Basic express setup
  const app = express();

  app.use(setCommonAPIResponse);

  app.use((req, res, next) => {
    console.log(req.method, req.url, "incoming request");
    next();
  });
  app.use(
    express.json({
      limit: "512mb",
    }),
    cors({
      origin: process.env.NODE_ENV !== "production" ? "*" : "http://localhost",
      credentials: true,
    })
  );

  app.use("/", router);

  const httpServer = createServer(app);

  httpServer.listen(4000, () => {
    console.log("server started at http://localhost:4000");
    console.log("Socket started at ", process.env.SOCKET_URL);

    const io = new Server(httpServer, {
      cors: {
        origin: process.env.SOCKET_URL,
        methods: ["GET", "POST"],
      },
    });
    io.sockets.on("connection", (socket: any) => {
      console.log(`A user connected:${socket.id}`);
      socket.on("join", function (data: any) {
        console.log("user join data: ", data);
        socket.join(data.id);
      });
    });

    AppIOManager.init(io);
  });

  //Cron job
  cron.schedule(
    "*/10 * * * * *",
    () => {
      console.log("Deducting coin at 01:00 at America/Sao_Paulo timezone");
      // deductCoin();
      calculateEmpowerOnes();
      deleteVideoAfter24Hours();
      calculatePrice();
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

try {
  main();
} catch (e) {
  console.log(e);
}
