import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(config);

export const uploadOnS3 = async (
  data: Buffer,
  filename: string,
  mimeType?: string
) => {
  const params: any = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: data,
    Key: `uploads/${uuidv4()}-${filename}`,
    // ACL: 'public-read'
  };

  if (mimeType) {
    params.ContentType = mimeType;
  }

  const file = await s3Client.send(new PutObjectCommand(params));
  return {
    status: file?.$metadata?.httpStatusCode,
    url: process.env.AWS_IMAGE_URL + params.Key,
  };
};

export const deleteOnS3 = async (id: string) => {
  const params: any = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: id,
  });

  try {
    await s3Client.send(params);
    console.log("file deleted Successfully");
  } catch (err) {
    console.log(err, "ERROR in file Deleting : " + JSON.stringify(err));
  }
};
