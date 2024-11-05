import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { Track } from "../../entities/Track";
import { Account } from "../../entities/Account";
import { PowerTransaction } from "../../entities/PowerTransactions";
import { Video } from "../../entities/Video";
import { City } from "../../entities/City";
import { State } from "../../entities/State";

class TrackService {
    private trackRepository: Repository<Track>;

    constructor() {
        createConnection(ormconfig)
        this.trackRepository = getRepository(Track);
    }

    getTrack(id: number, uId: number): Promise<Track | null> {
        return this.trackRepository.createQueryBuilder("track")
            .where("track.account =:id AND track.tracker =:uId", { id, uId }).
            getOne();
    }

    getMyTracks(uId: number, skip: number, take: number): Promise<[Track[], number]> {
        return this.trackRepository.createQueryBuilder("track")
            .skip(skip)
            .limit(take)
            .leftJoinAndMapOne(
                "track.account",
                Account,
                "account",
                "account.id = track.account"
            )
            .leftJoinAndMapOne("account.city", City, "city", "account.city = city.id")
            .leftJoinAndMapOne(
                "account.state",
                State,
                "state",
                "account.state = state.id"
            )
            .select([
                "track",
                "account.id",
                "account.firstName",
                "account.lastName",
                "account.power",
                "account.followerCount",
                "account.pfp",
                "city",
                "state",
            ])
            .where("track.tracker =:userId", { userId: uId })
            .getManyAndCount();
    }

    async trackerVideos(userId: number, skip: number, take: number) {
        const query = this.trackRepository.createQueryBuilder("track")
            .leftJoinAndMapMany(
                "track.account",
                Account,
                "account",
                "account.id = track.account"
            )
            .leftJoinAndMapMany(
                "account.empower",
                PowerTransaction,
                "empower",
                "empower.userId = account.id AND empower.type =:type",
                { type: "addPowerToVideo" }
            )
            .leftJoinAndMapOne(
                "empower.video",
                Video,
                "video",
                "video.id = empower.videoId AND video.power > video.powerTransferred"
            )
            .leftJoinAndMapMany(
                "video.powerEmpower",
                PowerTransaction,
                "powerEmpower",
                "powerEmpower.videoId =video.id AND powerEmpower.userId = account.id"
            )
            .where("track.tracker =:id", { id: userId })
            .andWhere("empower.id IS NOT NULL")
            .andWhere("video.id IS NOT NULL")
            .select([
                "track",
                "account.id",
                "account.email",
                "account.firstName",
                "account.lastName",
                "account.pfp",
                "account.isAdmin",
                "empower",
                "video",
                "SUM(powerEmpower.powerTransferred) as totalPower",
            ])
            .orderBy("totalPower", "DESC")
            .distinctOn(["(empower.userId, empower.videoId ), totalPower"])
            .addGroupBy("account.id, track.id, empower.id, video.id");
        return {
            count: (await query.getRawMany()).length,
            videos: await query.offset(skip).limit(take).getRawMany(),
        }
    }
}

export const trackService = new TrackService()
