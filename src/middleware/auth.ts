import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AuthenticationError } from "../types/errors";

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new AuthenticationError("Access token required"));
  }

  try {
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch (error) {
    next(error);
  }
}
