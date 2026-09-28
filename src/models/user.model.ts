import mongoose, { Schema, Model, HydratedDocument, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

export interface IUser {
    username: string;
    email: string;
    fullName: string;
    avatar: string;
    avatarPublicId?: string;
    coverImage?: string;
    coverImagePublicId?: string;
    watchHistory: Types.ObjectId[];
    password: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

type UserModel = Model<IUser, {}, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    username: { type: String, required: true, unique: true , lowercase: true, trim: true , index: true},
    email: { type: String, required: true, unique: true  , lowercase: true, trim: true  , index: true},
    fullName: { type: String, required: true , trim: true  , index :true},
    avatar: { type: String , required : true},
    avatarPublicId: { type: String },
    coverImage: { type: String },
    coverImagePublicId: { type: String },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: { type: String, required: [true , "password is required"] ,  minlength: 6 },
    refreshToken: { type: String }

}, { timestamps: true });


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
        userId: this._id,
        username: this.username,
        email: this.email ,
        fullName: this.fullName
    } ,process.env.ACCESS_TOKEN_SECRET as string,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
    )};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
        userId: this._id,


    } ,process.env.REFRESH_TOKEN_SECRET as string,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"],
    }
    )

};


const User = mongoose.model<IUser, UserModel>("User", userSchema);

export {User};
