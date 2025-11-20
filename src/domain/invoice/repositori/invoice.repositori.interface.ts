import { Invoice } from '../entitas/invoice.entitas';

/**
 * Interface Repository Invoice
 * Alasan: Abstraksi untuk data access layer, memudahkan testing dan maintainability
 */
export interface IRepositoriInvoice {
  /**
   * Membuat invoice baru
   * @param data - Data invoice baru
   * @returns Invoice yang telah dibuat
   */
  buatInvoice(data: Partial<Invoice>): Promise<Invoice>;

  /**
   * Mencari invoice berdasarkan ID dengan relations
   * @param id - ID invoice
   * @returns Invoice dengan relations atau null jika tidak ditemukan
   */
  dapatkanInvoiceById(id: string): Promise<Invoice | null>;

  /**
   * Mencari invoice berdasarkan booking ID
   * @param bookingId - ID booking
   * @returns Invoice atau null jika tidak ditemukan
   */
  dapatkanInvoiceByBookingId(bookingId: string): Promise<Invoice | null>;

  /**
   * Mencari invoice berdasarkan nomor invoice
   * @param nomorInvoice - Nomor invoice
   * @returns Invoice atau null jika tidak ditemukan
   */
  dapatkanInvoiceByNomorInvoice(nomorInvoice: string): Promise<Invoice | null>;
}
