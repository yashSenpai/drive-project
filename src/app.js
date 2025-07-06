import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userRouter from "./routes/user.route.js"
import tagRouter from "./routes/tag.route.js"
import activityRouter from "./routes/activity.route.js"
import fileRouter from "./routes/file.route.js"
import folderRouter from "./routes/folder.route.js"


app.use("api/v1/userRouter", userRouter)
app.use("api/v1/tagRouter", tagRouter)
app.use("api/v1/activityRouter", activityRouter)
app.use("api/v1/fileRouter", fileRouter)
app.use("api/v1/folderRouter", folderRouter)

export { app }