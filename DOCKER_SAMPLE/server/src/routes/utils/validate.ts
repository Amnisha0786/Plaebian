import { Request, Response } from 'express';

export const validate = async (
    req: Request,
    res: Response,
    callback: (...args: any[]) => string | null | Promise<string | null>
) => {
    const validationMessage = await callback(req.body);
    if (validationMessage) {
        res.locals.sendError({ code: 400, message: validationMessage })
        return false;
    }
    return true;
};
