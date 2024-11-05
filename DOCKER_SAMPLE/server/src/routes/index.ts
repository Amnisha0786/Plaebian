import express from "express";

import { account } from "./account";
import { admin } from "./admin";
import { file } from "./file";
import { video } from "./video";
import { comment } from "./comment";
import { location } from "./location";
import { tutorials } from "./tutorials";
import { track } from "./track";
import { price } from "./coinPrice";
export const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Hello World!",
  });
});

router.use("/account", account);
router.use("/admin", admin);
router.use("/tutorials", tutorials);
router.use("/file", file);
router.use("/video", video);
router.use("/comment", comment);
router.use("/locations", location);
router.use("/track", track);
router.use("/price", price);
