import { Router } from "express";

import { Account } from "../entities/Account";
import { PowerTransaction } from "../entities/PowerTransactions";
import { TutorialVideo } from "../entities/TutorialVideo";
import { IGetUserAuthInfoRequest } from "./account";
import { requireAuth } from "./utils/requireAuth";
import { errorMessages, successMessages } from "./utils/responseMessages";
import { tutorialService } from "./services/tutorial";
import { powerTransactionService } from "./services/powerTransaction";
import { accountService } from "./services/account";

export const tutorials = Router();

tutorials.get("/", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  const id = req.user?.id || 0;
  const skip = Number(req.query.skip) || 0;
  const take = Number(req.query.take) || 10;
  let totalCount = await TutorialVideo.createQueryBuilder().getCount();
  let tutorials: any = await tutorialService.getVisibleTutorials(skip, take);

  tutorials = tutorials.map((elem: any) => {
    return new Promise(async (resolve, reject) => {
      let videoTrxn: any =
        await powerTransactionService.getPowerTransactionByQuery({
          userId: id,
          videoId: elem.id,
        });
      elem["seen"] = videoTrxn?.length ? true : false;

      resolve(elem);
    });
  });
  Promise.all(tutorials)
    .then((result: any) => {
      res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
        tutorials: result,
        totalCount,
      });
    })
    .catch((err) => {
      console.log(err);
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    });
});

tutorials.post(
  "/addPowerToAccount",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const id = req.user?.id;

      let account: any = await accountService.getAccount({ id });
      if (!account) {
        return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
      }

      const message = TutorialVideo.validatPowerAPI(req.body);
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
        const video: any = await tutorialService.getTutorial({
          id: req.body.videoId,
        });

        account.power = parseFloat(account.power) + power;
        account = await account.save();
        const powerTransaction = new PowerTransaction();
        powerTransaction.userId = account.id;
        powerTransaction.videoId = video.id;
        powerTransaction.powerTransferred = power;
        powerTransaction.type = "addPowerToAccount";
        powerTransaction.thumbnail = "";
        powerTransaction.url = video.url;
        await powerTransaction.save();
      }
      res.locals.sendSuccess(successMessages.CREATED, {
        account: Account.sanatizePublic(account),
      });
    } catch (err) {
      res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);
