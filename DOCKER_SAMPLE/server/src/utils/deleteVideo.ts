import { Comment } from "../entities/Comment";
import { CommentEmpower } from "../entities/CommentEmpower";
import { PowerTransaction } from "../entities/PowerTransactions";
import { SpecialPowerTransaction } from "../entities/SpecialPowerTransaction";
import { Video } from "../entities/Video";
import { deleteOnS3 } from "../multer/s3";
import {
  errorMessages,
  successMessages,
} from "../routes/utils/responseMessages";

export const deleteVideo = async (videoId: string) => {
  let result, error;
  try {
    const id = videoId;
    let video = await Video.find({ where: { id: id } });
    if (!video) {
      error = errorMessages.VIDEO_NOT_FOUND;
      result = null;
      return { error, result };
    }

    const comments = await Comment.createQueryBuilder("comment")
      .leftJoinAndSelect("comment.video", "video")
      .where("video.id = :id", { id: id })
      .getMany();

    const powerTransactions = await PowerTransaction.find({
      where: { videoId: id },
    });

    const specialPowerTransactions = await SpecialPowerTransaction.find({
      where: { videoId: id },
    });

    if (comments?.length) {
      comments.forEach(async (comment: any) => {
        await CommentEmpower.delete({ comment: comment.id });
        await Comment.delete(comment.id);
      });
    }
    if (powerTransactions?.length) {
      powerTransactions.forEach(async (video: any) => {
        await PowerTransaction.delete(video.id);
      });
    }
    if (specialPowerTransactions?.length) {
      specialPowerTransactions.forEach(async (video: any) => {
        await SpecialPowerTransaction.delete(video.id);
      });
    }
    await Video.delete(id);
    await deleteOnS3(id);
    result = successMessages.DELETED;
    error = null;
    return { result, error };
  } catch (err) {
    error = errorMessages.SERVER_ERROR;
    result = null;
    return { result, error };
  }
};
