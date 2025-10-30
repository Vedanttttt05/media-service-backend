import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { use } from 'react';
import { apiResponse } from '../utils/apiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  //get user data from req.body
  // validate user data
  //check if user already exists : username + email 
  // check for image upload check for avatar
  // upload them to cloudinary
  //create user in db
  // remove passwordd and refresh tokeen  field from response
  //check for user creation success
  //return res 
  const {fullName , email , username , password} = req.body
  
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    throw new apiError(409, "User with given email or username already exists");
  }

    const avatarLocalPath = req.files?.avatar[0]?.path; 
    const coverImageLocalPath =  req.files?.coverImage[0]?.path;
     
    if (!avatarLocalPath ) {
        throw new apiError(400 , "Avatar image is required")
    };
    const avatar  = await uploadToCloudinary(avatarLocalPath)
    const image = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar ){
        throw new apiError(500 , "Error uploading avatar image")
    }


  const user = await  User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverimage?.url||"",
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

export { registerUser }