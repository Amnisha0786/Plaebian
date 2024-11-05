import { Repository, createConnection, getRepository } from "typeorm";

import { Comment } from "../../entities/Comment";
import ormconfig from "../../ormconfig";
import { CommentEmpower } from "../../entities/CommentEmpower";
import { Account } from "../../entities/Account";

class CommentService {
  private commentRepository: Repository<Comment>;

  constructor() {
    createConnection(ormconfig);
    this.commentRepository = getRepository(Comment);
  }

  addComment(data: any): Promise<Comment> {
    return Comment.save(data);
  }

  getAllComments(): Promise<[Comment[], number]> {
    return this.commentRepository.createQueryBuilder().getManyAndCount();
  }

  async getCommentsWithEmpowerCount(userId: any, skip: number, take: number) {
    return await Comment.createQueryBuilder("comment")
      .skip(skip)
      .take(take)
      .leftJoinAndMapMany(
        "comment.empower",
        CommentEmpower,
        "empower",
        "empower.comment = comment.id AND empower.account !=:userId",
        { userId }
      )
      .where("comment.account =:userId", { userId })
      .select([
        "comment",
        "CAST(SUM(empower.power) AS NUMERIC) as empower_power",
      ])
      .groupBy("comment.id")
      .orderBy("comment.createdAt", "DESC")
      .getRawMany();
  }

  async getCommentById(commentId: string) {
    return await this.commentRepository
      .createQueryBuilder("comment")
      .where("comment.id=:id", { id: commentId })
      .leftJoinAndMapOne(
        "comment.account",
        Account,
        "account",
        "account.id = comment.account"
      )
      .getOne();
  }

  async getCommentsByVideoId(
    video_id: string,
    skip: number,
    take: number,
    id?: number
  ) {
    return await this.commentRepository
      .createQueryBuilder("comment")
      .take(take)
      .skip(skip)
      .where("comment.video =:id", { id: video_id })
      .leftJoinAndMapOne(
        "comment.account",
        Account,
        "account",
        "account.id = comment.account"
      )
      .leftJoinAndMapMany(
        "comment.empower",
        CommentEmpower,
        "empower",
        "comment.id = empower.comment AND empower.account =:accountId AND empower.createdAt >=:cr",
        { accountId: id, cr: new Date(Date.now() - 1000 * 60) }
      )
      .select([
        "comment",
        "account.id",
        "account.email",
        "account.firstName",
        "account.lastName",
        "account.isAdmin",
        "account.country",
        "account.city",
        "account.state",
        // 'account.county',
        "account.pfp",
        "empower",
      ])
      .orderBy("comment.power", "DESC")
      .getManyAndCount();
  }

  saveComment(data: any): Promise<Comment> {
    return this.commentRepository.save(data);
  }

  getComment(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne({ where: { id } });
  }
}
export const commentService = new CommentService();
