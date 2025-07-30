export interface ErrorDetails {
  [key: string]: any;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: ErrorDetails;
}

export interface ValidationErrorResponse {
  error: string;
  details: ValidationErrorDetail[];
}

export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  RATE_LIMIT = "RATE_LIMIT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;

  constructor(message: string, statusCode: number, code: string, details?: ErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly validationDetails: ValidationErrorDetail[];

  constructor(message: string, validationDetails: ValidationErrorDetail[]) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
    this.validationDetails = validationDetails;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, ErrorCode.AUTHENTICATION_ERROR);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, ErrorCode.AUTHORIZATION_ERROR);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, ErrorCode.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, ErrorCode.CONFLICT);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429, ErrorCode.RATE_LIMIT);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, 400, ErrorCode.BAD_REQUEST, details);
  }
}
