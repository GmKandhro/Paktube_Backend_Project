import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like: total video views, total subscribers, total videos, total likes etc.

  const totalViewsAndLikes = await Video.aggregate([
    {
        $match:{
            owner:new mongoose.Types.ObjectId(req?.user?._id)
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
            likes:{
                $size:"$likes"
            }
        }
    },
    {
        $group:{
            _id: null, // sabko ek group mein dal diya
            totalViews: { $sum: "$views" },    // sab videos ke views add karo
            totalLikes: { $sum: "$likes" },     // sab videos ke likes add karo
        }
    }
  ])


  const totalVideos = await Video.aggregate([
    {
        $match:{
            owner:new mongoose.Types.ObjectId(req?.user?._id)
        }
    },
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
                {
                    $project:{
                        avatar:1,
                        username:1
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
                $arrayElemAt:["$owner",0]
            },
            likes:{
                $size:"$likes"
            }
        }
    }
  ])

  const totalSubscribers = await Subscription.find({channel:req.user._id}).countDocuments()


  const stats = totalViewsAndLikes[0] || { totalViews: 0, totalLikes: 0 };
  


  const dashboardData = {
    videos:totalVideos,
    totalSubscribers,
    totalViews : stats.totalViews,
    totalLikes : stats.totalLikes,
  }


    return res.status(200).json(
        new ApiResponse(200,dashboardData ,"The backend stats are fetched successfull")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    
    let {page = 1, limit = 10} = req.query

    const videos = await Video.aggregate([
        {
            $match:{
                owner: req.user._id
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },
        {
            $lookup:{
                from:"users",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
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
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $arrayElemAt: ["$owner", 0] 
                },
                likes:{
                    $size:"$likes"
                }
            }
        },
        {
            $project:{
                title:1,
                description:1,
                thumbnail:1,
                videoFile:1,
                createdAt:1,
                updatedAt:1,
                owner:1,
                likes:1
            }
        },

    ])
    if (!videos.length) {
        throw new ApiError(400, "No videos found")
    }
    
    return res.status(200).json(
        new ApiResponse(200,videos,"Channel videos are fetched successfull")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }