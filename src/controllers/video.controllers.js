import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"userId is missing or uncorrect")
    }

    if (!query) {
        throw new ApiError(400,"Query not found!")
    }
    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(400,"user not found")
    }

    const video = await Video.aggregate([
        {
            $match:{
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                  ],
                owner: new mongoose.Types.ObjectId(userId)
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
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
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
        
        { $unwind: "$ownerDetails" },
        
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                ownerDetails: 1,
                createdAt: 1,
                updatedAt: 1,
                likes:1,
                views:1
            }
        }
    ]);

    // console.log(video);

    if(video.length <= 0){
        throw new ApiError(400,"Videos not found with your query")
    }
    
    return res.status(200).json(
        new ApiResponse(200,video,"viodes are fetched successful")
    )
    
    
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400,"all fields are required")
    }


    if(!req?.files?.videoFile || !req?.files?.thumbnail){
        throw new ApiError(400, "Both video and thumbnail files are required")
    }

    const VideoLocalfilePath = req?.files?.videoFile[0]?.path
    const thumbnailLocalFilePath = req?.files?.thumbnail[0]?.path
   
    
    const videoFile = await uploadOnCloudinary(VideoLocalfilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath)

    if(!videoFile || !thumbnail){
        throw new ApiError(400, "Error while uploading on Cloudinary")
    }

    // console.log();
    

    const video = await Video.create({
        title,description,
        videoFile : videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration,
        owner:req?.user._id
    })

    if(!video){
        throw new ApiError(400,"Video could not be created.")
    }

    

    return res.status(200).json(
        new ApiResponse(200,video,"Video published succeessfull")
    )
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is uncorrect")
    }

   const user = await User.findById(req.user._id)
    user.watchHistory.push(videoId)
    await user.save({validateBeforeSave:false})
    
    const video = await Video.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(videoId)
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
                likes : {
                    $size : "$likes"
                },
                isLiked:{
                    $cond:{
                        if: {$in : [req.user._id , "$likes.likedBy"]},
                        then: true,
                        else:false
                    }
                },
                owner:{
                    $first : "$owner"
                }
            }
        }
    ])


  
    

    await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },   // $inc --> increment kar do
        { new: true }
    )

    
    if(!video){
        throw new ApiError(400,"Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200,video,"Video Fetched successful")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description
    const {title , description} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is uncorrect")
    }

    if(!title || !description){
        throw new ApiError(400,"all Fields are required")
    }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,description
            }
        },
        {new :true}
    )

    if(!updateVideo){
        throw new ApiError(400,"Video could not be update.")
    }

    return res.status(200).json(
        new ApiResponse(200, updateVideo,"Video Updated successful")
    )
})

const updateThumbnail = asyncHandler(async(req,res)=>{
    const { videoId } = req.params
    //TODO: update video , Thumnail


    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is uncorrect")
    }

    // remove old image from cloudinary
    const video = await Video.findById(videoId);
    if (video?.thumbnail) {
        await deleteFromCloudinary(video.thumbnail.split("/").pop().split(".")[0]);
    }

    const localFilePath =  req?.file?.path

    if (!localFilePath) {
        throw new ApiError(400,"Thumbnail file is required")
    }

    const thumbnail = await uploadOnCloudinary(localFilePath)
    if (!thumbnail) {
        throw new ApiError(400,"Thumbnail file is required")
    }

    const updateThumbnail = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                thumbnail:thumbnail.url
            }
        },
        {
            new :true
        }
    )

    if(!updateThumbnail){
            throw new ApiError(400,"thumbnail could not be update.")
    }
    return res.status(200).json(
        new ApiResponse(200, updateThumbnail.thumbnail,"Thumbnail Updated successful")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is uncorrect")
    }

    const video = await Video.findByIdAndDelete(videoId)
    if(!video){
        throw new ApiError(400,"Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200,video,"Video Deleted successful")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is uncorrect")
    }

    const video = await Video.findById(videoId)

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished : !video.isPublished
            }
        },{
            new:true
        }
    )

    


    return res.status(200).json(
        new ApiResponse(200,updatedVideo.isPublished,"Status changed")
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateThumbnail
}