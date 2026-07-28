import { json } from "express";
import { User } from "../Models/user.model.js";
import uploadOnCloudinary from "../Utilis/cloudinary.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        return res.status(500).json({
            message: "Something went Wrong in Generating Tokens !!"
        })
    }
}


const registerUser = async (req, res, next) => {
    // get user details from frontend
    // validate - non empty
    // check if user already exists
    // check for images 
    // upload them to cloudinay
    // create user obj in db
    // make a response for user
    // check if created or Not
    // return response

    try {
        const { username, email, fullName, password } = req.body

        //validation here  OR use Zod
        if (
            !username?.trim() ||
            !email?.trim() ||
            !fullName?.trim() ||
            !password?.trim()
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        //Assuming Every thing is filled
        const existingUser = await User.findOne({ $or: [{ email }, { username }] })

        if (existingUser) {
            return res.status(409).json({
                message: "User Already exists !!"
            })
        }

        // console.log(req.files)
        const avatarLocalPath = req.files?.avatar?.[0]?.path
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path

        if (!avatarLocalPath) {
            return res.status(400).json({
                message: "Avatar File Not Found !!!"
            })
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            return res.status(400).json({
                message: "Failed to upload avatar !!"
            })
        }

        const user = await User.create({
            username: username.toLowerCase().trim(),
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            return res.status(500).json({
                message: "Server Error while registering user !!"
            })
        }

        return res.status(201).json({
            message: "User Created Successfully !!",
            user: createdUser
        })

    }
    catch (error) {
        // console.log(error);
        next(error);
    }
}

const loginUser = async (req, res, next) => {
    // req.body se data lo
    // validate karo data
    // findone se db me search karo
    // no avillabe toh register karo
    // if available toh password check
    // naya refresh and access token generate karke do
    // resp that login successful with data like tokens in cookies

    try {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).json({
                message: "Email is required !!"
            })
        }

        // const user = await User.findOne({
        //     $or : [ { email }, { username }]
        // });
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User Does Not Exists !!"
            })
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Password Does Not Match !!"
            })

        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({
            message: "User  Logged In Successfully !!",
            user: loggedInUser
        })
    }
    catch (error) {
        // console.log(error);
        next(error);
    }

}

const logOutUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id,
            {
                $unset:
                {
                    refreshToken: 1  // true value can use true also  but mongoDB convention is 1 so 1 .
                }
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json({
            message: "User Logged Out Successfully !!"
        })
    }
    catch (error) {
        // console.log(error);
        next(error);
    }
}

const refreshAccessToken = async (req, res, next) => {
    try {

        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(400).json({
                message: "Unauthorized Request !!"
            })
        }

        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedRefreshToken._id)

        if (!user) {
            return res.status(400).json({
                message: "Invalid Refresh Token"
            })

        }

        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(400).json({
                message: "Wrong or Expired Refresh Token"
            })
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({
            message: "Access Token Refreshed Successfully !!"
        })

    } catch (error) {
        // console.log(error);
        next(error);
    }
}

const changeCurrentPassword = async (req, res, next) => {
    try {

        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        const validPassword = await user.isPasswordCorrect(oldPassword)

        if (!validPassword) {
            return res.status(400).json({
                message: "Invalid Old Paaword !!"
            })
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({
            message: "New Password Created !!"
        })

    } catch (error) {
        // console.log(error);
        next(error);
    }
}

const getCurrentUser = async (req, res, next) => {
    try {

        const currentUser = req.user

        return res.status(200).json({
            message: "User Details Fetched Successfully !!",
            currentUser
        })

    }
    catch (error) {
        // console.log(error);
        next(error);
    }
}

const updateUserDetails = async (req, res, next) => {
    try {
        const { fullName, email } = req.body;

        if (!fullName && !email) {
            return res.status(400).json({
                message: "At least one field is required"
            })
        }

        const updateData = {}
        if(fullName) updateData.fullName = fullName;
        if(email) updateData.email = email;
        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                // $set: {
                //     fullName,  
                //     email
                // }

                // because updation can only be name or email also not both necessarly
                $set : updateData
            },
            {
                returnDocument : "after"
            }
        ).select("-password -refreshToken")

        return res.status(200).json({
            message: "User Details Updated Successfully",
            user
        })
    } catch (error) {
        // console.log(error);
        next(error);
    }
}

const updateUserAvatarImage = async (req, res, next) =>{
    try {

        const avatorImageLocalPath = req.file?.avatar.path
        if(!avatorImageLocalPath)
        {
            return res.status(400).json({
                message : "Avatar Image not Found !!"
            })
        }

        const avatar = await uploadOnCloudinary(avatorImageLocalPath);

        const user = await User.findByIdAndUpdate(req.user._id,
            {
                $set : {
                    avatar : avatar.url
                }
            },
            {
                returnDocument : "after"
            }
        ).select("-password -refreshToken")

        return res.status(200).json({
            message : "Avatar Image Updated Successfully !!",
            user
        })

    } catch (error) {
        // console.log(error);
        next(error);
    }
}

const updateUserCoverImage = async (req, res, next) =>{
    try {
        const coverImageLocalFilePath = req.file?.coverImage.path
        if(!coverImageLocalFilePath)
        {
            return res.status(400).json({
                message : "Cover Image Not Found"
            })
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalFilePath)

        const user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set : {
                    coverImage : coverImage.url
                }
            },
            {
                returnDocument : "after"
            }
        ).select("-password -refreshToken")

        return res.status(200).json({
            message : "CoverImage Updated Successfully !! ",
            user
        })

    } catch (error) {
        // console.log(error);
        next(error);
    }
}

export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails ,updateUserCoverImage ,updateUserAvatarImage };