import { Request, Response, NextFunction } from 'express';
import { ErrorAplikasi, ERROR_CODES, ResponseBuilder } from '@infrastruktur/util';

/**
 * Global Error Handler Middleware
 * Alasan: Menangkap semua error dan mengembalikan response yang konsisten
 *
 * PENTING: Middleware ini harus didaftarkan SETELAH semua routes
 * karena Express error handler harus memiliki 4 parameters
 */
export function errorHandlerMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Jika error adalah ErrorAplikasi, gunakan detail dari error tersebut
  if (error instanceof ErrorAplikasi) {
    const response = ResponseBuilder.error(error.pesanError, error.kodeError, error.detail);

    res.status(error.statusHttp).json(response);
    return;
  }

  // Unhandled errors - jangan expose detail internal ke client
  // Alasan: Security - mencegah information disclosure
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Return generic error response
  const response = ResponseBuilder.error('Terjadi kesalahan pada server', ERROR_CODES.INTERNAL_001);

  res.status(500).json(response);
}

/**
 * Not Found Handler Middleware
 * Alasan: Menangani request ke route yang tidak ada
 *
 * PENTING: Middleware ini harus didaftarkan SEBELUM error handler
 * tapi SETELAH semua routes yang valid
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  const response = ResponseBuilder.error(
    `Route ${req.method} ${req.url} tidak ditemukan`,
    'NOT_FOUND'
  );

  res.status(404).json(response);
}

/**
 * Async Error Wrapper
 * Alasan: Untuk wrap async route handlers agar error otomatis di-catch
 *
 * @example
 * router.get('/users', asyncErrorWrapper(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(ResponseBuilder.sukses(users));
 * }));
 */
export function asyncErrorWrapper(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
