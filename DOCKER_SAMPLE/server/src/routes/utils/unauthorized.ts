import { Response } from 'express';

export const unauthorized = (res: Response, body: any = {}) => {
    res.status(401).json({
        success: false,
        message: 'Unauthorized',
        data: body
    });
};
