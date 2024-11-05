import { FindOperator, ILike } from 'typeorm';

export const buildILikeQuery = (query: { [key: string]: string }) => {
    const keys = Object.keys(query);
    const iLikeQuery: { [key: string]: FindOperator<string> } = {};
    keys.forEach((key) => {
        iLikeQuery[key] = ILike(`%${query[key].trim()}%`);
    });
    return iLikeQuery;
};
