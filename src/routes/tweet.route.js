import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controllers.js";

const tweetRouter = Router()

tweetRouter.use(verifyJwt)
tweetRouter.route("/createTweet").post(createTweet)

tweetRouter.route("/user/:userId").get(getUserTweets);
tweetRouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export {tweetRouter}