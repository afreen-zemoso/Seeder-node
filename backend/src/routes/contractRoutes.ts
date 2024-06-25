import { Router } from "express";
import authenticate from "../middleware/authMiddleware";
import { createContractRequestValidation } from "../validations/contract";
import { handleValidationErrors } from "../middleware/validationMiddleware";
import * as contractController from "../controllers/contract";
import cacheMiddleware from "../middleware/cacheMiddleware";
import { ROUTES } from "../util/constants";

const router = Router();

router.get("/", authenticate, cacheMiddleware, contractController.getAllContracts);

router.get(
	ROUTES.USER,
	authenticate,
	cacheMiddleware,
	contractController.getContractsOfUser
);

router.post(
	"/",
	authenticate,
	createContractRequestValidation,
	handleValidationErrors,
	contractController.createContract
);

export default router;
