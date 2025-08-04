import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, getCurrentUser } from "../services/auth.service";
import { validateRegisterData, validateLoginData } from "../validators/auth.validator";
import { AuthenticatedRequest } from "../middleware/auth";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = validateRegisterData(req.body);
    const authResponse = await registerUser(validatedData);

    res.status(201).json(authResponse);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = validateLoginData(req.body);
    const authResponse = await loginUser(validatedData);

    res.status(200).json(authResponse);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const user = await getCurrentUser(authenticatedReq.user.userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
