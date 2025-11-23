import {asynchHandler} from "express-async-handler";
import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import User from "../models/user.model.js";

export const verifyJwt = asynchHandler (async (req,res,next) => {
try {
        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "");
    
        if (!token){
            throw new apiError (401 , "Access denied , no token provided");
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
    
        const user  = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new apiError (401 , "Invalid token , user not found");
    
        }
        req.user = user;
        next();
} catch (error) {
    throw new apiError (401 , error?.message ||"Invalid token");
}


})