import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) => {
    const {fullname, password, email, username} = req.body

    if([fullname,password,email,username].some((field)=>field?.trim()==="")){
        throw new ApiError(400, "All fields required.")
    }

    const userExisted = await User.findOne({fullname})

    if(userExisted){
        throw new ApiError(400,"User already exists.")
    }

    const user = await User.create({
        fullname: fullname,
        email:email,
        username:username.toLowerCase(),
        password:password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(400,"User registration unsuccessful.")
    }

    return res.status(200).json(
        new ApiResponse(200,createdUser,"User created successfully.")
    )
})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    const {email,password} = req.body

    if(!email){
        throw new ApiError(400,"User is required.")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(400,"User not found.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400,"Password Invalid.")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(200, {user: loggedInUser, refreshToken, accessToken}, "User logged in successfully."))

})

const logoutUser = asyncHandler(async (req,res) => {

    await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken: 1
        }
    },{
        new:true,
    }
)

    const options = {
        httpOnly:true,
        secure:true
    }
    
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new ApiResponse(200,{},"User logged out successfully.")
    )
})

const changePassword = asyncHandler(async(req,res)=>{
    //take the user's password
    //take the new password twice from request body
    //if new password #1 = #2, then update user with new password
    
    const {oldPassord, newPassword1, newPassword2} = req.body
   
    const user = await User.findById(req.user._id)
    
    const isPasswordValid = await user.isPasswordCorrect(oldPassord)

    if(!isPasswordValid){
        throw new ApiError(400, "Wrong Password Entered.")
    }

    if(newPassword1 != newPassword2){
        throw new ApiError(400, "New passwords entered do not match.")
    }

    if(newPassword1.length <= 8){
        throw new ApiError(400,"Enter a password atleast 8 characters long.")
    }

    user.password = newPassword1
    
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password updated successfully.")
    )
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(200,req.user,"User information fetched successfully.")
})

const updateEmailDetails = asyncHandler(async(req,res) => {

    //take the request from the request body
    //update it in the database
    //return the response

    const email = req.body

    if(!email || typeof email !== "string"){
        throw new ApiError(400,"Valid email field required.")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{$set:{email:email}},{new:true, runValidators: true}).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Email updated successfully."))
})

const updateFullnameDetails = asyncHandler(async(req,res)=>{
    
    const fullname = req.body

    if(!fullname||typeof fullname !== "string"){
        throw new ApiError(400,"Valid fullname requied.")
    }

    const user = await User.findByIdAndUpdate(req.user?.user,{
        $set:{
            fullname:fullname
        }
    },
    {new:true,runValidators:true}
).select("-password")

    return res.status(200).json(
        new ApiResponse(200,user,"Fullname updated successfully!!")
    )

})

export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    getCurrentUser,
    updateEmailDetails,//work on this as send otp to new email first
    updateFullnameDetails,
}