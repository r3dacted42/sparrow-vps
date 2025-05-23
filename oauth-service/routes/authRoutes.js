import { Router } from "express";
import { getGithubAccessToken, getGithubUserData, fetchGithubRepos } from "../controllers/authController.js";

const router = Router();
router.get("/github/token", getGithubAccessToken);
router.get("/github/user", getGithubUserData);
router.get("/github/repos", fetchGithubRepos);

export default router;