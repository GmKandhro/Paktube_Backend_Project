import {User} from "../models/user.model.js"
import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "ChannelId is missing")
    }

    const isAlreadyExists = await Subscription.findOne({
        channel:channelId,
        subscriber:req.user._id
    })
    let isSubscribed;

    if(isAlreadyExists != null){
        await Subscription.findOneAndDelete({
            channel:channelId,
            subscriber:req.user._id
        })
        isSubscribed = false
    }else{
        await Subscription.create({
            channel:channelId,subscriber:req.user._id
         })
         isSubscribed =  true
    }




    return res.status(200).json( new ApiResponse(200, {isSubscribed} ,`Channel ${isSubscribed ? "Subscribed" : "UnSubscribed"} Succssfull` ))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "ChannelId is missing")
    }

    const subscribers = await Subscription.find({channel:channelId}).populate("subscriber","-password -refreshToken -watchHistory -coverImage -createdAt -updatedAt")


    if(subscribers.length <= 0){
        return res.status(200).json(new ApiResponse(200,"No Subscribers yet..."))
    }

    return res.status(200).json(new ApiResponse(200,subscribers,"Subscribers fetched successfull"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "ChannelId is missing")
    }

    const channels = await Subscription.find({subscriber:subscriberId}).populate("channel" , 
        "-password -refreshToken -watchHistory -coverImage -createdAt -updatedAt"
    )

    if (channels.length <= 0) {
        return res.status(200).json(new ApiResponse(200,"No Channels Subscribed yet..."))
    }

    return res.status(200).json(
        new ApiResponse(200,channels ,"Channels fetched successfull")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}