import { changePassword, changeFullName, changeAvatarUrl, findUserById } from "../services/user.service.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../services/upload.service.js";
import { prisma } from "../config/db.js";


export const changeUserPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const response = await changePassword(userId, currentPassword, newPassword);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    else if (error.message === "NO_PASSWORD_SET") {
      return res.status(400).json({ message: "No password set for this user" });
    }
    else if (error.message === "INVALID_CURRENT_PASSWORD") {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
}

export const changeUserFullName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newFullName } = req.body;

    const response = await changeFullName(userId, newFullName);

    res.status(200).json({ message: "Full name changed successfully" });

  } catch (error) {
    console.error("Error changing full name:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
}

export const changeUserAvatarUrl = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const currentUser = await findUserById(prisma, userId);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, "avatars");

    if (currentUser?.avatarUrl) {
      await deleteFromCloudinary(currentUser.avatarUrl);
    }

    const newAvatarUrl = uploadResult.secure_url;
    const response = await changeAvatarUrl(userId, newAvatarUrl);

    res.status(200).json({ message: "Avatar URL changed successfully", avatarUrl: newAvatarUrl });
  } catch (error) {
    console.error("Error changing avatar URL:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
}