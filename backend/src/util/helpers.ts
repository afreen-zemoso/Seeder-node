import {  Response } from "express";
import { AuthenticatedRequest } from "../interfaces";
import client from "./redisClient";

export const sendResponse = (res: Response, statusCode: number, data: any) => {
	res.status(statusCode).json(data);
};

export const getLoggedInUserId = (req: AuthenticatedRequest) => {
	if (req.user) return req.user.id;
};

export const clearCache = async() => {
	try {
		await client.flushDb();
		console.log("Redis cache flushed");
	} catch (err) {
		console.error("Error flushing Redis:", err);
	}
}