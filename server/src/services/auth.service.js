import {
  findUserByEmail,
  createUser,
  markUserAsVerified,
  getUserWithOAuthId,
  updateUser
} from "../models/user.model.js";
import { createUserToken, findUserToken, deleteUserToken } from "../models/userToken.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/mailer.js";
import { prisma } from "../config/db.js";
import { createUserProvider } from "../models/userProvider.model.js";

export const register = async ({ email, fullName, password }) => {
  // Check if email already exists
  const existingUser = await findUserByEmail(prisma, email);
  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { newUser, vertifyToken } = await prisma.$transaction(async (tx) => {
    // Create new user
    const newUser = await createUser(tx, {
      email,
      fullName,
      password: hashedPassword,
    });

    const vertifyToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // create verification token
    const userToken = await createUserToken(tx, {
      userId: newUser.id,
      token: vertifyToken,
      type: "VERIFY_EMAIL",
      expiresAt,
    });

    return {newUser, vertifyToken};
  });

  // send verification email
  await sendVerificationEmail(newUser.email, vertifyToken);

  return newUser;
}

export const verifyEmail = async (token) => {
  // Mark user as verified
  return await prisma.$transaction(async (tx) => {
    const userToken = await findUserToken(tx, {
      token,
      type: "VERIFY_EMAIL",
    });

    if (!userToken) {
      throw new Error("INVALID_TOKEN");
    }

    if (userToken.expiresAt < new Date()) {
      throw new Error("TOKEN_EXPIRED");
    }

    const updatedUser = await markUserAsVerified(tx, {userId: userToken.userId});

    // Delete the used token
    await deleteUserToken(tx, { token, type: "VERIFY_EMAIL" });
    
    return updatedUser;
  })
}

export const login = async ({ email, password }) => {
  // Find user by email
  const user = await findUserByEmail(prisma, email);
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  // Check if password exists (in case of OAuth users)
  if (!user.password) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return user;
}

export const oauthLogin = async ({ email, fullName, avatarUrl, providerUserId, provider }) => {
  let user = await getUserWithOAuthId(prisma, { email, provider });

  if (user) {
    const hasLinkedProvider = user.providers.length > 0

    if (!hasLinkedProvider) {
      await createUserProvider(prisma, {
        userId: user.id,
        authProvider: provider,
        providerUserId,
      });
    }

    return user;
  }
  else {
    await prisma.$transaction(async (tx) => {
      user = await createUser(
        tx,
        {
          email,
          fullName,
          password: null,
          avatarUrl,
          isEmailVerified: true
        }
      ); 

      await createUserProvider(tx, {
        userId: user.id,
        authProvider: provider,
        providerUserId,
      });
    })
  }

  return user;
}

export const forgotPassword = async (email) => {
  if (!email) {
    throw new Error("EMAIL_REQUIRED");
  }

  const user = await findUserByEmail(prisma, email);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const userToken = await createUserToken(prisma, {
    userId: user.id,
    token,
    type: "RESET_PASSWORD",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
  });

  await sendResetPasswordEmail(email, token);
}

export const resetPassword = async (token, password) => {
  const userToken = await findUserToken(prisma, {
    token,
    type: "RESET_PASSWORD",
  });

  if (!userToken) {
    throw new Error("INVALID_TOKEN");
  }

  if (userToken.expiresAt < new Date()) {
    throw new Error("TOKEN_EXPIRED");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return await prisma.$transaction(async (tx) => { 
    // Update user's password
    const updatedUser = await updateUser(tx, userToken.userId, { password: hashedPassword });

    // Delete the used token
    await deleteUserToken(tx, { token, type: "RESET_PASSWORD" });

    return updatedUser;
  })
}