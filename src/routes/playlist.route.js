import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controllers.js"

import { verifyJwt } from '../middlewares/auth.middleware.js';

const playListRouter = Router();

playListRouter.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

playListRouter.route("/").post(createPlaylist)

playListRouter
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

playListRouter.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
playListRouter.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

playListRouter.route("/user/:userId").get(getUserPlaylists);

export  {playListRouter}