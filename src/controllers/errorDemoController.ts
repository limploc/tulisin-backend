import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErrorFactory } from '../utils/errorFactory';

export const demonstrateErrorHandling = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { errorType } = req.query;

    switch (errorType) {
      case 'validation':
        throw ErrorFactory.createValidationError('Validation failed', [
          { field: 'email', message: 'Email is required', code: 'REQUIRED' },
          { field: 'password', message: 'Password must be at least 8 characters', code: 'MIN_LENGTH' }
        ]);

      case 'auth':
        throw ErrorFactory.createAuthenticationError();

      case 'forbidden':
        throw ErrorFactory.createAuthorizationError();

      case 'notfound':
        throw ErrorFactory.createNotFoundError('User', req.params.id);

      case 'conflict':
        throw ErrorFactory.createDuplicateFieldError('email', 'test@example.com');

      case 'badrequest':
        throw ErrorFactory.createBadRequestError('Invalid request format', {
          expectedFormat: 'JSON',
          receivedFormat: 'XML'
        });

      case 'ratelimit':
        throw ErrorFactory.createRateLimitError();

      case 'internal':
        throw new Error('Simulated internal server error');

      default:
        res.json({
          message: 'Error handling demonstration',
          availableTypes: [
            'validation',
            'auth',
            'forbidden',
            'notfound', 
            'conflict',
            'badrequest',
            'ratelimit',
            'internal'
          ]
        });
    }
  }
);

export const createUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      const errors = [];
      if (!email) errors.push({ field: 'email', message: 'Email is required' });
      if (!password) errors.push({ field: 'password', message: 'Password is required' });
      if (!name) errors.push({ field: 'name', message: 'Name is required' });
      
      throw ErrorFactory.createValidationError('Missing required fields', errors);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: { id: '123', email, name }
    });
  }
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (id === 'notfound') {
      throw ErrorFactory.createNotFoundError('User', id);
    }

    res.json({
      user: { id, email: 'user@example.com', name: 'John Doe' }
    });
  }
);
