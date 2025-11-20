import { Router } from 'express';
import { asyncErrorWrapper, autentikasiMiddleware } from '@infrastruktur/middleware';
import { RepositoriInvoice } from '../repositori';
import { RepositoriBooking } from '@domain/booking/repositori';
import { ServiceInvoice } from '../service';
import { ControllerInvoice } from '../controller';

/**
 * Setup routes untuk domain Invoice
 * Alasan: Centralized routing configuration
 */
export function setupRuteInvoice(): Router {
  const router = Router();

  // Initialize dependencies
  // Alasan: Dependency injection pattern untuk testability
  const repositoriInvoice = new RepositoriInvoice();
  const repositoriBooking = new RepositoriBooking();
  const service = new ServiceInvoice(repositoriInvoice, repositoriBooking);
  const controller = new ControllerInvoice(service);

  /**
   * GET /api/invoice/:id
   * Mendapatkan invoice
   * Authenticated endpoint - requires login
   * Ownership verification di service layer
   */
  router.get(
    '/:id',
    autentikasiMiddleware,
    asyncErrorWrapper(controller.dapatkanInvoice.bind(controller))
  );

  return router;
}
