import { Router } from "express";
import { randomUUID } from "crypto";
import { MoreThan } from "typeorm";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Account } from "../entities/Account";
import { Video } from "../entities/Video";
import { Comment } from "../entities/Comment";
import { PowerTransaction } from "../entities/PowerTransactions";
import { requireAuth } from "./utils/requireAuth";
import { transferPower } from "../utils/transferPower";
import { writeFile } from "./file";
import { videoService } from "./services/video";
import { powerTransactionService } from "./services/powerTransaction";

import { IGetUserAuthInfoRequest } from "./account";
import { errorMessages, successMessages } from "./utils/responseMessages";
import { FileMulter } from "../multer/uploadVideos";
import { uploadOnS3 } from "../multer/s3";
import { AppIOManager } from "../IO";
import { SpecialPowerTransaction } from "../entities/SpecialPowerTransaction";
import { deleteVideo } from "../utils/deleteVideo";
import { specialPowerTransactionService } from "./services/specialPowerTransaction";
import { stateService } from "./services/state";
import { cityService } from "./services/city";
import { countryService } from "./services/country";
import { accountService } from "./services/account";

dayjs.extend(utc);

export const video = Router();

export const VIDEO_SIZE_LIMIT = 90 * 1024 * 1024;
export const IMAGE_SIZE_LIMIT = 10 * 1024 * 1024;
export const VIDEO_REVIVE_TIME = 24 * 60 * 60 * 1000;

video.post(
  "/",
  requireAuth,
  FileMulter.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const files = req.files as any;
      const videoFile = files?.video?.[0];
      const thumbnailFile = files?.thumbnail?.[0];
      const id = req.user?.id || 0;

      // Validate the file sizes
      const videoSizeLimit = VIDEO_SIZE_LIMIT;
      const imageSizeLimit = IMAGE_SIZE_LIMIT;

      if (!videoFile) {
        return res.status(400).send("Video file not provided.");
      }

      if (videoFile && videoFile.size > videoSizeLimit) {
        return res.status(400).send("Maximum Video file size is 90MB.");
      }

      if (thumbnailFile && thumbnailFile.size > imageSizeLimit) {
        return res.status(400).send("Maximum thumbnail file size is 10MB.");
      }

      const account = await accountService.getAccountByJoinGroup(id);

      if (!account) {
        return res.status(401).json({
          error: "Account not found",
        });
      }
      const power = parseInt(req.body.power);
      if (!power || power <= 0) {
        return res.status(400).json({
          error: "No power provided",
        });
      }

      if (account.power < power) {
        return res.status(400).json({
          error: "Not enough power",
        });
      }

      const message = Video.validate(req.body);
      if (message) {
        return res.status(400).json({
          error: message,
        });
      }

      const video = new Video();
      const { title, description } = req.body;
      const uploadFile = await uploadOnS3(
        videoFile.buffer,
        videoFile.originalname,
        videoFile.mimetype
      );
      if (uploadFile.status !== 200) {
        return res.status(400).json({
          error: "Video file upload failed",
        });
      }

      if (thumbnailFile) {
        const uploadThumbnailFile = await uploadOnS3(
          thumbnailFile.buffer,
          thumbnailFile.originalname,
          thumbnailFile.mimetype
        );
        if (uploadThumbnailFile.status !== 200) {
          return res.status(400).json({
            error: "Thumbnail file upload failed",
          });
        }

        video.thumbnail = uploadThumbnailFile.url;
      }

      //remove extension from filename
      const tokens = videoFile.originalname.split(".");
      tokens.pop();
      video.id = randomUUID();
      video.groupId = account.group.id;
      video.account = account;
      video.url = uploadFile.url;
      video.title = title;
      video.description = description;
      let [_, err] = transferPower(video.account, video, power);
      if (err != null) console.error(err.message);

      await video.save();
      await video.account.save();

      console.log("DONE UPLOADING");

      return res.locals.sendSuccess(successMessages.VIDEO_UPLOADED, {
        video: Video.sanatizePublic(video),
      });
    } catch (err) {
      return res.status(500).json({
        err: err,
        message: "Something went wrong!",
      });
    }
  }
);

