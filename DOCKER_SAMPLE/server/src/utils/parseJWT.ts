import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { Account } from '../entities/Account';
import { unauthorized } from '../routes/utils/unauthorized';

export const parseJWT = (
    cookies: string,
    identifier: string = 'token'
): { id: string } => {
    //find the authorization cookie
    const authorization = cookies
        .split(';')
        .find((c) => c.trim().startsWith(`${identifier}=`));
    if (!authorization) {
        throw new Error('Not authenticated');
    }
    const token = authorization.split('=')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET as string, {
        ignoreExpiration: true,
    });

    return payload as any;
};
export type JWTPayload =
    | Partial<{
          id: number;
          iat: number;
      }>
    | undefined;
export const getJWTPayload = (
    req: Request,
    res: Response
): JWTPayload | void => {
    const auth = req?.headers?.authorization;
    if (!auth) {
        return unauthorized(res, { message: 'No authorization header found!' });
    }
    const token = auth.split(' ')[1];

    if (!token)
        return unauthorized(res, {
            message: 'Malformed authorization header!',
        });

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!payload?.id) return unauthorized(res, { message: 'Invalid token!' });

    return payload;
};

export const getAccountFromJWT = async (
    req: Request,
    res: Response,
    relations?: string[]
): Promise<Account | void> => {
    const payload = getJWTPayload(req, res);
    if (!payload?.id) return unauthorized(res, { message: 'Invalid token!' });
    const id = payload.id;
    const account = await Account.findOne({
        relations,
        where: {
            id,
        },
    });
    return account as Account;
};
