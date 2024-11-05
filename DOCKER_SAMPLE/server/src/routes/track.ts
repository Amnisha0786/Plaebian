import { Router } from "express";

import { Track } from "../entities/Track";
import { requireAuth } from "./utils/requireAuth";
import { IGetUserAuthInfoRequest } from "./account";
import { unauthorized } from "./utils/unauthorized";
import { errorMessages, successMessages } from "./utils/responseMessages";
import { trackService } from "./services/track";
import { accountService } from "./services/account";

export const track = Router();

track.post("/add", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const userId = (req?.user as any)?.id;
    const { accountId } = req.body;
    if (!userId || !accountId) {
      return unauthorized(res, {
        message: "No user/account found!",
        success: false,
      });
    }

    if (userId === accountId) {
      return res.locals.sendError(errorMessages.SELF_TRACK_ERROR);
    }

    const account = await accountService.getAccount({ id: accountId });
    if (!account) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }

    const ifExist = await trackService.getTrack(accountId, userId);
    if (ifExist) {
      return res.locals.sendError(errorMessages.ALREADY_TRACKED);
    }

    const track = await Track.save({ account: accountId, tracker: userId });
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, track);
  } catch (err) {
    console.log(err);
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

track.get("/list", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const userId = (req?.user as any)?.id;
    if (!userId) {
      return unauthorized(res, { message: "No user found!", success: false });
    }
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 50;
    const data = await trackService.getMyTracks(userId, skip, take);

    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      track: data[0],
      count: data[1],
    });
  } catch (err) {
    console.log(err);
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

track.delete(
  "/remove/:id",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const userId = (req?.user as any)?.id;
      const id = req.params;
      if (!userId) {
        return unauthorized(res, { message: "No user found!", success: false });
      }

      const track = await Track.delete(id);
      if (track && track.affected! > 0)
        return res.locals.sendSuccess(successMessages.OK);
      else return res.locals.sendError(errorMessages.REQUEST_FAILED);
    } catch (err) {
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

track.get("/videos", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 20;
    const userId = (req?.user as any)?.id;

    const data = await trackService.trackerVideos(userId, skip, take);
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, data);
  } catch (err) {
    console.log(err);
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});
