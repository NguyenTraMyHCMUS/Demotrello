import bcrypt from 'bcryptjs';
import { findUserById as findUserByIdModel, updateUser } from '../models/user.model.js';
import { prisma } from '../config/db.js';

export const findUserById = async (db, id) => {
  if (!id) {
    throw new Error('INVALID_USER_ID');
  }

  const user = await findUserByIdModel(db, id);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
}

export const changePassword = async (userId, currentPassword, newPassword) => {
  // Find user by ID
  const user = await findUserByIdModel(prisma, userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // Ensure user has a password set
  if (!user.password) {
    throw new Error('NO_PASSWORD_SET');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('INVALID_CURRENT_PASSWORD');
  }

  // Hash new password and update
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  return await updateUser(prisma, userId, { password: hashedPassword });
}

export const changeFullName = async (userId, newFullName) => {
  const user = await findUserByIdModel(prisma, userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return await updateUser(prisma, userId, { fullName: newFullName }); 
}

export const changeAvatarUrl = async (userId, newAvatarUrl) => {
  const user = await findUserByIdModel(prisma, userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return await updateUser(prisma, userId, { avatarUrl: newAvatarUrl });
}