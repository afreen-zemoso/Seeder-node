import { Router } from "express";
import authenticate from "../middleware/authMiddleware";
import { createCashkickRequestValidation } from "../validations/cashkick";
import { handleValidationErrors } from "../middleware/validationMiddleware";

const router = Router();
const cashkickController = require('../controllers/cashkick');

router.get(
	"/:userId",
	authenticate,
	cashkickController.getUserCashkicks
);

router.post(
	"/",
	authenticate,
	createCashkickRequestValidation,
	handleValidationErrors,
	cashkickController.createCashkick
);

export default router;
