import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  RateLimitError,
  ValidationErrorDetail,
} from "../types/errors";

export class ErrorFactory {
  static createValidationError(message = "Validation failed", details: ValidationErrorDetail[]): ValidationError {
    return new ValidationError(message, details);
  }

  static createFieldValidationError(field: string, message: string, code?: string): ValidationError {
    return new ValidationError("Validation failed", [{ field, message, code }]);
  }

  static createAuthenticationError(message = "Authentication required"): AuthenticationError {
    return new AuthenticationError(message);
  }

  static createAuthorizationError(message = "Insufficient permissions"): AuthorizationError {
    return new AuthorizationError(message);
  }

  static createNotFoundError(resource = "Resource", identifier?: string): NotFoundError {
    const message = identifier ? `${resource} with ID '${identifier}' not found` : `${resource} not found`;
    return new NotFoundError(message);
  }

  static createConflictError(message: string): ConflictError {
    return new ConflictError(message);
  }

  static createBadRequestError(message: string, details?: { [key: string]: any }): BadRequestError {
    return new BadRequestError(message, details);
  }

  static createRateLimitError(message = "Too many requests. Please try again later."): RateLimitError {
    return new RateLimitError(message);
  }

  static createDuplicateFieldError(field: string, value: string): ConflictError {
    return new ConflictError(`${field} '${value}' already exists`);
  }

  static createInvalidCredentialsError(): AuthenticationError {
    return new AuthenticationError("Invalid email or password");
  }

  static createTokenExpiredError(): AuthenticationError {
    return new AuthenticationError("Token has expired");
  }

  static createInvalidTokenError(): AuthenticationError {
    return new AuthenticationError("Invalid or malformed token");
  }

  static createAccessDeniedError(action?: string, resource?: string): AuthorizationError {
    const message = action && resource ? `Access denied: Cannot ${action} ${resource}` : "Access denied";
    return new AuthorizationError(message);
  }
}
