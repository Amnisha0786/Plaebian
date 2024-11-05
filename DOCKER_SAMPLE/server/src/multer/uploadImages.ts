import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const storage = multer.memoryStorage();
const s3client = new S3Client({ region: process.env.AWS_REGION });

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new Error("file is not of the correct type"), false);
  }
};

export const s3Uploadv3 = async (file: any) => {

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/images/${uuidv4()}-${file.originalname}`,
    Body: file.buffer,
  };
  const result = await s3client.send(new PutObjectCommand(param));

  return {
    status: result?.$metadata?.httpStatusCode,
    url: process.env.AWS_IMAGE_URL + param.Key,
  };
};

export const s3Uploadv3Video = async (file: any) => {

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/video/${uuidv4()}-${file.originalname}`,
    Body: file.buffer,
  };
  const result = await s3client.send(new PutObjectCommand(param));
  //   console.log("result", result);
  return {
    status: result?.$metadata?.httpStatusCode,
    url: process.env.AWS_IMAGE_URL + param.Key,
  };
};

export const s3Uploadv3ForBase64 = async (file: any, fileName: any) => {
  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${uuidv4()}-${fileName}`,
    Body: file,
  };
  const result = await s3client.send(new PutObjectCommand(param));
  return {
    status: result?.$metadata?.httpStatusCode,
    url: process.env.AWS_IMAGE_URL + param.Key,
  };
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10, files: 2 },
});

export const uploadVideoWithAWS = multer({
  storage,
  //  fileFilter,
  limits: { fileSize: 1024 * 1024 * 4, files: 2 },
});
