import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({limit:"10kb"}))

app.use(express.static("./public"))

app.use(cookieParser())

// routes 

import { userRouter } from "./routes/user.routes.js"
import { subscriptionRouter } from "./routes/subscription.route.js"
import { tweetRouter } from "./routes/tweet.route.js"
import { playListRouter } from "./routes/playlist.route.js"

import videoRouter from "./routes/video.route.js"
import likeRouter from "./routes/like.route.js"
import healthcheck from "./routes/healthcheck.route.js"
import commentRoter from "./routes/comments.route.js"

import dashboardRouter from "./routes/dashboard.route.js"

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlists", playListRouter)
app.use("/api/v1/videos" , videoRouter)
app.use("/api/v1/likes" , likeRouter)
app.use("/api/v1/healthcheck" , healthcheck)
app.use("/api/v1/comments" , commentRoter)
app.use("/api/v1/dashboard" , dashboardRouter)




export {app}