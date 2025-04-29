import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { CookiesOptions } from "../constants.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";



const generateAccessTokenAndRefrsehToken =  async (userId)=>{
    try {
        const user = await User.findById(userId)
        // console.log(user);
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefrehToken()

         user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken , refreshToken } 
    } catch (error) {
        throw new ApiError(500, error.message || "Something want srong while generating Acccess and Refresh tokens")
    }
}

const UserRegister = asyncHandler(async (req,res)=>{
        // get user data from frontend ✅
        // validation -- not empty any feild✅
        // check if user already exists- username and email✅
        // check for images -- check for avatar ✅
        // upload them to cloudinary again check avatar ✅
        // create user object -- create a enty in db ✅
        // check user ✅
        // remove password and refresh token ✅
        // return res✅

        const {fullName, email, username,password}= await req.body 
        console.log(req.files);
        // validation
        if(!fullName ||  !email || !username || !password){
            throw new ApiError(400,"All fields are required ")
        }

        const userExits = await User.findOne({
            $or:[{email},{username}]
        })

        if(userExits){
            throw new ApiError(400, "user alredy exists with this username or email")
        }

        
        const avatarLocalFilePath = req?.files?.avatar[0]?.path
        
        
        let coverImage;
        if(req?.files?.coverImage){
            const coverImageLocalFilePath = req?.files?.coverImage[0]?.path
            coverImage =  await uploadOnCloudinary(coverImageLocalFilePath)
        }

        // console.log("coverImageLocalFilePath ",req?.files?.coverImage[0]?.path);
        
        if(!avatarLocalFilePath){
            throw new ApiError(409, "Avatar file is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalFilePath)
         
        
       console.log("avatar",avatar);

       if(!avatar){
        throw new ApiError(409, "Avatar file is not uploading")
       }
       


       const user = await User.create(
            {
                fullName,
                email,
                username : username.toLowerCase(),
                password,
                avatar: avatar.url,
                coverImage : coverImage?.url || ""     
            }
        )

        const createdUser = await User.findById(user._id).select("-password -refreshToken")
       
        if(!createdUser){
            throw new ApiError(500, "SomeThing want wrong while creating user")
        }

        return res.status(201).json(new ApiResponse(200, createdUser , "The user registered successfully"))
})

// userlogin
const userLogin  = asyncHandler(async(req,res)=>{
    // req.doby === data 
    // username and email login system
    // find user 
    // password check 
    // generate access and refresh tokens
    // send cookies with response 

    const {email , username,password}  = req.body

    if(!email && !username){
        throw new ApiError(409,"username or email is required")
    }

    if(!password){
        throw new ApiError(409,"password is required")  
    }

    // find user 
    const user = await User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError(400,"UnValid Credentials")
    }

    const isPasswordValid =await user.isPasswordCorrect(password);

    // console.log(isPasswordValid);
    

    if(!isPasswordValid){
        throw new ApiError(400,"UnValid Credentials")
    }

    const {accessToken , refreshToken} = await  generateAccessTokenAndRefrsehToken(user._id)

    const loggedInUser =await User.findById(user._id).select("-password -refreshToken")


    return res.status(200)
    .cookie("accessToken",accessToken, CookiesOptions)
    .cookie("refreshToken",refreshToken, CookiesOptions)
    .json(
        new ApiResponse(200, {
            user:loggedInUser,
            accessToken:accessToken
        },"user logged in successfull")
    )

})

// userlogout
const userLogout  = asyncHandler(async(req,res)=>{
 
         await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:""
            }
        },
        {
            new:true
        }
    )

    

    return res.status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(
        new ApiResponse(200, {},"user logged out successfull")
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)


    if(!decodedToken){
        throw new ApiError(401,"unAuthorized Request")
    }

    const user = await User.findById(decodedToken._id)

    if(!user){
        throw new ApiError(401,"Invalid refresh Token")
    }

    // console.log(user.refreshToken);
    
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh Token is expired or used")
    }

    const {accessToken , refreshToken } = await generateAccessTokenAndRefrsehToken(user._id)

    res
    .status(200)
    .cookie("accessToken",accessToken, CookiesOptions)
    .cookie("refreshToken",refreshToken, CookiesOptions)
    .json(
        new ApiResponse(200, {accessToken} , "Access token refreshed successfulll")
    )
})

const ChangeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword, confPassword} = req.body

    if(!oldPassword || !newPassword || !confPassword){
        throw new ApiError(400,"all fields are required")
    }
    if(newPassword !== confPassword){
        throw new ApiError(400,"Passwords does not match")
    }

    const user = await User.findById(req.user._id)
    
    if(!user){
        throw new ApiError(409 ,"user does not found")
    }
    
    const isPasswordValid = user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400 , "Password does not correct")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200,"Password Changed successfull")
    )

})

const GetCurrentUser = asyncHandler(async (req,res)=>{
    const user = req.user

    return res.status(200).json(
        new ApiResponse(200,{user}, "Current User fetched Successfull")
    )
})


const UpdateAccountDetail = asyncHandler(async (req,res)=>{
    const {email,fullName} = req.body

    if(!email.trim() || !fullName.trim()){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new : true
        }
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(400,"data does not updated")
    }

    return res.status(200).json(
        new ApiResponse(200,user,"Account detail updated successfull")
    )
})

const UpdateUserAvatar = asyncHandler(async(req,res)=>{

   const localFilePath =  req?.file?.path

//    Assignment Completed 
   const public_id_of_old_avatar = req?.user?.avatar?.split("/")[7]?.split(".")[0]
   await deleteFromCloudinary(public_id_of_old_avatar)
   if(!localFilePath){
    throw new ApiError(400,"Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(localFilePath)

//    console.log(avatar);
   
   if(!avatar?.url){
    throw new ApiError(400,"Error while uploading on avatar")
   }

   const user = await User.findByIdAndUpdate(
    req.user._id, 
    {
        $set:{
            avatar: avatar.url
        }
    },
    {new:true}
   ).select("-password")

   return res
    .status(200)
    .json(
        new ApiResponse(200, user.avatar, "Avatar image updated successfully")
    )
   
})


const UpdateCoverImage = asyncHandler(async(req,res)=>{
    const localFilePath =  req?.file?.path
    console.log(localFilePath);
    
    //    Assignment Completed 
   const public_id_of_old_coverImage = req?.user?.coverImage?.split("/")[7]?.split(".")[0]
   await deleteFromCloudinary(public_id_of_old_coverImage)
    
    if(!localFilePath){
     throw new ApiError(400,"coverImage file is missing")
    }
 
    const coverImage = await uploadOnCloudinary(localFilePath)
    console.log(coverImage);
    
    if(!coverImage?.url){
     throw new ApiError(400,"Error while uploading of coverImage")
    }
 
    const user = await User.findByIdAndUpdate(
     req.user._id, 
     {
         $set:{
             coverImage: coverImage.url
         }
     },
     {new:true}
    ).select("-password")
 
    return res
     .status(200)
     .json(
         new ApiResponse(200, user.coverImage, "coverImage image updated successfully")
     )
    
 })


const GetUserChannelProfile = asyncHandler(async (req,res)=>{
    const {username} = req?.params

    // console.log(username);
    

    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                foreignField:"channel",
                localField:"_id",
                as:"Subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                foreignField:"subscriber",
                localField:"_id",
                as:"SubscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount : {
                    $size : "$Subscribers"
                },
                subscribedToCount : {
                    $size : "$SubscribedTo"
                },
                isSubscribed:{
                    $cond : {
                        if:{$in : [req?.user?._id , "$Subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                username:1,
                fullName:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400, "channel does not exists")
    }

    // console.log("channel",channel);
    

    return res.status(200).json(
        new ApiResponse(200, channel[0] , "User channel profile fetched successfull")
    )
})

const getWatchHistory = asyncHandler(async (req,res)=>{
    
    const user = await User.aggregate([ 
        {
            $match:{
                 _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                   
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"video",
                            as:"likes"
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            },
                            likes:{
                                $size:"$likes"
                            }
                           
                        }
                    }
                ]
            }
        },
    ])

    if(!user?.length){
        throw new ApiError(400, "user does not exists")
    }
   
    
    
    return res.status(200).json(
        new ApiResponse(200, user[0].watchHistory , "Watch history fetched successfull")
    )
})


export {
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
}