import mongoose from "mongoose";
import { DB_Name } from "../constants.js";


const dbConnect = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(" DB Connected Successfull !! ")
    } catch (error) {
        console.log("MongoDB Connection Error", error)
        process.exit(1)
    }
}

export default dbConnect