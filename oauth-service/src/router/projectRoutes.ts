import { Router, RequestHandler } from "express";
import { addProject, fetchProject } from "../controllers/projectController";

const router: Router = Router();

router.post("/add", addProject as RequestHandler);
router.get("/fetch", fetchProject as RequestHandler);

export default router;