import { Router } from "express";
import authenticate from "../middleware/authMiddleware";
import { createContractRequestValidation } from "../validations/contract";
import { handleValidationErrors } from "../middleware/validationMiddleware";

const router = Router();
const contractController = require("../controllers/contract");

router.get("/", authenticate, contractController.getContractsOfUser);

router.post(
	"/",
	authenticate,
	createContractRequestValidation,
	handleValidationErrors,
	contractController.createContract
);

export default router;
