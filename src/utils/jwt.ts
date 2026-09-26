import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { JwtPayloadData } from "../types";

export const generateAccessToken = (payload: JwtPayloadData): string => {
  return jwt.sign(payload, ENV.JWT_TOKEN_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayloadData): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayloadData | null => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_TOKEN_SECRET) as JwtPayloadData;
    return decoded;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayloadData | null => {
  try {
    const decoded = jwt.verify(token, ENV.JWT_REFRESH_SECRET) as JwtPayloadData;
    return decoded;
  } catch {
    return null;
  }
};
