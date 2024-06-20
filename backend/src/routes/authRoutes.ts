import { Router } from "express";
import * as authController from "../controllers/auth";

export const router = Router();

router.post("/login", authController.postLogin);

export default router;
