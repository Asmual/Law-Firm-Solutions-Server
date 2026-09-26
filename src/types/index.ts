import { Request } from "express";

export type UserRole = "admin" | "advocate" | "associate";

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
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
  role: UserRole;
}
