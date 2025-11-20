import { Router } from 'express';
import {
  asyncErrorWrapper,
  autentikasiMiddleware,
  adminOnlyMiddleware,
  validasiDto,
} from '@infrastruktur/middleware';
import { RepositoriBooking } from '../repositori';
import { ServiceBooking } from '../service';
import { ControllerBooking } from '../controller';
import { BuatBookingDto } from '../dto';

/**
 * Setup routes untuk domain Booking
 * Alasan: Centralized routing configuration
 */
export function setupRuteBooking(): Router {
  const router = Router();

  // Initialize dependencies
  // Alasan: Dependency injection pattern untuk testability
  const repositori = new RepositoriBooking();
  const service = new ServiceBooking(repositori);
  const controller = new ControllerBooking(service);

  /**
   * POST /api/booking
   * Membuat booking baru
   * Authenticated endpoint - requires login
   */
  router.post(
    '/',
    autentikasiMiddleware,
    validasiDto(BuatBookingDto),
    asyncErrorWrapper(controller.buatBooking.bind(controller))
  );

  /**
   * GET /api/booking/saya
   * Mendapatkan riwayat booking pengguna yang sedang login
   * Authenticated endpoint - requires login
   */
  router.get(
    '/saya',
    autentikasiMiddleware,
    asyncErrorWrapper(controller.dapatkanRiwayatBooking.bind(controller))
  );

  /**
   * DELETE /api/booking/:id
   * Membatalkan booking
   * Authenticated endpoint - requires login
   */
  router.delete(
    '/:id',
    autentikasiMiddleware,
    asyncErrorWrapper(controller.batalkanBooking.bind(controller))
  );

  return router;
}

/**
 * Setup routes untuk admin booking management
 * Alasan: Memisahkan admin routes untuk clarity
 */
export function setupRuteAdminBooking(): Router {
  const router = Router();

  // Initialize dependencies
  const repositori = new RepositoriBooking();
  const service = new ServiceBooking(repositori);
  const controller = new ControllerBooking(service);

  /**
   * GET /api/admin/booking
   * Mendapatkan semua booking
   * Admin only endpoint
   */
  router.get(
    '/',
    autentikasiMiddleware,
    adminOnlyMiddleware,
    asyncErrorWrapper(controller.dapatkanSemuaBooking.bind(controller))
  );

  return router;
}
