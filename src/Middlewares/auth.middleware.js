import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";

const verifyjwt = async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                message: "Unauthorised Request !!"
            })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                message: "Invalid Access Token !!"
            })
        }

        req.user = user;
        next();
    } catch (error) {
        // console.log(error);
        return res.status(400).json({
            message: error || "Invalid Access Token !!"
        })
    }
}

export default verifyjwt;