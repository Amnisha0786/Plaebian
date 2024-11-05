import { Router } from "express";
import express from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import nodemailer from "nodemailer";

import {
  getAccountFromJWT,
  getJWTPayload,
  JWTPayload,
} from "../utils/parseJWT";
import { unauthorized } from "./utils/unauthorized";
import { requireAuth } from "./utils/requireAuth";
import { Group } from "../entities/Group";
import { Account } from "../entities/Account";
import { validate } from "./utils/validate";
import { generateOtp } from "../utils/common";
import { accountService } from "./services/account";
import { stateService } from "./services/state";
import { countryService } from "./services/country";
import { cityService } from "./services/city";
import { errorMessages, successMessages } from "./utils/responseMessages";
import { uploadOnS3 } from "../multer/s3";
import { trackService } from "./services/track";
import { FileMulter } from "../multer/uploadVideos";
import { uploadImage } from "../multer/uploadImages";
import { Subscription } from "../entities/Subscription";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { subscriptionService } from "./services/subscription";
import { videoService } from "./services/video";
import { empowerOnesService } from "./services/empowerOnes";
import { AppIOManager } from "../IO";
dayjs.extend(utc);

export const account = Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

export interface IGetUserAuthInfoRequest extends express.Request {
  user?: Account;
}

export const stripeSession = async (planId: string) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planId, quantity: 1 }],
      success_url: `${process.env.SOCKET_URL}/success`,
      cancel_url: `${process.env.SOCKET_URL}/cancel`,
    });
    return session;
  } catch (error) {
    console.log(error, "ee");
  }
};

account.get("/", requireAuth, async (req, res) => {
  const auth = req?.headers?.authorization;
  console.log(auth);
  if (!auth)
    return unauthorized(res, { message: "No authorization header found!" });

  const token = auth.split(" ")[1];

  if (!token)
    return unauthorized(res, {
      message: "Malformed authorization header!",
    });

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

  if (!payload?.id) return unauthorized(res, { message: "Invalid token!" });

  const account = await accountService.getUserWithLocation(
    payload?.id.toString()
  );
  if (!account) return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
  else
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      account: Account.sanatize(account),
    });
});

account.post("/subscribe", async (req, res) => {
  const { userId } = req.body;
  let planId = process.env.STRIPE_API_ID;
  try {
    if (planId) {
      const session = await stripeSession(planId);
      const user: any = await accountService.getUserBySubscription(userId);

      if (!user) {
        console.log("user not found !");
        return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
      }
      user.subscription = session.id;
      await user.save();
      console.log(session, "session");
      res.locals.sendSuccess(successMessages.PAYMENT_PROCESS, {
        session,
      });
    }
  } catch (error) {
    console.log(error, "eorriro");
    res.locals.sendError(errorMessages.PAYMENT_FAILED);
  }
});

account.post("/payment_success", async (req, res) => {
  const { userId, sessionId } = req.body;

  const user: any = await accountService.getUserBySubscription(userId);
  const videos = await videoService.getVideoByUserId(userId);

  console.log(videos, "videos..");
  if (!user) {
    console.log("user not found !");
    return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === "paid") {
    const subscriptionId = session.subscription;
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const subscriptions = new Subscription();
      const startDate = dayjs.unix(subscription.current_period_start);
      const endDate = dayjs.unix(subscription.current_period_end);
      const durationInDays = endDate.diff(startDate, "day");
      console.log(durationInDays, "sdsd", subscription.current_period_start);

      subscriptions.userId = userId;
      subscriptions.sessionId = session.id;
      subscriptions.planDuration = durationInDays;
      subscriptions.planEndDate = endDate.toDate();
      subscriptions.planStartDate = startDate.toDate();
      subscriptions.planId = subscription.plan.id;
      await subscriptions.save();
      user.subscription_success = true;
      await user.save();
      console.log(subscription, "subscriptions");
      if (videos) {
        videos.forEach(async (video: any) => {
          if (video.totalPowerTransferredDate !== null) {
            video.totalPowerTransferredDate = null;
            await video.save();
          }
        });
      }
      res.locals.sendSuccess(successMessages.PAYMENT_SUCCESSFULL, {
        subscriptions,
      });
    } catch (error) {
      console.log(error, "eorr");
      res.locals.sendError(errorMessages.PAYMENT_FAILED);
    }
  } else {
    res.locals.sendError(errorMessages.PAYMENT_FAILED);
  }
});

