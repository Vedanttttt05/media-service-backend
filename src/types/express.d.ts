import { HydratedDocument, Types } from "mongoose";
import { UserDocument } from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            // set by verifyJwt
            user?: UserDocument;
            // set by verifyOwnership
            resource?: HydratedDocument<{ owner: Types.ObjectId }>;
        }
    }
}

export {};
