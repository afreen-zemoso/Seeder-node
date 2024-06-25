import { Router } from "express";
import * as authController from "../controllers/auth";
import { createUserRequestValidation } from "../validations/user";
import { handleValidationErrors } from "../middleware/validationMiddleware";
import { ROUTES } from "../util/constants";

export const router = Router();

router.post(ROUTES.LOGIN, authController.postLogin);

router.post(
	ROUTES.SIGNUP,
	createUserRequestValidation,
	handleValidationErrors,
	authController.signUp
);
export default router;
