import { NextFunction, Request, Response } from "express";

import { successMessages, errorMessages } from "./responseMessages";

interface ResponseData {
  code: number;
  message: string;
  data?: any;
}

// Send success response
function sendSuccess(res: Response, data: ResponseData): void {
  console.log("data===>", data);
  res
    .status(data.code)
    .json({ success: true, message: data.message, data: data.data });
}

// Send error response
function sendError(res: Response, data: ResponseData): void {
  res
    .status(data.code)
    .json({ success: false, message: data.message, error: data?.data ?? {} });
}

// Add common API response messages and functions to res.locals
export const setCommonAPIResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.successMessages = successMessages;
  res.locals.errorMessages = errorMessages;

  res.locals.sendSuccess = (
    response: { code: number; message: string },
    data: any
  ) => {
    sendSuccess(res, { ...response, data });
  };
  res.locals.sendError = (
    response: { code: number; message: string },
    data?: any
  ) => {
    sendError(res, { ...response, data });
  };
  next();
};
