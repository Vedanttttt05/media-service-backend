import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const asyncHandler = (requestHandler: AsyncRequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
    };
};

export {asyncHandler}
