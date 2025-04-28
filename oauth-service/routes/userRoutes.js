const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/check", userController.checkUser);
router.get("/session", userController.checkSessionStatus);
router.post("/insert", userController.insertData);
router.put("/update", userController.updateUser);

module.exports = router;