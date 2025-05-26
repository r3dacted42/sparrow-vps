import { Router, RequestHandler } from "express";
import { addProject, fetchRows } from "../controller/projectController";

const router: Router = Router();

router.post("/add", addProject as RequestHandler);
router.get("/fetch", fetchRows as RequestHandler);

export default router;