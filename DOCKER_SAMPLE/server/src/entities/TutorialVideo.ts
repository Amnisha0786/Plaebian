import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";

export type TutorialVideoType = {
  id?: string;
  url: string;
  title: string;
  thumbnail?: string;
  description: string;
  showToUser?: boolean;
  createdAt?: Date;
};

@Entity()
export class TutorialVideo extends BaseEntity implements TutorialVideoType {
  @PrimaryColumn()
  id!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  thumbnail!: string;

  @Column({ nullable: true })
  vimeoId!: string;

  @Column({ default: false })
  showToUser!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  static validate(video: TutorialVideo): string | null {
    if (!video.title) return "Title is required";
    if (!video.description) return "Description is required";
    return null;
  }

  static validatPowerAPI(body: any): string | null {
    if (!body.power) return "Power is required";
    if (!body.videoId) return "Tutorial Id is required";
    return null;
  }

  static sanatizePublic(video: TutorialVideo): TutorialVideoType {
    const copy = { ...video } as TutorialVideoType;
    return copy;
  }
}
