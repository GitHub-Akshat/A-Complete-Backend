import cookieParser from "cookie-parser";
import express, { urlencoded } from "express";
import cors from 'cors';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: "16kb" }))
app.use(urlencoded({ extended: "true", limit: "16kb" }))
app.use(express.static("public"));
app.use(cookieParser())

// importing router
import userRouter from "./Routes/user.route.js";
import videoRouter from "./Routes/video.route.js"
import tweetRouter from "./Routes/tweet.route.js"
import subscriptionRouter from "./Routes/subscription.route.js"
import playlistRouter from "./Routes/playlist.route.js"
import likeRouter from "./Routes/like.route.js"
import healthcheckRouter from "./Routes/healthcheck.route.js"
import dashboardRouter from "./Routes/dashboard.route.js";
import commentRouter from "./Routes/comment.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)


app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong"
    });
});

export default app;