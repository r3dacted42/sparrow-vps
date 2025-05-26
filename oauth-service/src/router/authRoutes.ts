import { Router } from "express";
import { getGithubAccessToken, getGithubUserData } from "../controllers/authController";

const router = Router();
router.get("/github/token", getGithubAccessToken);
router.get("/github/user", getGithubUserData);

export default router;