video.get("/all", async (req, res) => {
  try {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;

    const data = await videoService.getAllVideos(skip, take);
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      videos: data[0].map(Video.sanatizePublic),
      totalCount: data[1],
    });
  } catch (err) {
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

video.get("/empower/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;
    let videoTrxn: any =
      await powerTransactionService.getPowerTransactionByQuery({
        userId: parseInt(id),
        type: "addPowerToVideo",
      });

    videoTrxn = await Video.getVideosTransactionByAccount(videoTrxn);
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      totalCount: videoTrxn.length,
      videos: videoTrxn.splice(skip, take),
    });
  } catch (err) {
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

video.get("/specialEmpower/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.locals.sendError(errorMessages.INVALID_PARAMS, {
        id: req.params.id,
      });
    }
    const id = req.params.id;
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;

    let videos: any;

    if (req.query.type === "city") {
      videos =
        await specialPowerTransactionService.getspecialVideoTrxnsByLocation(
          parseInt(id),
          "city"
        );
    } else if (req.query.type === "state") {
      videos =
        await specialPowerTransactionService.getspecialVideoTrxnsByLocation(
          parseInt(id),
          "state"
        );
    } else {
      videos =
        await specialPowerTransactionService.getspecialVideoTrxnsByLocation(
          parseInt(id),
          "country"
        );
    }
    videos = await Video.getVideosTransactionByAccount(videos);
    res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      totalCount: videos.length,
      videos: videos.splice(skip, take),
    });
  } catch (err) {
    console.log(err, "error");
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

video.get("/", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const id = req.user?.id || 0;
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;

    const data = await videoService.getVideos(id, skip, take);

    let videos = data[0].map((elem: any) => {
      return new Promise(async (resolve, reject) => {
        let videoTrxn: any =
          await powerTransactionService.getPowerTransactionByQuery({
            userId: id,
            videoId: elem.id,
            type: "addPowerToVideo",
          });

        videoTrxn = await Video.getVideosTransactionByAccount(videoTrxn);
        let videoSpecialTrxn: any =
          await specialPowerTransactionService.getspecialVideoTrxns(
            id,
            elem.id
          );
        videoSpecialTrxn = await Video.getVideosTransactionByAccount(
          videoSpecialTrxn
        );
        elem["empowered"] = videoTrxn[0]?.powerTransferred || 0;
        elem["specialEmpowered"] = videoSpecialTrxn[0]?.powerTransferred || 0;
        elem["commentCount"] = await Comment.createQueryBuilder("comment")
          .where("comment.video = :id", { id: elem.id })
          .getCount();
        elem["commentDetails"] = await Comment.createQueryBuilder("comment")
          .where("comment.video = :id AND comment.account = :userId", {
            id: elem.id,
            userId: id,
          })
          .getMany();
        resolve(elem);
      });
    });
    Promise.all(videos)
      .then((result: any) => {
        return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          videos: result.map(Video.sanatizePublic),
          totalCount: data[1],
        });
      })
      .catch((err) => {
        console.log(err);
        return res.locals.sendError(errorMessages.SERVER_ERROR, err);
      });
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

