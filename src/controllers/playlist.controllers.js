import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name ,description} = req.body

    //TODO: create playlist
    if(!name ||  !description){
        throw new ApiError(400,"All feilds are required")
    }

    const playlist = await Playlist.create({
        name, description , owner : req.user._id
    })

    if(!playlist){
        throw new ApiError(400,"Error while creating playlist: Try again")
    }

    
    return res.status(200).json(
        new ApiResponse(200,playlist,"Playlist created successFull")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists  
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"UserId is not correct")
    }


    const userPlaylists = await Playlist.aggregate([
        {
            $match:{
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                   {
                    $lookup:{
                         from:"likes",
                         foreignField:"video",
                         localField:"_id",
                         as:"likes"
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
                   },
                   {
                    $addFields:{
                        likes:{
                            $size:"$likes"
                        },
                        owner:{
                            $first : "$owner"
                        }
                    }
                   }
                ]
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
                    $first:"$owner"
                }
            }
        },
        {
            $project:{
                videos:1,
                name:1,
                description:1,
                owner:1
            }
        }
    ])

    if(userPlaylists.length <= 0){
       return res.status(200).json(new ApiResponse(400,"No Playlists yet..."))
    }

    return res.status(200).json(
        new ApiResponse(200,userPlaylists,"user playLists are fetched successfull")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistId is not correct")
    }


    const playlist =await Playlist.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                   {
                    $lookup:{
                         from:"likes",
                         foreignField:"video",
                         localField:"_id",
                         as:"likes"
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
                   },
                   {
                    $addFields:{
                        likes:{
                            $size:"$likes"
                        },
                        owner:{
                            $first : "$owner"
                        }
                    }
                   }
                ]
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
                    $first:"$owner"
                }
            }
        },
        {
            $project:{
                videos:1,
                name:1,
                description:1,
                owner:1
            }
        }
    ])

    if(!playlist.length){
        throw new ApiError(400,"Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200,playlist,"PlayList fetched successfull")
    )

})



const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistId is not correct")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is not correct")
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos:videoId
            }
        },
        {
            new:true
        } 
    )

    if(!playlist){ 
        throw new ApiError(400,"Playlist not found")
    }


   return res.status(200).json(
        new ApiResponse(200,playlist,"Video added to playlist successfull")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistId is not correct")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is not correct")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            }
        },
        {
            new:true
        } 
    )


    if(!playlist){ 
        throw new ApiError(400,"Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200,"Video removed from playlist successfull")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistId is not correct")
    }

   const playlist =  await Playlist.findByIdAndDelete(playlistId)

   if(!playlist){
        throw new ApiError(400,"Playlist not found")
   }

    return res.status(200).json(
        new ApiResponse(200,"PlayList deleted successfull")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistId is not correct")
    }

    if(!name || !description){
        throw new ApiError(400,"All feilds are required")
    }
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,description
            }
        },{
            new:true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400,"Playlist does not found")
    }

    return res.status(200).json(
        new ApiResponse(200,updatePlaylist,"Playlist updated successfull")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}