import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, 
    updateUserAvatarImage, updateUserCoverImage, getUserProfileDetails, getWatchHistory} from "../Controllers/user.controller.js";
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

userRouter.route("/refresh-token").post(refreshAccessToken);

userRouter.route("/change-password").post(verifyjwt , changeCurrentPassword);

userRouter.route("/current-user").get(verifyjwt, getCurrentUser);

userRouter.route("/update-user-details").patch(verifyjwt, updateUserDetails);

userRouter.route("/update-avatar").patch(verifyjwt, upload.single("avatar"), updateUserAvatarImage);

userRouter.route("/update-cover-image").patch(verifyjwt, upload.single("coverImage"), updateUserCoverImage);

userRouter.route("/channel/:username").get(verifyjwt, getUserProfileDetails);

userRouter.route("/watch-history").get(verifyjwt, getWatchHistory);

export default userRouter;