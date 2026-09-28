import {asyncHandler} from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import ApiError  from "../utils/apiError";
import {User} from "../models/user.model";
import { TokenPayload } from "../types/jwt";

export const verifyJwt = asyncHandler (async (req,res,next) => {
try {
        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "");
    
        if (!token){
            throw new ApiError (401 , "Access denied , no token provided");
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET as string) as TokenPayload;
    
        const user  = await User.findById(decodedToken?.userId).select("-password -refreshToken");
        if(!user){
            throw new ApiError (401 , "Invalid token , user not found");
    
        }
        req.user = user;
        next();
} catch (error) {
    throw new ApiError (401 , (error instanceof Error && error.message) ||"Invalid token");
}


})