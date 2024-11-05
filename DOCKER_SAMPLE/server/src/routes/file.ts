import { Request, Response, Router } from "express";
import fs from "fs";
import { nanoid } from "nanoid";

import { errorMessages, successMessages } from "./utils/responseMessages";
import { s3Uploadv3ForBase64 } from "../multer/uploadImages";
export const file = Router();

const ensureDirectoryExists = (filePath: string) => {
  console.log("PATH: ", filePath);

  const result = fs.mkdirSync(`/usr/app/public/${filePath}`, {
    recursive: true,
  });
  console.log("RESULT: ", result);
};

const detectMimeType = (filePath: string): string | null => {
  const signatures: { [key: string]: string } = {
    J: "pdf",
    R: "gif",
    i: "png",
    U: "webp",
    "/": "jpg",
  };
  const sig = signatures[filePath.substring(0, 1)];
  if (!sig) return null;
  return sig;
};

export const writeFileSimple = (
  file: NodeJS.ArrayBufferView | string,
  fileName: string
) => {
  try {
    fs.writeFileSync(`/usr/app/public/${fileName}`, file);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const writeFile = (fileData: string, extension: string) => {
  const body = removeHeaderFromBase64(fileData);
  const file = Buffer.from(body, "base64");
  const fileName = `${nanoid(12)}.${extension}`;
  const success = writeFileSimple(file, fileName);
  if (!success) return "";

  return `/api/file/${fileName}`;
};

export const writeFileAndUploadToAWS = async (
  fileData: string,
  extension: string
) => {
  const body = removeHeaderFromBase64(fileData);
  const file = Buffer.from(body, "base64");
  console.log("file", file);
  const fileName = `${nanoid(12)}.${extension}`;
  const result: any = await s3Uploadv3ForBase64(file, fileName);
  if (result.status !== 200) return "";
  return result.url;
};

const removeHeaderFromBase64 = (base64: string): string => {
  let body = "";
  if (base64.includes(",")) {
    body = base64.split(",")[1];
  } else {
    body = base64;
  }
  return body;
};

const validatePath = (req: Request, res: Response): string | null => {
  const params = req.params as any;
  if (!params.path) {
    return res.locals.sendError(errorMessages.PATH_REQUIRED);
  }

  return params.path;
};

file.get("/:path", (req, res) => {
  try {
    const path = validatePath(req, res);
    if (!path) {
      return res.locals.sendError(errorMessages.PATH_REQUIRED);
    }
    //make sure file exists
    if (!fs.existsSync(`/usr/app/public/${path}`)) {
      //* Switch to using a 404 page
      return res.locals.sendError(errorMessages.FILE_NOT_EXISTS);
    }
    res.sendFile(path, { root: "/usr/app/public" });
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

file.delete("/:path", (req, res) => {
  try {
    const path = validatePath(req, res);
    if (!path) {
      return res.locals.sendError(errorMessages.PATH_REQUIRED);
    }
    fs.unlinkSync(`/usr/app/public/${path}`);
    res.locals.sendSuccess(successMessages.DELETED);
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

file.post("/", (req, res) => {
  try {
    if (!req.body.file) {
      return res.locals.sendError(errorMessages.FILE_NOT_PROVIDED);
    }
    if (!req.body.extension) {
      return res.locals.sendError(errorMessages.EXTENTION_REQUIRED);
    }
    const file = writeFile(req.body.file, req.body.extension);
    if (!file) {
      return res.locals.sendError(errorMessages.WRITE_FILE_ERROR);
    }
    res.json({ file });
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});

file.get("/upload/:path", (req, res) => {
  try {
    const path = validatePath(req, res);
    if (!path) {
      return res.locals.sendError(errorMessages.PATH_REQUIRED);
    }
    //make sure file exists
    if (!fs.existsSync(`/usr/app/public/${path}`)) {
      //* Switch to using a 404 page
      return res.locals.sendError(errorMessages.FILE_NOT_EXISTS);
    }
    res.sendFile(path, { root: "./public" });
  } catch (err) {
    res.locals.sendError(errorMessages.SERVER_ERROR, err);
  }
});
