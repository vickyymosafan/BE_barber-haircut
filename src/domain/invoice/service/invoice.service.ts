import { ErrorFactory, generateNomorInvoice, generateUrlInvoice } from '@infrastruktur/util';
import { IRepositoriInvoice } from '../repositori';
import { IRepositoriBooking } from '@domain/booking/repositori';
import { Invoice } from '../entitas/invoice.entitas';

/**
 * Service Invoice
 * Alasan: Menangani business logic untuk domain Invoice
 */
export class ServiceInvoice {
  constructor(
    private repositoriInvoice: IRepositoriInvoice,
    private repositoriBooking: IRepositoriBooking
  ) {}

  /**
   * Membuat invoice untuk booking
   * Alasan: Dipanggil setelah pembayaran berhasil
   * @param bookingId - ID booking
   * @returns Invoice yang telah dibuat
   */
  async buatInvoice(bookingId: string): Promise<Invoice> {
    // 1. Verify booking exists dan get details dengan relations
    const booking = await this.repositoriBooking.dapatkanBookingById(bookingId);
    if (!booking) {
      throw ErrorFactory.bookingTidakDitemukan();
    }

    // 2. Check booking belum punya invoice (one-to-one constraint)
    const existingInvoice = await this.repositoriInvoice.dapatkanInvoiceByBookingId(bookingId);
    if (existingInvoice) {
      throw ErrorFactory.validasiGagal('Booking ini sudah memiliki invoice');
    }

    // 3. Generate nomor invoice unik
    const nomorInvoice = generateNomorInvoice();

    // 4. Calculate total harga dari booking
    // Alasan: Total harga diambil dari harga layanan
    const layanan = await booking.layanan;
    const totalHarga = layanan.harga;

    // 5. Generate URL invoice
    const urlInvoice = generateUrlInvoice(nomorInvoice);

    // 6. Simpan invoice
    const invoice = await this.repositoriInvoice.buatInvoice({
      nomorInvoice,
      bookingId,
      totalHarga,
      urlInvoice,
    });

    return invoice;
  }

  /**
   * Mendapatkan invoice dengan ownership verification
   * @param invoiceId - ID invoice
   * @param penggunaId - ID pengguna dari JWT token
   * @returns Invoice dengan relations
   */
  async dapatkanInvoice(invoiceId: string, penggunaId: string): Promise<Invoice> {
    // Get invoice dengan relations
    const invoice = await this.repositoriInvoice.dapatkanInvoiceById(invoiceId);
    if (!invoice) {
      throw ErrorFactory.invoiceTidakDitemukan();
    }

    // Verify ownership - user owns the booking
    const booking = await invoice.booking;
    if (booking.penggunaId !== penggunaId) {
      throw ErrorFactory.aksesInvoiceDitolak();
    }

    return invoice;
  }

  /**
   * Generate PDF invoice (placeholder untuk future implementation)
   * Alasan: Untuk MVP, return placeholder
   * Dalam production, ini bisa menggunakan library seperti pdfkit atau cloud service
   * @param invoice - Invoice entity
   * @returns URL atau base64 PDF
   */
  async generatePdfInvoice(invoice: Invoice): Promise<string> {
    // TODO: Implement actual PDF generation
    // Bisa menggunakan:
    // - pdfkit library
    // - Cloud service (AWS Lambda, Cloudinary)
    // - External API

    // Untuk MVP, return placeholder URL
    return invoice.urlInvoice;
  }
}