video.get("/user/:id", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;
    let [videos, count] = await Video.getVideosByAccount(userId, take, skip);

    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      videos: videos.map(Video.sanatizePublic),
      totalCount: count,
      success: true,
    });
  } catch (err) {
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

video.get("/:id", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const id = req.params.id;
    const video = await videoService.getVideoByJoinAccount({ id });

    if (!video) {
      return res.locals.sendError(errorMessages.VIDEO_NOT_FOUND);
    }

    let videoTrxn: any =
      await powerTransactionService.getPowerTransactionByQuery({
        userId: req?.user?.id,
        videoId: video.id,
      });

    let videoToSend: any = { ...video };
    videoTrxn = await Video.getVideosTransactionByAccount(videoTrxn);
    videoToSend["empowered"] = videoTrxn[0]?.powerTransferred || 0;
    videoToSend["commentCount"] = await Comment.createQueryBuilder("comment")
      .where("comment.video = :id", { id: video.id })
      .getCount();
    let specialVideoTrxn: any =
      await specialPowerTransactionService.getspecialVideoTrxns(
        req?.user?.id || 0,
        video.id
      );

    specialVideoTrxn = await Video.getVideosTransactionByAccount(
      specialVideoTrxn
    );
    videoToSend["specialEmpowered"] =
      specialVideoTrxn[0]?.powerTransferred || 0;
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      video: Video.sanatizePublic(videoToSend),
    });
  } catch (err) {
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

video.post(
  "/addPowerToVideo",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const id = req.user?.id;

      const account: any = await accountService.getAccount({ id });
      if (!account) {
        return res.locals.sendSuccess(errorMessages.ACCOUNT_NOT_FOUND, account);
      }

      const message = Video.validatPowerAPI(req.body);
      if (message) {
        return res.status(400).json({ success: false, message });
      }

      const power = parseInt(req.body.power);
      if (parseFloat(account.power) < power) {
        return res.locals.sendError(errorMessages.NOT_ENOGH_POWER);
      }

      let video: any = await videoService.getVideoByJoinAccount({
        id: req.body.videoId,
      });

      if (video.videoReviveCount >= 3) {
        return res.locals.sendError(errorMessages.REVIVE_LIMIT_EXCEEDED);
      }
      account.power = parseFloat(account.power) - power;
      video.power += power;
      await account.save();
      if (
        !video?.account.subscription_success &&
        video.totalPowerTransferredDate !== null &&
        video.videoReviveCount < 3
      ) {
        video.videoReviveCount++;
        video.totalPowerTransferredDate = null;
      }
      video = await video.save();
      const powerTransaction = new PowerTransaction();
      powerTransaction.userId = account.id;
      powerTransaction.videoId = video.id;
      powerTransaction.powerTransferred = power;
      powerTransaction.thumbnail = video.thumbnail;
      powerTransaction.url = video.url;
      powerTransaction.type = "addPowerToVideo";
      await powerTransaction.save();

      let videoTrxn: any =
        await powerTransactionService.getPowerTransactionByQuery({
          userId: req?.user?.id,
          videoId: video.id,
        });

      const videoTrxns = await Video.getVideosTransactionByAccount(videoTrxn);
      const empowered = videoTrxns[0]?.powerTransferred || 0;

      AppIOManager.send("powerDecrease", account.id.toString(), {
        data: account.power,
      });
      return res.locals.sendSuccess(successMessages.CREATED, {
        video: Video.sanatizePublic(video),
        empowered,
      });
    } catch (err) {
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

video.post(
  "/addSpecialPowerToVideo",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const id = req?.user?.id;
      const locationId = req?.body?.locationId;
      const locationType = req?.body?.locationType;

      let location: any;
      if (locationId) {
        if (locationType === "country") {
          location = await countryService.getCountryById(locationId);
        } else if (locationType === "state") {
          location = await stateService.getStateById(locationId);
        } else {
          location = await cityService.getCityByCondition({ id: locationId });
        }
      }

      if (!location) {
        return res.locals.sendSuccess(
          errorMessages.LOCATION_NOT_FOUND,
          location
        );
      }

      const message = Video.validatPowerAPI(req.body);
      if (message) {
        return res.status(400).json({ success: false, message });
      }

      const power = parseInt(req.body.power);
      if (location.power < power) {
        return res.locals.sendError(errorMessages.NOT_ENOGH_POWER);
      }

      let video: any = await videoService.getVideoByJoinAccount({
        id: req.body.videoId,
      });
      if (
        !video?.account.subscription_success &&
        video.totalPowerTransferredDate !== null &&
        video.videoReviveCount < 3
      ) {
        video.videoReviveCount++;
        video.totalPowerTransferredDate = null;
      }
      location.power -= power;
      video.power += power;
      await location.save();
      video = await video.save();
      const powerTransaction = new SpecialPowerTransaction();
      if (id) {
        powerTransaction.userId = id;
      }
      powerTransaction.videoId = video.id;
      powerTransaction.locationId = locationId;
      powerTransaction.locationType = locationType;
      powerTransaction.powerTransferred = power;
      powerTransaction.thumbnail = video.thumbnail;
      powerTransaction.url = video.url;
      powerTransaction.type = "addSpecialPowerToVideo";
      await powerTransaction.save();

      let videoTrxn: any =
        await specialPowerTransactionService.getspecialVideoTrxns(
          req?.user?.id || 0,
          video.id
        );

      const videoTrxns = await Video.getVideosTransactionByAccount(videoTrxn);
      const specialEmpowered = videoTrxns[0]?.powerTransferred || 0;
      res.locals.sendSuccess(successMessages.CREATED, {
        video: Video.sanatizePublic(video),
        specialEmpowered,
      });
    } catch (err) {
      console.log(err, "error");
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

video.post(
  "/addPowerToAccount",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const id = req.user?.id;

      let account: any = await accountService.getAccount({ id });
      if (!account) {
        res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
        return;
      }

      const message = Video.validatPowerAPI(req.body);
      if (message) {
        return res.status(400).json({ success: false, message });
      }

      let videoTrxn: any =
        await powerTransactionService.getSinglePowerTransactionByQuery({
          userId: id,
          videoId: req.body.videoId,
        });

      if (!videoTrxn) {
        const power = parseInt(req.body.power);
        const video: any = await videoService.getVideoByJoinAccount({
          id: req.body.videoId,
        });

        if (video.power < power || video.powerTransferred === video.power) {
          return res.locals.sendError(errorMessages.NOT_ENOGH_POWER);
        }
        account.power = parseFloat(account.power) + power;
        account = await account.save();
        video.powerTransferred += power;
        if (
          !video?.account?.subscription_success &&
          video.powerTransferred == video.power
        ) {
          video.totalPowerTransferredDate = dayjs.utc().format();
        }

        await video.save();
        const powerTransaction = new PowerTransaction();
        powerTransaction.userId = account.id;
        powerTransaction.videoId = video.id;
        powerTransaction.powerTransferred = power;
        powerTransaction.type = "addPowerToAccount";
        powerTransaction.thumbnail = video.thumbnail;
        powerTransaction.url = video.url;
        await powerTransaction.save();
      }
      return res.locals.sendSuccess(successMessages.CREATED, {
        account: Account.sanatizePublic(account),
      });
    } catch (err) {
      console.log(err, "error........");
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

video.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    let video = await videoService.getVideoByCondition({ id });

    if (!video) {
      return res.locals.sendError(errorMessages.VIDEO_NOT_FOUND);
    }
    if (req.body.title) {
      video.title = req.body.title;
    }
    if (req.body.description) {
      video.description = req.body.description;
    }
    if (req.body.thumbnail) {
      req.body.thumbnail =
        typeof req.body.thumbnail == "string"
          ? JSON.parse(req.body.thumbnail)
          : req.body.thumbnail;
      video.thumbnail = writeFile(
        req.body.thumbnail.file,
        req.body.thumbnail.extension
      );
    }
    video = await video.save();
    return res.locals.sendSuccess(successMessages.CREATED, {
      video: Video.sanatizePublic(video),
    });
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

video.post(
  "/removePower/:id",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const id = req.params.id;
      const userId = req.user?.id;

      let account: any = await accountService.getAccount({ id: userId });

      if (!account) {
        return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
      }

      let video = await videoService.getVideoByJoinAccount({ id });
      if (!video) {
        return res.locals.sendError(errorMessages.VIDEO_NOT_FOUND);
      }
      let videoTrxn: any =
        await powerTransactionService.getPowerTransactionByQuery({
          userId,
          videoId: id,
          createdAt: MoreThan(new Date(Date.now() - 1000 * 60)),
        });

      if (!videoTrxn.length) {
        return res.locals.sendError(errorMessages.TIME_LIMIT_EXCEEDED);
      } else {
        const total = await Video.getVideosTransactionByAccount(videoTrxn);
        if (video.power - video.powerTransferred < total[0].powerTransferred) {
          return res.locals.sendError(errorMessages.NOT_ENOGH_POWER);
        }

        const idArr = videoTrxn.map((a: any) => a.id);
        await powerTransactionService.deleteTransaction(idArr);
        video.power -= total[0].powerTransferred;
        account.power = parseFloat(account.power) + total[0].powerTransferred;
        if (
          !video.account.subscription_success &&
          video.powerTransferred == video.power
        ) {
          total[0].totalPowerTransferredDate = dayjs(new Date(), { utc: true });
        }
        video = await video.save();
        await account.save();
        let videoTrxnN: any =
          await powerTransactionService.getPowerTransactionByQuery({
            userId,
            videoId: id,
          });

        videoTrxnN = await Video.getVideosTransactionByAccount(videoTrxnN);
        AppIOManager.send("powerIncrease", account.id.toString(), {
          data: account.power,
        });
        res.locals.sendSuccess(successMessages.CREATED, {
          video: Video.sanatizePublic(video),
          empowered: videoTrxnN[0]?.powerTransferred || 0,
        });
      }
    } catch (err) {
      console.log(err, "error");
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

video.post(
  "/removeSpecialPower/:id",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const id = req?.params.id;
      const userId = req?.user?.id || 0;
      const locationId = req?.body?.locationId;
      const locationType = req?.body?.locationType;

      let location: any;
      if (locationId) {
        if (locationType === "country") {
          location = await countryService.getCountryById(locationId);
        } else if (locationType === "state") {
          location = await stateService.getStateById(locationId);
        } else {
          location = await cityService.getCityByCondition({ id: locationId });
        }
      }

      if (!location) {
        return res.locals.sendError(errorMessages.LOCATION_NOT_FOUND);
      }

      let video = await videoService.getVideoByCondition({ id: id });

      if (!video) {
        return res.locals.sendError(errorMessages.VIDEO_NOT_FOUND);
      }

      let specialVideoTrxn: any =
        await specialPowerTransactionService.getspecialVideoTrxn(userId, id);

      if (!specialVideoTrxn.length) {
        return res.locals.sendError(errorMessages.TIME_LIMIT_EXCEEDED);
      } else {
        const total = await Video.getVideosTransactionByAccount(
          specialVideoTrxn
        );
        if (video.power - video.powerTransferred < total[0].powerTransferred) {
          return res.locals.sendError(errorMessages.NOT_ENOGH_POWER);
        }

        const idArr = specialVideoTrxn.map((a: any) => a.id);
        await specialPowerTransactionService.deleteSpecialTransaction(idArr);
        video.power -= total[0]?.powerTransferred;
        location.power = parseFloat(
          parseFloat(location.power) + total[0]?.powerTransferred
        ).toFixed(1);
      }
      video = await video.save();
      await location.save();
      let specialVideoTrxN: any =
        await specialPowerTransactionService.getspecialVideoTrxns(userId, id);
      const specialVideoTrxNs = await Video.getVideosTransactionByAccount(
        specialVideoTrxN
      );
      const specialEmpowered = specialVideoTrxNs[0]?.powerTransferred || 0;
      res.locals.sendSuccess(successMessages.CREATED, {
        video: Video.sanatizePublic(video),
        specialEmpowered,
      });
    } catch (err) {
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

video.get(
  "/getByLocationId/:id/:type",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res): Promise<any> => {
    try {
      const { id, type } = req.params;
      const userId = (req?.user as any)?.id;

      //validations
      let arr = ["country", "state", "city"];
      const check = arr.indexOf(type);
      if (check < 0)
        return res
          .status(400)
          .json({ success: false, message: `Incorrect type! Must be ${arr}` });

      const skip = Number(req.query.skip) || 0;
      const take = Number(req.query.take) || 20;

      const data = await videoService.getVideosByLocation(
        id,
        type,
        userId,
        skip,
        take
      );

      res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
        videos: data[0],
        count: data[1],
      });
    } catch (err) {
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

video.post(
  "/",
  requireAuth,
  FileMulter.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const files = req.files as any;
      const videoFile = files?.video?.[0];
      const thumbnailFile = files?.thumbnail?.[0];

      // Validate the file sizes
      const videoSizeLimit = VIDEO_SIZE_LIMIT;
      const imageSizeLimit = IMAGE_SIZE_LIMIT;

      if (videoFile && videoFile.size > videoSizeLimit) {
        return res.status(400).send("Video file size exceeds the limit.");
      }

      if (thumbnailFile && thumbnailFile.size > imageSizeLimit) {
        return res.status(400).send("Image file size exceeds the limit.");
      }

      if (!videoFile) {
        return res.locals.sendError(errorMessages.FILE_NOT_PROVIDED);
      }
      const id = req.user?.id || 0;

      const account: any = await accountService.getAccountByJoinGroup(id);

      if (!account) {
        return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
      }
      const power = parseInt(req.body.power);
      if (!power || power <= 0) {
        return res.locals.sendError(errorMessages.NO_POWER_PROVIDED);
      }

      if (parseFloat(account.power) < power) {
        return res.locals.sendError(errorMessages.NOT_ENOGH_POWER);
      }

      const message = Video.validate(req.body);
      if (message) {
        res.status(400).json({
          success: false,
          message,
        });
        return;
      }

      const video = new Video();
      const { title, description } = req.body;
      const uploadFile = await uploadOnS3(
        videoFile.buffer,
        videoFile.originalname,
        videoFile.mimetype
      );
      if (uploadFile.status !== 200)
        return res.locals.sendError(errorMessages.FILE_NOT_UPLOADED);

      if (thumbnailFile) {
        const uploadThumbnailFile = await uploadOnS3(
          thumbnailFile.buffer,
          thumbnailFile.originalname,
          thumbnailFile.mimetype
        );
        if (uploadThumbnailFile.status !== 200)
          return res.locals.sendError(errorMessages.FILE_NOT_UPLOADED);

        video.thumbnail = uploadThumbnailFile.url;
      }

      //remove extension from filename
      const tokens = videoFile.originalname.split(".");
      tokens.pop();
      video.id = randomUUID();
      video.groupId = account.group.id;
      video.account = account;
      video.url = uploadFile.url;
      video.title = title;
      video.description = description;
      let [_, err] = transferPower(video.account, video, power);
      if (err != null) console.error(err.message);

      await video.save();
      await video.account.save();

      return res.locals.sendSuccess(successMessages.OK, {
        video: Video.sanatizePublic(video),
      });
    } catch (err) {
      console.log(err);
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

video.delete("/:id", requireAuth, async (req, res) => {
  try {
    const response = await deleteVideo(req.params.id);

    if (response?.error) {
      return res.locals.sendError(response.error);
    }

    res.locals.sendSuccess(response?.result);
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});
