import { Repository, createConnection, getRepository } from "typeorm";

import ormconfig from "../../ormconfig";
import { CommentEmpower } from "../../entities/CommentEmpower";

class EmpowerService {
    private empowerRepository: Repository<CommentEmpower>;

    constructor() {
        createConnection(ormconfig)
        this.empowerRepository = getRepository(CommentEmpower);
    }

    async getEmpowerWithMinute(id: string) {
        return await this.empowerRepository.createQueryBuilder("commentEmpower")
            .where(
                "commentEmpower.id=:id AND commentEmpower.createdAt >=:createdAt",
                {
                    id: id,
                    createdAt: new Date(Date.now() - 1000 * 60),
                }
            )
            .getOne();
    }
}


export const empowerService = new EmpowerService()
