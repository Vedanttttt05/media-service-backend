import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath?: string): Promise<UploadApiResponse | null> => {
  if (!localFilePath) return null;

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: process.env.CLOUDINARY_FOLDER_NAME,
    });

    await fs.unlink(localFilePath).catch(() => {}); // delete safely

    return result;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    await fs.unlink(localFilePath).catch(() => {});

    return null;
  }
};

export { uploadToCloudinary };
