import { CashkicksStatus, contractStatus, contractType } from "../enums";

export interface RequestParams { courseId: string };

export interface User {
	name: string;
	email: string;
	password: string;
	creditBalance?: number;
	payments?: string[];
	contracts?: string[];
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
	status: contractStatus;
	type: contractType;
	perPayment: number;
	termLength: number;
	paymentAmount: number;
	totalFinanced: number;
}

export interface Contract {
	name: string;
	status: contractStatus;
	type: contractType;
	perPayment: number;
	termLength: number;
	paymentAmount: number;
};

export interface LoginRequestBody {
	email: string;
	password: string;
}

export interface validationBody {
	isSuccess: boolean;
	message?: string;
	token?: string;
}

export interface userUpdateBody {
	password?: string;
	creditBalance?: number;
}