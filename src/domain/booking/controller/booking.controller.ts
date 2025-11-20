import { Request, Response } from 'express';
import { ResponseBuilder } from '@infrastruktur/util';
import { AuthenticatedRequest } from '@infrastruktur/middleware';
import { ServiceBooking } from '../service';
import { BuatBookingDto } from '../dto';

/**
 * Controller Booking
 * Alasan: Menangani HTTP requests untuk domain Booking
 */
export class ControllerBooking {
  constructor(private service: ServiceBooking) {}

  /**
   * Handler untuk membuat booking baru (authenticated)
   * POST /api/booking
   */
  async buatBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    const dto = req.body as BuatBookingDto;
    const penggunaId = req.user!.id;

    const booking = await this.service.buatBookingBaru(dto, penggunaId);
    res.status(201).json(ResponseBuilder.created(booking, 'Booking berhasil dibuat'));
  }

  /**
   * Handler untuk mendapatkan riwayat booking pengguna (authenticated)
   * GET /api/booking/saya
   */
  async dapatkanRiwayatBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    const penggunaId = req.user!.id;
    const bookings = await this.service.dapatkanRiwayatBooking(penggunaId);
    res.json(ResponseBuilder.sukses(bookings, 'Riwayat booking berhasil diambil'));
  }

  /**
   * Handler untuk membatalkan booking (authenticated)
   * DELETE /api/booking/:id
   */
  async batalkanBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const penggunaId = req.user!.id;

    const booking = await this.service.batalkanBooking(id, penggunaId);
    res.json(ResponseBuilder.updated(booking, 'Booking berhasil dibatalkan'));
  }

  /**
   * Handler untuk mendapatkan semua booking (admin only)
   * GET /api/admin/booking
   */
  async dapatkanSemuaBooking(_req: Request, res: Response): Promise<void> {
    const bookings = await this.service.dapatkanSemuaBooking();
    res.json(ResponseBuilder.sukses(bookings, 'Daftar semua booking berhasil diambil'));
  }
}
