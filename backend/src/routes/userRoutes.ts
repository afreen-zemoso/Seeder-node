import { Router } from "express";
import * as userController from "../controllers/user";
import authenticate from "../middleware/authMiddleware";
import { createUserRequestValidation, updateUserRequestValidation } from "../validations/user";
import { handleValidationErrors } from "../middleware/validationMiddleware";

const router = Router();

router.get("/", authenticate, userController.getUserByEmail);

router.post(
	"/",
	createUserRequestValidation,
	handleValidationErrors,
	userController.createUser
);

router.patch(
	"/:id",
	authenticate,
	updateUserRequestValidation,
	handleValidationErrors,
	userController.updateUser
);

router.get("/all", authenticate, userController.getUsers);

export default router;
