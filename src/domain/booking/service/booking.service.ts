import { ErrorFactory } from '@infrastruktur/util';
import { IRepositoriBooking } from '../repositori';
import { BuatBookingDto } from '../dto';
import { Booking, StatusBooking } from '../entitas/booking.entitas';

/**
 * Service Booking
 * Alasan: Menangani business logic untuk domain Booking
 */
export class ServiceBooking {
  constructor(private repositori: IRepositoriBooking) {}

  /**
   * Membuat booking baru
   * @param dto - Data booking baru
   * @param penggunaId - ID pengguna dari JWT token
   * @returns Booking yang telah dibuat
   */
  async buatBookingBaru(dto: BuatBookingDto, penggunaId: string): Promise<Booking> {
    // Validate jam booking range (double check meskipun sudah di DTO)
    if (dto.jamBooking < 9 || dto.jamBooking > 23) {
      throw ErrorFactory.jamTidakValid();
    }

    // Parse tanggal booking
    const tanggalBooking = new Date(dto.tanggalBooking);

    // Cek ketersediaan slot
    const slotTersedia = await this.repositori.cekKetersediaanSlot(
      dto.barberId,
      tanggalBooking,
      dto.jamBooking
    );

    if (!slotTersedia) {
      throw ErrorFactory.slotTidakTersedia();
    }

    // Buat booking dengan status menunggu pembayaran
    return await this.repositori.buatBooking({
      penggunaId,
      barberId: dto.barberId,
      layananId: dto.layananId,
      tanggalBooking,
      jamBooking: dto.jamBooking,
      status: StatusBooking.MENUNGGU_PEMBAYARAN,
    });
  }

  /**
   * Mendapatkan riwayat booking pengguna
   * @param penggunaId - ID pengguna
   * @returns Array booking dengan relations
   */
  async dapatkanRiwayatBooking(penggunaId: string): Promise<Booking[]> {
    return await this.repositori.dapatkanBookingByPengguna(penggunaId);
  }

  /**
   * Membatalkan booking
   * Alasan: Hanya bisa batalkan jika status masih menunggu_pembayaran
   * @param bookingId - ID booking
   * @param penggunaId - ID pengguna dari JWT token
   * @returns Booking yang telah dibatalkan
   */
  async batalkanBooking(bookingId: string, penggunaId: string): Promise<Booking> {
    // Get booking
    const booking = await this.repositori.dapatkanBookingById(bookingId);
    if (!booking) {
      throw ErrorFactory.bookingTidakDitemukan();
    }

    // Check ownership
    if (booking.penggunaId !== penggunaId) {
      throw ErrorFactory.aksesDitolak('Anda tidak memiliki akses ke booking ini');
    }

    // Check status - hanya bisa batalkan jika menunggu pembayaran
    if (booking.status !== StatusBooking.MENUNGGU_PEMBAYARAN) {
      throw ErrorFactory.statusTidakDapatDiubah();
    }

    // Update status ke dibatalkan
    return await this.repositori.perbaruiStatusBooking(bookingId, StatusBooking.DIBATALKAN);
  }

  /**
   * Mendapatkan detail booking
   * @param bookingId - ID booking
   * @returns Booking dengan relations
   */
  async dapatkanBookingById(bookingId: string): Promise<Booking> {
    const booking = await this.repositori.dapatkanBookingById(bookingId);
    if (!booking) {
      throw ErrorFactory.bookingTidakDitemukan();
    }
    return booking;
  }

  /**
   * Mendapatkan semua booking (untuk admin)
   * @returns Array semua booking dengan relations
   */
  async dapatkanSemuaBooking(): Promise<Booking[]> {
    return await this.repositori.dapatkanSemuaBooking();
  }
}
