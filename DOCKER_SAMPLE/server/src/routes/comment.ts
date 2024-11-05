import { Router } from "express";
import { getConnection } from "typeorm";

import { Account } from "../entities/Account";
import { Comment } from "../entities/Comment";
import { validate } from "./utils/validate";
import { requireAuth } from "./utils/requireAuth";
import { IGetUserAuthInfoRequest } from "./account";
import { CommentEmpower } from "../entities/CommentEmpower";
import { successMessages, errorMessages } from "./utils/responseMessages";
import { commentService } from "./services/comment";
import { accountService } from "./services/account";
import { videoService } from "./services/video";
import { empowerService } from "./services/empower";
import { AppIOManager } from "../IO";

export const comment = Router();

comment.post("/post", requireAuth, async (req, res) => {
  try {
    const valid = await validate(req, res, Comment.validateComment);
    if (!valid) return;

    const account: any = await accountService.getUserByCondition({
      where: { id: req.body.account },
    });
    if (!account) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }
    const newp = parseFloat(account.power) - req.body.power;
    Account.update(account.id, { power: newp }).catch((err) => {
      return res.locals.sendError(errorMessages.SERVER_ERROR, err);
    });

    const comment = await commentService.saveComment(req.body);
    if (!comment) {
      return res.locals.sendError(errorMessages.REQUEST_FAILED);
    }
    return res.locals.sendSuccess(successMessages.CREATED, comment);
  } catch (err) {
    console.log(err);
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

comment.get(
  "/:video_id",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res): Promise<any> => {
    try {
      const { video_id } = req.params;
      const video = await videoService.getVideoByCondition({ id: video_id });

      if (!video)
        return res.locals.sendError(errorMessages.INVALID_PARAMS, { video_id });

      const skip = Number(req.query.skip) || 0;
      const take = Number(req.query.take) || 10;
      const comments = await commentService.getCommentsByVideoId(
        video_id,
        skip,
        take,
        req.user?.id
      );
      console.log(comments);
      if (comments[1] > 0) {
        return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          comments: comments[0],
          totalComments: comments[1],
        });
      } else {
        return res.locals.sendSuccess(successMessages.NO_CONTENT, {
          comments: [],
          totalComments: 0,
        });
      }
    } catch (err) {
      return res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

comment.post(
  "/empower",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      req.body.account = req.user?.id;
      const valid = await validate(
        req,
        res,
        CommentEmpower.validateCommentEmpower
      );
      if (!valid) return;
      const { power, comment } = req.body;
      const accountDetails: any = await accountService.getAccount({
        id: req.user?.id,
      });
      const commentDetails: any = await commentService.getComment(comment);

      const commentEmpowerAccount: any = await commentService.getCommentById(
        comment
      );

      const id = commentEmpowerAccount.account.id;
      let account: any = await accountService.getAccount({ id });

      if (account && accountDetails.id !== account.id) {
        account.power = parseFloat(account.power) + parseFloat(power);
        await account.save();
      }
      const accountPower = accountDetails.power - power;
      let empower = await getConnection().transaction(async (transaction) => {
        const addCommentPower = commentDetails.power + power;
        await transaction.update(Comment, commentDetails.id, {
          power: addCommentPower,
        });

        await transaction.update(Account, accountDetails.id, {
          power: accountPower,
        });

        const empower = new CommentEmpower();
        Object.assign(empower, {
          power: power,
          comment: comment,
          account: req.user?.id,
        });
        const saveEmp = await transaction.save(CommentEmpower, empower);

        return saveEmp;
      });

      if (empower) {
        AppIOManager.send(
          "powerIncrease",
          commentEmpowerAccount.account.id.toString(),
          {
            data: account.power,
          }
        );
        AppIOManager.send("powerDecrease", accountDetails.id.toString(), {
          data: accountPower,
        });

        return res.locals.sendSuccess(successMessages.OK, empower);
      } else {
        return res.locals.sendError(errorMessages.REQUEST_FAILED);
      }
    } catch (err) {
      return res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

comment.delete(
  "/un-empower/:id/:comment_id",
  requireAuth,
  async function (req, res): Promise<any> {
    try {
      const empower = await empowerService.getEmpowerWithMinute(req.params.id);

      const empowerData: any = await CommentEmpower.createQueryBuilder(
        "commentEmpower"
      )
        .where(
          "commentEmpower.id=:id AND commentEmpower.createdAt >=:createdAt",
          {
            id: req.params.id,
            createdAt: new Date(Date.now() - 1000 * 60),
          }
        )
        .leftJoinAndMapOne(
          "commentEmpower.account",
          Account,
          "account",
          "account.id = commentEmpower.account"
        )
        .getOne();

      const id = empowerData?.account.id;
      let account: any = await accountService.getAccount({ id });
      if (account) {
        account.power =
          parseFloat(account.power) + parseFloat(empowerData.power);
        await account.save();
      }
      if (!empower) {
        return res.locals.sendError(errorMessages.TIME_LIMIT_EXCEEDED);
      }

      const comment = await commentService.getComment(req.params.comment_id);
      const commentData: any = await commentService.getCommentById(
        req.params.comment_id
      );
      const accountId = commentData?.account?.id;
      let accountInfo: any = await accountService.getAccount({ id: accountId });

      if (accountInfo && accountInfo?.id !== account?.id) {
        accountInfo.power = parseFloat(accountInfo.power) - empower.power;
        await accountInfo.save();
      }

      if (!comment) {
        return res.locals.sendError(errorMessages.INVALID_PARAMS);
      }

      let unEmpower: any = await getConnection().transaction(async () => {
        const newp = comment.power - empower.power;
        await Comment.update(req.params.comment_id, { power: newp });

        let deleteCommentPower = await CommentEmpower.delete(req.params.id);
        return deleteCommentPower;
      });

      if (unEmpower && unEmpower?.affected > 0) {
        // AppIOManager.send("powerIncrease", empowerData.account.id.toString(), {
        //   data: account.power,
        // });
        // AppIOManager.send("powerDecrease", commentData.account.id.toString(), {
        //   data: accountInfo.power,
        // });
        return res.locals.sendSuccess(successMessages.OK, unEmpower);
      }
    } catch (err) {
      console.log(err, "err");
      return res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

comment.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id }: any = req.params;

    //Deleting comment empowers
    await CommentEmpower.delete({ comment: id });
    //Deleting comment
    let deleteComment = await Comment.delete(req.params.id);

    if (deleteComment.affected && deleteComment.affected > 0)
      return res.locals.sendSuccess(successMessages.DELETED);
    else return res.locals.sendError(errorMessages.REQUEST_FAILED);
  } catch (err) {
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

comment.get("/", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const id = (req?.user as any)?.id;
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 50;

    const comments = await commentService.getCommentsWithEmpowerCount(
      id,
      skip,
      take
    );

    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, comments);
  } catch (err) {
    return res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});
