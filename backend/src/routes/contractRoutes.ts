import { Router } from "express";
import authenticate from "../middleware/authMiddleware";
import { createContractRequestValidation } from "../validations/contract";
import { handleValidationErrors } from "../middleware/validationMiddleware";
import * as contractController from "../controllers/contract";

const router = Router();

router.get("/", authenticate, contractController.getContractsOfUser);

router.post(
	"/",
	authenticate,
	createContractRequestValidation,
	handleValidationErrors,
	contractController.createContract
);

export default router;
