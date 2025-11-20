import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ErrorFactory } from '@infrastruktur/util';

/**
 * Middleware untuk validasi DTO menggunakan class-validator
 * Alasan: Centralized validation logic untuk semua DTOs
 *
 * @param dtoClass - Class DTO yang akan divalidasi
 * @returns Middleware function
 *
 * @example
 * router.post('/daftar', validasiDto(DaftarPenggunaDto), controller);
 */
export function validasiDto<T extends object>(dtoClass: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Transform plain object ke DTO class instance
      // Alasan: class-validator membutuhkan class instance untuk validation
      const dtoInstance = plainToClass(dtoClass, req.body);

      // Validate DTO
      const errors: ValidationError[] = await validate(dtoInstance);

      // Jika ada validation errors, throw error
      if (errors.length > 0) {
        const errorMessages = transformValidationErrors(errors);
        throw ErrorFactory.validasiGagal('Data input tidak valid', errorMessages);
      }

      // Replace req.body dengan validated DTO instance
      // Alasan: Controller akan menerima typed DTO instance
      req.body = dtoInstance;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Transform validation errors ke format yang user-friendly
 * Alasan: Error messages dari class-validator perlu di-format
 */
function transformValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap(error => {
    if (error.constraints) {
      return Object.values(error.constraints);
    }
    return [];
  });
}
