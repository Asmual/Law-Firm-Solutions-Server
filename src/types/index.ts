import { Request } from "express";

export type UserRole = "admin" | "partner" | "advocate" | "associate";

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  chamberDesignation?: string;
  associateId?: string;
  allowedInstitutions?: string[];
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: IAuthUser;
}

export interface JwtPayloadData {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
}
