import { Response } from 'express';
import { ResponseBuilder } from '@infrastruktur/util';
import { AuthenticatedRequest } from '@infrastruktur/middleware';
import { ServiceInvoice } from '../service';

/**
 * Controller Invoice
 * Alasan: Menangani HTTP requests untuk domain Invoice
 */
export class ControllerInvoice {
  constructor(private service: ServiceInvoice) {}

  /**
   * Handler untuk mendapatkan invoice (authenticated)
   * GET /api/invoice/:id
   */
  async dapatkanInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const penggunaId = req.user!.id;

    const invoice = await this.service.dapatkanInvoice(id, penggunaId);
    res.json(ResponseBuilder.sukses(invoice, 'Invoice berhasil diambil'));
  }
}
