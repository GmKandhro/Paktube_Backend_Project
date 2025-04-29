import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    updateThumbnail
} from "../controllers/video.controllers.js"
import { verifyJwt } from '../middlewares/auth.middleware.js';
import {uploadUsingMulter} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        uploadUsingMulter.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(updateVideo)
    .patch(uploadUsingMulter.single("thumbnail") , updateThumbnail)


router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router