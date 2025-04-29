import { Router } from "express";
import {
        UserRegister,
        userLogin,
        userLogout,
        refreshAccessToken,
        ChangeCurrentPassword,
        GetCurrentUser,
        UpdateAccountDetail,
        UpdateUserAvatar,
        UpdateCoverImage,
        GetUserChannelProfile,
        getWatchHistory
    } from "../controllers/user.controllers.js";
import {uploadUsingMulter} from "../middlewares/multer.middleware.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"


const userRouter = Router()

userRouter.route("/register").post( 
    uploadUsingMulter.fields(
        [
            {
                name:"avatar",
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
        ]
    )
     ,UserRegister
    )

userRouter.route("/login").post(userLogin)

// secured routes 
userRouter.route("/logout").post(verifyJwt , userLogout)
userRouter.route("/refreshToken").post(refreshAccessToken)

userRouter.route("/changeCurrentPassword").post(verifyJwt,ChangeCurrentPassword)

userRouter.route("/getCurrnetUser").get(verifyJwt,GetCurrentUser)

userRouter.route("/updateAccountDetails").patch(verifyJwt,UpdateAccountDetail)

userRouter.route("/updateAvatarImage").patch(verifyJwt,uploadUsingMulter.single("avatar"), UpdateUserAvatar)

userRouter.route("/changeCoverImage").patch(verifyJwt,uploadUsingMulter.single("coverImage"),UpdateCoverImage)

userRouter.route("/channel/:username").get(verifyJwt , GetUserChannelProfile)

userRouter.route("/getWatchHistory").get(verifyJwt,getWatchHistory)


export {userRouter}