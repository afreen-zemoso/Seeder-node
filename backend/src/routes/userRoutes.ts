import { Router } from "express";
import * as userController from "../controllers/user";
import authenticate from "../middleware/authMiddleware";
import { updateUserRequestValidation } from "../validations/user";
import { handleValidationErrors } from "../middleware/validationMiddleware";
import cacheMiddleware from "../middleware/cacheMiddleware";

const router = Router();

router.get("/", authenticate, cacheMiddleware, userController.getUserByEmail);

router.patch(
	"/:id",
	authenticate,
	updateUserRequestValidation,
	handleValidationErrors,
	userController.updateUser
);

export default router;
