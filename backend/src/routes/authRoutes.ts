import { Router } from "express";
import * as authController from "../controllers/auth";
import { createUserRequestValidation } from "../validations/user";
import { handleValidationErrors } from "../middleware/validationMiddleware";

export const router = Router();

router.post("/login", authController.postLogin);

router.post(
	"/signup",
	createUserRequestValidation,
	handleValidationErrors,
	authController.signUp
);
export default router;
