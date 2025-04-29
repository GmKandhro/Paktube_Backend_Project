import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is missing or uncorrect")
    }

    const isLiked = await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })

    let liked;
    if(!isLiked){
        await Like.create({
            video:videoId,
            likedBy:req.user._id 
        })
        liked= true
    }else{
        await Like.findOneAndDelete({
            video:videoId,
            likedBy:req.user._id 
        })
        liked= false
    }

    
    return res.status(200).json(
        new ApiResponse(200, liked , `Video ${liked ? "liked" :"unLiked"}`)
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"commentId is missing or uncorrect")
    }

    const isLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    let liked;
    if(!isLiked){
        await Like.create({
            comment:commentId,
            likedBy:req.user._id 
        })
        liked= true
    }else{
        await Like.findOneAndDelete({
            comment:commentId,
            likedBy:req.user._id 
        })
        liked= false
    }

    
    return res.status(200).json(
        new ApiResponse(200, liked , `Comment ${liked ? "liked" :"unLiked"}`)
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"tweetId is missing or uncorrect")
    }

    const isLiked = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    let liked;
    if(!isLiked){
        await Like.create({
            tweet:tweetId,
            likedBy:req.user._id 
        })
        liked= true
    }else{
        await Like.findOneAndDelete({
            tweet:tweetId,
            likedBy:req.user._id 
        })
        liked= false
    }

    
    return res.status(200).json(
        new ApiResponse(200, liked , `Tweet ${liked ? "liked" :"unLiked"}`)
    )


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        
        {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"video",
                as:"videos",
                pipeline:[
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
                        },
                        isLiked:{
                            $cond:{
                                if: {$in : [req.user._id , "$likes.likedBy"]},
                                then: true,
                                else:false
                            }
                        }
                    }
                  }

                ]
            }
        },
        
        {
            $unwind: "$videos" // Flatten the array to get a single video object per like
        },
        {
            $replaceRoot: {
                newRoot: "$videos" // Replace the root with the video document
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"owner",
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
        }
    ])

    

    return res.status(200).json(
        new ApiResponse(200, likedVideos,"liked Videos are fetched Success full")
    )


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}