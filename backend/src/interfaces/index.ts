import { CashkicksStatus, ContractStatus, ContractType } from "../enums";
import { Request } from "express";
export interface RequestParams { courseId: string };

export interface UserDetails {
	id?: string;
	name: string;
	email: string;
	password: string;
	creditBalance?: number;
	cashkicks?: string[];
};

export interface Cashkick {
	name: string;
	status: CashkicksStatus;
	maturity: Date;
	totalReceived: number;
	userId: string;
	contracts?: string[];
};

export interface UserCashkick {
	name: string;
	status: CashkicksStatus;
	maturity: Date;
	totalReceived: number;
	totalFinanced: number;
}

export interface UserContract {
	name: string;
	status: ContractStatus;
	type: ContractType;
	perPayment: number;
	termLength: number;
	paymentAmount: number;
	totalFinanced: number;
}

export interface Contract {
	name: string;
	status: ContractStatus;
	type: ContractType;
	perPayment: number;
	termLength: number;
	paymentAmount: number;
};

export interface UserQuery {
	userId?: string;
	email?: string;
}

export interface AuthenticatedRequest extends Request<any, {}, {}, UserQuery> {
	user?: UserDetails;
	cachedData?: any;
}

export interface LoginRequestBody {
	email: string;
	password: string;
}

export interface ValidationBody {
	isSuccess: boolean;
	message?: string;
	token?: string;
}

export interface UserUpdateBody {
	password?: string;
	creditBalance?: number;
}