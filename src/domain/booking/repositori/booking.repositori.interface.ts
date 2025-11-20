import { Booking, StatusBooking } from '../entitas/booking.entitas';

/**
 * Interface Repository Booking
 * Alasan: Abstraksi untuk data access layer, memudahkan testing dan maintainability
 */
export interface IRepositoriBooking {
  /**
   * Membuat booking baru
   * @param data - Data booking baru
   * @returns Booking yang telah dibuat
   */
  buatBooking(data: Partial<Booking>): Promise<Booking>;

  /**
   * Cek ketersediaan slot waktu
   * @param barberId - ID barber
   * @param tanggal - Tanggal booking
   * @param jam - Jam booking
   * @returns true jika slot tersedia, false jika sudah terisi
   */
  cekKetersediaanSlot(barberId: string, tanggal: Date, jam: number): Promise<boolean>;

  /**
   * Mencari booking berdasarkan ID dengan relations
   * @param id - ID booking
   * @returns Booking dengan relations atau null jika tidak ditemukan
   */
  dapatkanBookingById(id: string): Promise<Booking | null>;

  /**
   * Mendapatkan semua booking milik pengguna dengan relations
   * @param penggunaId - ID pengguna
   * @returns Array booking dengan relations
   */
  dapatkanBookingByPengguna(penggunaId: string): Promise<Booking[]>;

  /**
   * Memperbarui status booking
   * @param id - ID booking
   * @param status - Status baru
   * @returns Booking yang telah diupdate
   */
  perbaruiStatusBooking(id: string, status: StatusBooking): Promise<Booking>;

  /**
   * Mendapatkan semua booking (untuk admin)
   * @returns Array semua booking dengan relations
   */
  dapatkanSemuaBooking(): Promise<Booking[]>;
}
