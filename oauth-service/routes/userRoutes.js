import { Router } from "express";
import { checkUser, checkSessionStatus, insertData, updateUser } from "../controllers/userController.js";

const router = Router();
router.get("/check", checkUser);
router.get("/session", checkSessionStatus);
router.post("/insert", insertData);
router.put("/update", updateUser);

export default router;