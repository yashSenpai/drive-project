import mongoose from "mongoose";
import { DB_NAME } from "../constant";

export const connectDB = async () => {
    try {
        const connenctionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    } catch (error) {
        console.log("MongoDB Connenction Failed!!", error);
        process.exit(1)
    }
}