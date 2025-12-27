import {
  loginSchema,
  registerSchema,
} from "../../../shared/schemas/authSchema.js";
import {register, login, verifyEmail, oauthLogin, forgotPassword, resetPassword } from "../services/auth.service.js";
import { z } from "zod";
import { generateToken } from "../utils/token.js";
import { generateState, generateCodeVerifier, decodeIdToken } from "arctic";
import google from "../lib/OAuth/google.js";
import entraId from "../lib/OAuth/microsoft.js";

export const registerUser = async (req, res) => {
  try {
    // Validate request body
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    // Extract validated data
    const { email, password, name } = parsed.data;

    // Register new user
    const newUser = await register({ email, fullName: name, password });

    // response 201 Created
    res.status(201).json({
      message:
        "Registration successful! Please checks your email to verify account.",
    });
  } catch (error) {
    // Handle errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    else if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(400).json({ message: "Email already exists" });
    }

    console.log("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmailUser = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await verifyEmail(token);
    
    const jwtToken = generateToken(user.id);
    
    // Set token in HTTP-only cookie
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Email verified successfully", user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    } });
  } catch (error) {
    console.error("VERIFY ERROR:", error);

    if (error.message === "INVALID_TOKEN") {
      return res.status(400).json({ message: "Invalid token" });
    }
    else if (error.message === "INVALID_TOKEN_TYPE") {
      return res.status(400).json({ message: "Invalid token type" });
    }
    else if (error.message === "TOKEN_EXPIRED") {
      return res.status(400).json({ message: "Token has expired" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}

export const loginUser = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    const user = await login({ email, password });

    // generate JWT token
    const token = generateToken(user.id);

    // Set token in HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    else if (error.message === "INVALID_CREDENTIALS") {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    else if (error.message === "EMAIL_NOT_VERIFIED") {
      return res.status(400).json({ message: "Email not verified" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logout successful" });
};


export const getCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
}

export const getGoogleLoginPage = (req, res) => {
  if (req.user) return res.redirect(`${process.env.CLIENT_URL}/`);

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const config = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 15 * 1000, // 15 min
  };

  res.cookie("google_oauth_state", state, config);
  res.cookie("google_oauth_code_verifier", codeVerifier, config);

  res.redirect(url.toString());
} 

export const getGoogleLoginCallback = async (req, res) => {
  const { code, state } = req.query;

  const storedState = req.cookies["google_oauth_state"];
  const codeVerifier = req.cookies["google_oauth_code_verifier"]; 

  if (!state || !code || !codeVerifier || !storedState || state !== storedState) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=invalid_state`);
  }

  let tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);

     const claims = decodeIdToken(tokens.idToken());
     const { sub: googleUserId, email, name, picture } = claims;

     const avatarUrl = picture || null;

     const user = await oauthLogin({
       email,
       fullName: name,
       avatarUrl,
       providerUserId: googleUserId,
       provider: "GOOGLE",
     });

     const jwtToken = generateToken(user.id);

     // Set token in HTTP-only cookie
     res.cookie("jwt", jwtToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: "lax",
       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     });

     res.redirect(`${process.env.CLIENT_URL}/`);
  }
  catch (error) {
    console.error("Google OAuth error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
}  

export const getMicrosoftLoginPage = (req, res) => {
  if (req.user) return res.redirect(`${process.env.CLIENT_URL}/`);

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  // Assuming 'entraId' is the Microsoft OAuth client instance
  const url = entraId.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const config = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 15 * 1000, // 15 min
  };

  res.cookie("microsoft_oauth_state", state, config);
  res.cookie("microsoft_oauth_code_verifier", codeVerifier, config);

  res.redirect(url.toString());
}

export const getMicrosoftLoginCallback = async (req, res) => {
  const { code, state } = req.query;

  const storedState = req.cookies["microsoft_oauth_state"];
  const codeVerifier = req.cookies["microsoft_oauth_code_verifier"];

  if (!state || !code || !codeVerifier || !storedState || state !== storedState) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=invalid_state`);
  }
  
  try {
    const tokens = await entraId.validateAuthorizationCode(code, codeVerifier);

    const accessToken = tokens.accessToken();
    const response = await fetch("https://graph.microsoft.com/oidc/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const user = await response.json();
    console.log("Microsoft user info:", user);

    const { sub: microsoftUserId, email, givenname, familyname, picture } = user;

    if (!email) {
      email = userProfile.preferred_username || userProfile.upn;
    }
    const avatarUrl = picture || null;

    const appUser = await oauthLogin({
      email,
      fullName: `${givenname} ${familyname}`,
      avatarUrl,
      providerUserId: microsoftUserId,
      provider: "MICROSOFT",
    });

    const jwtToken = generateToken(appUser.id);

    // Set token in HTTP-only cookie
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${process.env.CLIENT_URL}/`);
  } catch (error) {
    console.error("Microsoft OAuth error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
}

export const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    await forgotPassword(email);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const handleResetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    await resetPassword(token, password);
    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    if (error.message === "INVALID_TOKEN") {
      return res.status(400).json({ message: "Invalid token" });
    }
    else if (error.message === "INVALID_TOKEN_TYPE") {
      return res.status(400).json({ message: "Invalid token type" });
    }
    else if (error.message === "TOKEN_EXPIRED") {
      return res.status(400).json({ message: "Token has expired" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}