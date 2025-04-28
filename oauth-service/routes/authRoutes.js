// routes/authRoutes.js - Authentication routes
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// GitHub OAuth routes
router.get("/github/token", authController.getGithubAccessToken);
router.get("/github/user", authController.getGithubUserData);
router.get("/github/repos", authController.fetchGithubRepos);

module.exports = router;