import { Router } from "express";
import { addProject, fetchRows } from "../controllers/projectController.js";

const router = Router();
router.post("/add", addProject);
router.get("/fetch", fetchRows);

export default router;