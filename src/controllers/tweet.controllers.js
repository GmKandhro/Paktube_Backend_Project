import mongoose, { isValidObjectId, mongo } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
// import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // get data from req
    // validate data
    // create tweet
    // send response
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner:req.user._id
        }
    )

    if(!tweet){
        throw new ApiError(400,"Tweets could not created.")
    }

    return res.status(200).json(
        new ApiResponse(200,tweet,"Tweet created successful")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} = req.params

    const userTweets = await Tweet.aggregate(
        [
           { 
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
           }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
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
                            avatar:1,
                            username:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likes:{
                    $size:"$likes"
                },
                owner:{
                    $first:"$owner"
                }
            }
        }
        ]
    )


    // console.log(userTweets);
    
    console.log(userTweets);
    if(userTweets.length == 0){
       return res.status(200).json(
        new ApiResponse(200,"the user could not tweet yet..")
       )
    }

    

    return res.status(200).json(
        new ApiResponse(200, userTweets,"the user tweet fetched successfull")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // get new data {content} 
    // update it in db
    // send res 

    const {content } = req.body
    const {tweetId} = req.params

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const updatedTweet =await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    if(!updatedTweet){
        throw new ApiError(400,"Tweet was not updated")
    }

    // console.log(updatedTweet);
    
    return res.status(200).json(
        new ApiResponse(200, updatedTweet,"The tweet is updated successfull")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // get tweet id  and delete 
    // send res

    const {tweetId} = req.params

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(200,"The tweet is deleted successfull")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}