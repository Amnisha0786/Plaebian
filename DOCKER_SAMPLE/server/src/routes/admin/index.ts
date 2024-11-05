import { Router } from "express";
import jwt from "jsonwebtoken";

import { Admin } from "../../entities/Admin";
import { TutorialVideo } from "../../entities/TutorialVideo";
import { upload } from "../../multer/config";
import { unauthorized } from "../utils/unauthorized";
import { validate } from "../utils/validate";
import { errorMessages, successMessages } from "../utils/responseMessages";
import { uploadOnS3 } from "../../multer/s3";

export const admin = Router();

admin.post("/login", async (req, res) => {
  const valid = await validate(req, res, Admin.validateLogin);
  if (!valid) return;

  const { email, password } = req.body;

  const account = email === "admin@plebeian.com";
  if (!account)
    return unauthorized(res, { message: "Email address not found!" });

  // const matches = await argon2.verify("plebeian", password);
  const matches = password === "plebeian";

  if (!matches) return unauthorized(res, { message: "Invalid password!" });

  const token = jwt.sign({ id: "1" }, process.env.JWT_SECRET!);

  res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
    account: Admin.sanatize({
      email: "admin@plebeian.com",
      password: "plebeian",
    }),
    token,
  });
});

admin.post("/upload-tutorial", upload.single("file"), async (req, res) => {
  if (!req?.file?.filename) {
    return res.locals.sendError(errorMessages.FILE_NOT_PROVIDED);
  }

  const message = TutorialVideo.validate(req.body);
  if (message) {
    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  const video = new TutorialVideo();
  const { title, description } = req.body;
  let url = await uploadOnS3(req.file.buffer, req.file.originalname, req.file.mimetype);

  const tokens = req.file.filename.split(".");
  tokens.pop();
  const videoId = tokens.join(".");
  video.id = videoId;
  video.url = `https://vimeo.com/${url}`;
  video.title = title;
  video.description = description;
  await video.save();

  res.json({
    video: TutorialVideo.sanatizePublic(video),
  });
});

admin.get("/tutorials", async (req, res) => {
  const skip = Number(req.query.skip) || 0;
  const take = Number(req.query.take) || 10;
  const totalCount = await TutorialVideo.createQueryBuilder().getCount();
  const videos = await TutorialVideo.createQueryBuilder()
    .take(take)
    .skip(skip)
    .getMany();
  res.json({
    videos: videos.map(TutorialVideo.sanatizePublic),
    totalCount,
  });
});

admin.put("/tutorial/:id", async (req, res) => {
  const id = req.params.id;
  let video = await TutorialVideo.findOne({
    where: { id },
  });
  if (!video) {
    return res.locals.sendError(errorMessages.TUTORIAL_NOT_FOUND);
  }
  if (req.body.title) {
    video.title = req.body.title;
  }
  if (req.body.description) {
    video.description = req.body.description;
  }
  if (req.body.showToUser !== undefined) {
    video.showToUser = req.body.showToUser;
  }
  video = await video.save();
  res.json({
    video: TutorialVideo.sanatizePublic(video),
  });
});

admin.delete("/tutorial/:id", async (req, res) => {
  try {
    let deletedTutorial = await TutorialVideo.delete(req.params.id);
    if (deletedTutorial.affected && deletedTutorial.affected > 0) {
      return res.locals.sendSuccess(successMessages.DELETED);
    } else {
      return res.locals.sendError(errorMessages.REQUEST_FAILED);
    }
  } catch (err) {
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});
