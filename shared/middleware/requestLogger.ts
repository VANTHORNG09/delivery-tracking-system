import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    skip: (req: Request) => {
      return req.url === '/health' || req.url === '/api/v1/health';
    },
  }
);

export const customRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logData, null, 2));
    }
  });

  next();
};