account.delete("/unsubscribe/:userId/:sessionId", async (req, res) => {
  const { userId, sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscriptionId = session.subscription;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.del(subscriptionId);

      const subscribeUser: any =
        await subscriptionService.getSubscriptionByUserId(parseInt(userId));
      if (subscribeUser) {
        await Subscription.delete(subscribeUser);
      }
      const user: any = await accountService.getUserBySubscription(
        parseInt(userId)
      );
      if (user) {
        user.subscription_success = false;
        user.subscription = null;
        await user.save();
      }
      res.locals.sendSuccess(successMessages.UNSUBSCRIBED, {
        subscription,
      });
    }
  } catch (error) {
    console.log(error, "unscbscibe err");
    res.locals.sendError(errorMessages.NOT_FOUND);
  }
});

account.get("/:id", requireAuth, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    const id: any = req.params.id;
    const userId: any = req.user?.id ?? "";

    const account = await accountService.getUserWithFollowers(id);
    console.log(account);
    if (!account) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }

    if (!req.user) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }

    const location = await accountService.getUserWithLocation(id);

    let youFollowing = account.followers.some((a) => a.id === req.user?.id);
    const respObj = {
      account: Account.sanatizePublic(account),
      youFollowing,
      country: location?.country,
      state: location?.state,
      city: location?.city,
    };

    if (userId !== parseInt(id)) {
      const track = await trackService.getTrack(parseInt(id), req.user.id);
      Object.assign(respObj.account, { track });
    }
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, respObj);
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});
account.get("/followers/:id", async (req, res) => {
  // find all of the follwers and return them as a list of ids
  const id = req.params.id;
  try {
    const account = await accountService.getFollowerAndLocation(parseInt(id));

    if (!account) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }

    const followers = account?.followers?.map(Account.sanatizePublic) || [];
    res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      followers,
    });
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.get("/followings/:id", async (req, res) => {
  try {
    //find all of the follwers and return them as a list of ids
    const id = req.params.id;
    const accounts: Account[] = await accountService.getUsersWithFollowers();

    const followings = accounts.map((elem: any) => {
      return new Promise((resolve, reject) => {
        if (elem.followers.some((a: any) => a.id == id)) {
          resolve(Account.sanatizePublic(elem));
        } else {
          resolve(null);
        }
      });
    });

    Promise.all(followings)
      .then((result: any) => {
        res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
          followings: result.filter((x: any) => x),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.post("/login", async (req, res) => {
  try {
    const valid = await validate(req, res, Account.validateLogin);
    if (!valid) return;

    const { email, password } = req.body;

    const account = await accountService.getUserByEmail(email);
    if (!account)
      return unauthorized(res, {
        success: false,
        message: "Email address not found!",
      });

    const matches = await argon2.verify(account.password, password);

    if (!matches) return unauthorized(res, { message: "Invalid password!" });

    const token = jwt.sign({ id: account.id }, process.env.JWT_SECRET!);

    res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      account: Account.sanatize(account),
      token,
    });
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.get("/empowerone/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const account = await empowerOnesService.getEmpowerOneWithLocation(id);

    if (account) {
      res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
        empowerONE: account,
      });
    } else {
      res.locals.sendSuccess(successMessages.NO_CONTENT);
    }
  } catch (error) {
    console.log(error, "error");
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.get("/add_stripe/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const account = await accountService.getUserByCondition({
      where: { id },
    });
    if (!account) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }
    const stripeAccount = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: account.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: process.env.STRIPE_REFRESH_URL || "http://localhost:3000/",
      return_url: process.env.STRIPE_RETURN_URL || "http://localhost:3000/",
      type: "account_onboarding",
    });

    if (accountLink) {
      account.stripe_account = stripeAccount.id;
      await account.save();
    }

    res.locals.sendSuccess(successMessages.CREATED, {
      ...stripeAccount,
      ...accountLink,
    });
  } catch (error) {
    console.log(error, "error");
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.get("/stripe_dashboard/:stripeAccountId", async (req, res) => {
  const stripeAccountId = req.params.stripeAccountId;
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    res.locals.sendSuccess(successMessages.CREATED, loginLink);
  } catch (error) {
    console.log(error, "error");
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.post("/forgot-password", async (req, res) => {
  try {
    const valid = await validate(req, res, Account.validateForgotPassword);
    if (!valid) return;

    const { email } = req.body;

    const account = await accountService.getUserByEmail(email);
    if (!account)
      return unauthorized(res, { message: "Email address not found!" });

    let transport = nodemailer.createTransport({
      port: 587,

      host: "smtp-relay.sendinblue.com",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PWD!,
      },
    });

    const otp = generateOtp();

    let mailOptions = {
      from: "app@ampowerme.com",
      to: email,
      subject: "FORGET PASSWORD",
      html: "Your one time password to change password is " + otp,
    };

    account.otp = otp;
    await account.save();

    transport.sendMail(mailOptions, async (err, result) => {
      if (err) {
        return res.locals.sendError(errorMessages.FAILED_TO_SEND_EMAIL);
      } else {
        return res.locals.sendSuccess({
          code: 200,
          message: `Email sent to ${email}`,
        });
      }
    });
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.post("/verify-otp", async (req, res) => {
  try {
    const valid = await validate(req, res, Account.validateVerifyOtp);
    if (!valid) return;

    const { email, otp } = req.body;

    const account = await accountService.getUserByEmail(email);
    if (!account) return res.locals.sendError(errorMessages.EMAIL_NOT_FOUND);

    if (parseInt(otp) !== Number(account?.otp)) {
      return res.locals.sendError(errorMessages.OTP_NOT_VERIFIED);
    } else {
      account.otp = 0;
      await account.save();
      return res.locals.sendSuccess(successMessages.OTP_VERIFIED);
    }
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.post("/reset-password", async (req, res) => {
  try {
    const valid = await validate(req, res, Account.validateResetPassword);
    if (!valid) return;

    const { email, password } = req.body;

    const account = await accountService.getUserByEmail(email);
    if (!account)
      return unauthorized(res, { message: "Email address not found!" });

    account.password = await argon2.hash(password);
    await account.save();

    return res.locals.sendSuccess(successMessages.UPDATED);
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.post("/signup", uploadImage.single("file"), async (req, res) => {
  try {
    const valid = await validate(req, res, Account.validateRegister);
    if (!valid) return;
    const file = req.file;
    if (!file) {
      return res.locals.sendError(errorMessages.FILE_NOT_PROVIDED);
    }
    const customer = await stripe.customers.create({
      email: req.body.email,
      name: `${req.body.firstName} ${req.body.lastName}`,
    });
    const result = await uploadOnS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );
    if (result.status !== 200)
      return res.locals.sendError(errorMessages.FILE_NOT_UPLOADED);
    req.body.password = await argon2.hash(req.body.password);
    req.body.pfp = result.url;
    const account = new Account();

    if (req.body.referralCode) {
      let account: any = await accountService.getAccount({
        referralCode: req.body.referralCode,
      });

      if (!account) {
        return res.locals.sendError(errorMessages.INVALID_CODE);
      } else {
        const rewardCoins = await Account.generateRewardCoin(
          req.body.referralCode
        );
        if (rewardCoins > 0) {
          Account.update(account?.id, {
            power: parseFloat(account.power) + rewardCoins,
          });
          AppIOManager.send("powerIncrease", account.id.toString(), {
            data: account.power,
          });
          req.body["usedReferralCode"] = req.body.referralCode;
        }
      }
    }

    const { country, state, city } = req.body;

    if (country) {
      const newCountry = await countryService.saveCountryIfNotExist(country);
      req.body["country"] = newCountry.id;
    }

    if (state) {
      const newState = await stateService.saveStateIfNotExist({
        country: req.body["country"],
        name: state,
      });
      req.body["state"] = newState.id;
    }

    if (city) {
      const newCity = await cityService.saveCityIfNotExist({
        country: req.body["country"],
        state: req.body["state"],
        name: city,
        power: 0,
      });
      req.body["city"] = newCity.id;
    }

    req.body["referralCode"] = Date.now().toString();
    console.log("body", req.body);
    Object.assign(account, req.body);

    const lowestChild = await Group.createGroupsIfNotExist([
      country,
      state,
      city,
    ]);

    // add new user to group
    account.group = lowestChild;
    if (!customer) {
      return res.locals.sendError(errorMessages.STRIPE_CUSTOMER_ERROR);
    }
    account.stripe_id = customer?.id;
    await account.save();

    const token = jwt.sign({ id: account.id }, process.env.JWT_SECRET!);
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      account: Account.sanatize(account),
      token,
      customer,
    });
  } catch (error) {
    console.log(error, "ERROR");
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

account.put(
  "/password",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const userId = (req?.user as any)?.id;
      if (typeof userId == "undefined") {
        return unauthorized(res, { message: "No user found!", success: false });
      }

      const valid = req.body.oldPassword && req.body.newPassword;
      if (!valid) {
        return res.locals.sendError(errorMessages.MISSING_PASSWORD);
      }

      const { oldPassword, newPassword } = req.body;
      const user = await accountService.getAccount({
        id: userId,
      });
      if (!user) {
        return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
      }
      const matches = await argon2.verify(user.password, oldPassword);
      if (!matches) {
        return res.locals.sendError(errorMessages.INCORRECT_PASSWORD);
      }
      user.password = await argon2.hash(newPassword);
      await user.save();
      return res.locals.sendSuccess(successMessages.PASSWORD_UPDATED);
    } catch (error) {
      res.locals.sendError(errorMessages.SERVER_ERROR, error);
    }
  }
);

account.put(
  "/pfp",
  requireAuth,
  // uploadImage.single("file"),
  FileMulter.single("file"),
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.locals.sendError(errorMessages.FILE_NOT_PROVIDED);
      }
      const result = await uploadOnS3(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      console.log("result", result);
      const id = (req?.user as any)?.id;
      if (typeof id == "undefined") {
        return unauthorized(res, { message: "No user found!", success: false });
      }

      const account = await accountService.getUserByCondition({
        where: { id },
      });

      if (!account) {
        return unauthorized(res, { message: "No user found!", success: false });
      }
      account.pfp = result.url;
      await account.save();

      return res.locals.sendSuccess(successMessages.PFP_UPDATED, {
        pfp: result.url,
      });
    } catch (err) {
      console.log(err);
      return res.locals.sendError(errorMessages.SERVER_ERROR, err);
    }
  }
);

account.post("/follow", requireAuth, async (req, res) => {
  try {
    const payload = getJWTPayload(req, res);
    if (!payload?.id) return unauthorized(res, { message: "Invalid token!" });
    const userId = payload.id;
    const { id } = req.body;

    const account = await accountService.getUserWithFollowers(id);
    const myAccount = await getAccountFromJWT(req, res);
    if (userId == id) {
      return unauthorized(res, { message: "You cannot follow yourself!" });
    }
    if (!account) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }

    if (!myAccount) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }

    const extFollowers = await accountService.getUsersByIdAndFollowers(id);
    const success = await account.addFollower(myAccount, extFollowers);
    if (!success) {
      return unauthorized(res, { message: "Already following!", success });
    }
    res.locals.sendSuccess(successMessages.FOLLOWED, {
      success,
    });
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

account.delete("/follow", requireAuth, async (req, res) => {
  try {
    const { id } = req.body;
    const account = await accountService.getUserWithFollowers(id);

    const myAccount = await getAccountFromJWT(req, res, ["followers"]);

    if (!myAccount || !account) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }
    const success = await account.removeFollower(myAccount);
    if (!success) {
      return unauthorized(res, { message: "Not following!", success });
    }
    res.locals.sendSuccess(successMessages.UNFOLLOWED, {
      success,
    });
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

account.put(
  "/profile",
  requireAuth,
  async (req: IGetUserAuthInfoRequest, res) => {
    try {
      const userId = (req?.user as any)?.id;
      if (!userId) {
        return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
      }
      const { country, state, city } = req.body;
      if (country) {
        const newCountry = await countryService.saveCountryIfNotExist(country);
        req.body["country"] = newCountry.id;
      }

      if (state) {
        const newState = await stateService.saveStateIfNotExist({
          country: req.body["country"],
          name: state,
        });
        req.body["state"] = newState.id;
      }

      if (city) {
        const newCity = await cityService.saveCityIfNotExist({
          country: req.body["country"],
          state: req.body["state"],
          name: city,
          power: 0,
        });
        req.body["city"] = newCity.id;
      }

      if (req.body && Object.entries(req.body).length > 0) {
        await Account.update(userId, req.body);
      }
      const account = await accountService.getAccount({ id: userId });
      if (!account) {
        return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
      }
      return res.locals.sendSuccess(successMessages.PROFILE_UPDATED, {
        account: Account.sanatize(account),
      });
    } catch (error) {
      console.log(error, "ERROR");
      res.locals.sendError(errorMessages.SERVER_ERROR, error);
    }
  }
);
