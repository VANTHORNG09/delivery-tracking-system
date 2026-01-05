import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validationErrorHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }));

    const errorMessage = formattedErrors
      .map((err) => `${err.field}: ${err.message}`)
      .join(', ');

    throw new ValidationError(errorMessage);
  }

  next();
};
