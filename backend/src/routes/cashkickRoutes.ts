import { Router } from "express";
import authenticate from "../middleware/authMiddleware";
import { createCashkickRequestValidation } from "../validations/cashkick";
import { handleValidationErrors } from "../middleware/validationMiddleware";
import * as cashkickController from "../controllers/cashkick";

const router = Router();

router.get("/:userId", authenticate, cashkickController.getUserCashkicks);

router.post(
	"/",
	authenticate,
	createCashkickRequestValidation,
	handleValidationErrors,
	cashkickController.createCashkick
);

export default router;
