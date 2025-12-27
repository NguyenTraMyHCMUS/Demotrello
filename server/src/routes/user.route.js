import { authMiddleware } from "../middlewares/authMiddleware.js";
import express from "express";
import { changeUserPassword, changeUserFullName, changeUserAvatarUrl } from "../controllers/user.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();
router.use(authMiddleware);

router.put("/password", changeUserPassword);
router.put("/fullname", changeUserFullName);
router.put("/avatar", upload.single("avatar"), changeUserAvatarUrl);

export default router;