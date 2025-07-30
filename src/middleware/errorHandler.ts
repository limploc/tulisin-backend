import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError, ErrorResponse, ValidationErrorResponse, ErrorCode } from "../types/errors";

const isDevelopment = process.env.NODE_ENV === "development";

class ErrorHandler {
  private static formatValidationError(error: ValidationError): ValidationErrorResponse {
    return {
      error: error.message,
      details: error.validationDetails,
    };
  }

  private static formatAppError(error: AppError): ErrorResponse {
    const response: ErrorResponse = {
      error: error.message,
    };

    if (error.code) {
      response.code = error.code;
    }

    if (error.details) {
      response.details = error.details;
    }

    return response;
  }

  private static formatUnknownError(error: Error): ErrorResponse {
    const message = isDevelopment ? error.message : "Internal server error";

    const response: ErrorResponse = {
      error: message,
      code: ErrorCode.INTERNAL_ERROR,
    };

    if (isDevelopment && error.stack) {
      response.details = {
        stack: error.stack,
        name: error.name,
      };
    }

    return response;
  }

  private static getStatusCode(error: Error): number {
    if (error instanceof AppError) {
      return error.statusCode;
    }

    if (error.name === "ValidationError") {
      return 400;
    }

    if (error.name === "CastError") {
      return 400;
    }

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return 401;
    }

    if (error.name === "MongoError" && (error as any).code === 11000) {
      return 409;
    }

    return 500;
  }

  private static logError(error: Error, req: Request): void {
    const logLevel = error instanceof AppError && error.statusCode < 500 ? "warn" : "error";

    console[logLevel]({
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error instanceof AppError && {
          statusCode: error.statusCode,
          code: error.code,
        }),
      },
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        userId: (req as any).user?.id,
      },
      timestamp: new Date().toISOString(),
    });
  }

  public static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    ErrorHandler.logError(error, req);

    const statusCode = ErrorHandler.getStatusCode(error);

    let response: ErrorResponse | ValidationErrorResponse;

    if (error instanceof ValidationError) {
      response = ErrorHandler.formatValidationError(error);
    } else if (error instanceof AppError) {
      response = ErrorHandler.formatAppError(error);
    } else {
      response = ErrorHandler.formatUnknownError(error);
    }

    if (res.headersSent) {
      return next(error);
    }

    res.status(statusCode).json(response);
  }
}

export const globalErrorHandler = ErrorHandler.handle;
