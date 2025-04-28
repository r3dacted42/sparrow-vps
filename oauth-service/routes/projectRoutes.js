const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.post("/add", projectController.addProject);
router.get("/fetch", projectController.fetchRows);

module.exports = router;