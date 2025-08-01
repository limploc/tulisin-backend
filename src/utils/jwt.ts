import jwt from "jsonwebtoken";
import { AppError, ErrorCode } from "../types/errors";
import { getJwtConfig } from "../config/config";

const { secret } = getJwtConfig();

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface TokenData {
  token: string;
  expiresAt: Date;
}

export function generateToken(payload: JWTPayload): TokenData {
  const token = jwt.sign(payload, secret, {
    expiresIn: "7d",
  });

  const decodedToken = jwt.decode(token) as jwt.JwtPayload;
  const expiresAt = new Date((decodedToken.exp || 0) * 1000);

  return {
    token,
    expiresAt,
  };
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & JWTPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token expired", 401, ErrorCode.AUTHENTICATION_ERROR);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid token", 401, ErrorCode.AUTHENTICATION_ERROR);
    }
    throw new AppError("Token verification failed", 401, ErrorCode.AUTHENTICATION_ERROR);
  }
}
