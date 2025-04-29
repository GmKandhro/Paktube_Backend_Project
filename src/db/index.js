import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export const connectDB = async()=>{
    try {
        const connectionInstense = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("The Server is running on HOST ::> ", connectionInstense.connection.host);

    } catch (error) {
        console.log("MongoDB connnection FAILED, due to ", error);
        throw(error);
        process.exit(1);
    }
}