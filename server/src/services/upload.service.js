import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => { 
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto"
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  })
}

export const getPublicIdFromUrl = (url) => {
  if (!url) return null;

  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

export const deleteFromCloudinary = async (url, type="image") => {
  if (!url) return;
  if (!url.includes("cloudinary.com")) return;

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: type });
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
  }
}