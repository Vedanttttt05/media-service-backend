import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError as apiError} from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';

const generateAccessandRefreshTokens = async(user) => {
  try {
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave : false});

    return { accessToken, refreshToken };
    
  } catch (error) {
    throw new apiError(500, "Error generating tokens");
    
  }

}

const registerUser = asyncHandler(async (req, res ) => {

  const {fullName , email , username , password} = req.body
  
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new apiError(409, "User with given email or username already exists");
  }

    const avatarLocalPath = req.files?.avatar[0]?.path; 

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
     coverImageLocalPath = req.files.coverImage[0].path;}

    if (!avatarLocalPath ) {
        throw new apiError(400 , "Avatar image is required")
    };
    const avatar  = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)
    
    if(!avatar ){
        throw new apiError(500 , "Error uploading avatar image")
    }


  const user = await  User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url||"",
        email,
        username : username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )

    if(!createdUser){
        throw new apiError (500 , "Error creating user")
    }
    return res.status(201).json(new apiResponse(201 , "User registered successfully" , createdUser));
});

const loginUser = asyncHandler(async (req,res) =>{

  const{email, username , password} = req.body;

  if(!email && !username){
    throw new apiError (400 , "Email or username is required");
  } 

const user = await User.findOne({ $or: [{ email }, { username }] });

if (!user) {
  throw new apiError(404, "User not found");
}

const isPasswordCorrect = await user.comparePassword(password);

if (!isPasswordCorrect) {
  throw new apiError(401, "Password is incorrect");
}
const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user);

const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

const options = {
  httpOnly: true,
  secure : true,

}
return res.status(200).cookie("accessToken" , accessToken , options)
.cookie("refreshToken" , refreshToken , options)
.json(new apiResponse(200 , {
  user : loggedInUser, accessToken, refreshToken
},
"user logged in successfully" 
))
});

const logOutUser  = asyncHandler(async (req,res) => {

 await User.findByIdAndUpdate(
     req.user._id,
    {
      $set: { refreshToken: undefined  }
    },
    {
      new: true,
    }
    
  )

  
const options = {
  httpOnly: true,
  secure : true,

}
return res.status(200).clearCookie("accessToken" , options)
.clearCookie("refreshToken" , options).json(new apiResponse(200 ,{}, "User logged out successfully"))

});

export { registerUser , loginUser , logOutUser } ;