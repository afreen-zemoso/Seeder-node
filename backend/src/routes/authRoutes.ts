import { Router } from "express";

const authController = require("../controllers/auth");

export const router = Router();

router.post("/login", authController.postLogin);




export default router;
