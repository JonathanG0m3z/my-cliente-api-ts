import { Request } from "express";

export interface PersonalRequest extends Request {
    userId?: string;
    email?: string;
}