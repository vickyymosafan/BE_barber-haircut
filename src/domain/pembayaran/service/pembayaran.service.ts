import { ErrorFactory, generateNomorInvoice, generateUrlInvoice } from '@infrastruktur/util';
import { IRepositoriPembayaran } from '../repositori';
import { IRepositoriBooking } from '@domain/booking/repositori';
import { IRepositoriInvoice } from '@domain/invoice/repositori';
import { StatusBooking } from '@domain/booking/entitas/booking.entitas';
import { ProsesPembayaranDto } from '../dto';
import { Pembayaran, StatusPembayaran } from '../entitas/pembayaran.entitas';

/**
 * Response untuk proses pembayaran
 */
export interface HasilPembayaran {
  pembayaran: Pembayaran;
  pesan: string;
}

/**
 * Service Pembayaran
 * Alasan: Menangani business logic untuk domain Pembayaran
 */
export class ServicePembayaran {
  constructor(
    private repositoriPembayaran: IRepositoriPembayaran,
    private repositoriBooking: IRepositoriBooking,
    private repositoriInvoice: IRepositoriInvoice
  ) {}

  /**
   * Memproses pembayaran untuk booking
   * Alasan: Complex business logic untuk validate dan process payment
   * @param dto - Data pembayaran
   * @param penggunaId - ID pengguna dari JWT token
   * @returns Hasil pembayaran
   */
  async prosesPembayaran(dto: ProsesPembayaranDto, penggunaId: string): Promise<HasilPembayaran> {
    // 1. Verify booking exists
    const booking = await this.repositoriBooking.dapatkanBookingById(dto.bookingId);
    if (!booking) {
      throw ErrorFactory.bookingTidakDitemukan();
    }

    // 2. Verify user owns the booking (security)
    if (booking.penggunaId !== penggunaId) {
      throw ErrorFactory.aksesDitolak('Anda tidak memiliki akses ke booking ini');
    }

    // 3. Check booking status - hanya bisa bayar jika menunggu pembayaran
    if (booking.status !== StatusBooking.MENUNGGU_PEMBAYARAN) {
      throw ErrorFactory.statusTidakDapatDiubah();
    }

    // 4. Check booking belum punya pembayaran (one-to-one constraint)
    const existingPembayaran = await this.repositoriPembayaran.dapatkanPembayaranByBookingId(
      dto.bookingId
    );
    if (existingPembayaran) {
      throw ErrorFactory.validasiGagal('Booking ini sudah memiliki pembayaran');
    }

    // 5. Buat pembayaran dengan status berhasil
    const pembayaran = await this.repositoriPembayaran.buatPembayaran({
      bookingId: dto.bookingId,
      metodePembayaran: dto.metodePembayaran,
      jumlah: dto.jumlah,
      statusPembayaran: StatusPembayaran.BERHASIL,
    });

    // 6. Update status booking ke berhasil
    await this.repositoriBooking.perbaruiStatusBooking(dto.bookingId, StatusBooking.BERHASIL);

    // 7. Trigger pembuatan invoice
    // Alasan: Invoice dibuat otomatis setelah pembayaran berhasil
    try {
      // Generate nomor invoice unik
      const nomorInvoice = generateNomorInvoice();

      // Get booking dengan relations untuk ambil harga layanan
      const bookingWithRelations = await this.repositoriBooking.dapatkanBookingById(dto.bookingId);
      if (bookingWithRelations) {
        const layanan = await bookingWithRelations.layanan;
        const totalHarga = layanan.harga;

        // Generate URL invoice
        const urlInvoice = generateUrlInvoice(nomorInvoice);

        // Buat invoice
        await this.repositoriInvoice.buatInvoice({
          nomorInvoice,
          bookingId: dto.bookingId,
          totalHarga,
          urlInvoice,
        });
      }
    } catch (error) {
      // Log error tapi jangan fail payment
      // Alasan: Payment sudah berhasil, invoice bisa dibuat manual jika gagal
      console.error('Gagal membuat invoice:', error);
    }

    return {
      pembayaran,
      pesan: 'Pembayaran berhasil diproses',
    };
  }

  /**
   * Mendapatkan pembayaran berdasarkan booking ID
   * @param bookingId - ID booking
   * @returns Pembayaran atau null
   */
  async dapatkanPembayaranByBookingId(bookingId: string): Promise<Pembayaran | null> {
    return await this.repositoriPembayaran.dapatkanPembayaranByBookingId(bookingId);
  }
}
