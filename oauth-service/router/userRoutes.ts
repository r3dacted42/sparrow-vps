import { Router } from "express";
import { 
  getUser, 
  createUser, 
  updateUser, 
  getUserSession,
  updateUserSession
} from "../controller/userController";

const router: Router = Router();

router.get("/:username", getUser);
router.post("/", createUser);
router.put("/:username", updateUser);

router.get("/:username/session", getUserSession);
router.put("/:username/session", updateUserSession);

export default router;