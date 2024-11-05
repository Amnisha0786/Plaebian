import { Router } from "express";

import { errorMessages, successMessages } from "./utils/responseMessages";
import { priceService } from "./services/coinPrice";
import { formatNumberWithOneDecimal } from "../utils/common";
import { accountService } from "./services/account";
import { AppIOManager } from "../IO";
import { CoinPrice } from "../entities/CoinPrice";

export const price = Router();

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

price.post("/cashIn-payment", async (req, res) => {
  try {
    const { userId, price, coins } = req.body;
    const roundedAmount = +formatNumberWithOneDecimal(price) * 100;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CashIn Payment",
            },
            unit_amount_decimal: roundedAmount,
          },
          quantity: 1,
        },
      ],
      currency: "usd",
      success_url: `${process.env.SOCKET_URL}/success`,
      cancel_url: `${process.env.SOCKET_URL}/cancel`,
    });
    const user: any = await accountService.getAccount({
      id: userId,
    });
    if (!user) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }
    user.cashin_success = session.id;
    user.cashin_coins = coins;
    await user.save();
    res.locals.sendSuccess(successMessages.PAYMENT_PROCESS, {
      session,
    });
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

price.post("/cashin_success", async (req, res) => {
  const { userId, sessionId, coins } = req.body;

  const user: any = await accountService.getAccount({
    id: userId,
  });

  if (!user) {
    return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  try {
    if (session?.payment_status === "paid") {
      user.power = parseFloat(user.power) + parseFloat(coins);
      user.cashin_success = null;
      user.cashin_coins = 0;
      await user.save();

      AppIOManager.send("powerIncrease", user.id.toString(), {
        data: user.power,
      });
      return res.locals.sendSuccess(successMessages.PAYMENT_SUCCESSFULL, {
        user,
      });
    }
  } catch (error) {
    res.locals.sendError(errorMessages.PAYMENT_FAILED);
  }
});

price.get("/cash-in", async (req, res) => {
  try {
    const allCoins = await priceService.getPrice();
    if (!allCoins) {
      return res.locals.sendError(errorMessages.NOT_FOUND);
    }
    const cashInPrice = (allCoins[0]?.price / 100) * 110;
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      price: cashInPrice,
      appCoins: allCoins[0]?.appCoins,
    });
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

price.get("/cash-out", async (req, res) => {
  try {
    const allCoins = await priceService.getPrice();
    if (!allCoins) {
      return res.locals.sendError(errorMessages.NOT_FOUND);
    }
    const cashInPrice = (allCoins[0]?.price / 100) * 90;
    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, {
      price: cashInPrice,
    });
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});

price.post("/cashout_pay", async (req, res) => {
  const { amount, stripeAccountId, coins, userId, cashOut } = req.body;
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: "usd",
      destination: stripeAccountId,
    });

    const user: any = await accountService.getAccount({
      id: userId,
    });

    if (!user) {
      return res.locals.sendError(errorMessages.ACCOUNT_NOT_FOUND);
    }
    user.power = parseFloat(user.power) - cashOut;
    await user.save();

    await CoinPrice.createQueryBuilder()
      .update(CoinPrice)
      .set({ appCoins: coins })
      .execute();

    return res.locals.sendSuccess(successMessages.CONTENT_FOUND, transfer);
  } catch (error) {
    res.locals.sendError(errorMessages.SERVER_ERROR, error);
  }
});
