import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshAccessToken } from "../Controllers/user.controller.js";
import { upload } from '../Middlewares/multer.middleware.js';
import verifyjwt from "../Middlewares/auth.middleware.js";

const userRouter =  Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser);

//secured paths
userRouter.route("/logout").post( verifyjwt, logOutUser);

userRouter.route("/refresh-token").post(refreshAccessToken)

export default userRouter;