import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";


export const verifyJwt = asyncHandler(async (req, res, next) => {
     try {
        const token =  req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1]

        
        if (!token) {
          throw new ApiError(400,"Unauthorized")
        }

        const decoded =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded._id).select("-password -refreshToken")

        if (!user) {
             throw new ApiError(401, "Unauthorized Request") 
        }

        req.user = user
        next()
     } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while verifying JWT")
     }
})