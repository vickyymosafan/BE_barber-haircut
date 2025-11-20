import { Router } from 'express';
import { asyncErrorWrapper, autentikasiMiddleware, validasiDto } from '@infrastruktur/middleware';
import { RepositoriPembayaran } from '../repositori';
import { RepositoriBooking } from '@domain/booking/repositori';
import { RepositoriInvoice } from '@domain/invoice/repositori';
import { ServicePembayaran } from '../service';
import { ControllerPembayaran } from '../controller';
import { ProsesPembayaranDto } from '../dto';

/**
 * Setup routes untuk domain Pembayaran
 * Alasan: Centralized routing configuration
 */
export function setupRutePembayaran(): Router {
  const router = Router();

  // Initialize dependencies
  // Alasan: Dependency injection pattern untuk testability
  const repositoriPembayaran = new RepositoriPembayaran();
  const repositoriBooking = new RepositoriBooking();
  const repositoriInvoice = new RepositoriInvoice();
  const service = new ServicePembayaran(repositoriPembayaran, repositoriBooking, repositoriInvoice);
  const controller = new ControllerPembayaran(service);

  /**
   * POST /api/pembayaran
   * Memproses pembayaran untuk booking
   * Authenticated endpoint - requires login
   */
  router.post(
    '/',
    autentikasiMiddleware,
    validasiDto(ProsesPembayaranDto),
    asyncErrorWrapper(controller.prosesPembayaran.bind(controller))
  );

  return router;
}
