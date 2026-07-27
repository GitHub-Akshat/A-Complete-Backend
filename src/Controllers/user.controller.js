import { User } from "../Models/user.model.js";
import uploadOnCloudinary from "../Utilis/cloudinary.js";

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
            username : username.toLowerCase().trim(),
            fullName : fullName.trim(),
            email : email.toLowerCase().trim(),
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
        next(error);
    }
}

export default registerUser