import { Repository } from 'typeorm';
import { dapatkanKoneksiDatabase } from '@infrastruktur/database';
import { ErrorFactory } from '@infrastruktur/util';
import { Invoice } from '../entitas/invoice.entitas';
import { IRepositoriInvoice } from './invoice.repositori.interface';

/**
 * Implementasi Repository Invoice
 * Alasan: Menangani semua operasi database untuk entitas Invoice
 */
export class RepositoriInvoice implements IRepositoriInvoice {
  private repository: Repository<Invoice> | null = null;

  /**
   * Get TypeORM repository instance
   * Alasan: Lazy loading repository untuk serverless compatibility
   */
  private async getRepository(): Promise<Repository<Invoice>> {
    if (!this.repository) {
      const dataSource = await dapatkanKoneksiDatabase();
      this.repository = dataSource.getRepository(Invoice);
    }
    return this.repository;
  }

  /**
   * Membuat invoice baru
   */
  async buatInvoice(data: Partial<Invoice>): Promise<Invoice> {
    try {
      const repo = await this.getRepository();
      const invoice = repo.create(data);
      return await repo.save(invoice);
    } catch (error) {
      // Check untuk unique constraint violation
      if (error instanceof Error && error.message.includes('duplicate key')) {
        if (error.message.includes('nomor_invoice')) {
          throw ErrorFactory.validasiGagal('Nomor invoice sudah digunakan');
        }
        if (error.message.includes('booking_id')) {
          throw ErrorFactory.validasiGagal('Booking ini sudah memiliki invoice');
        }
      }
      throw ErrorFactory.databaseError('Gagal membuat invoice', error);
    }
  }

  /**
   * Mencari invoice berdasarkan ID dengan relations
   */
  async dapatkanInvoiceById(id: string): Promise<Invoice | null> {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({
        where: { id },
        relations: ['booking', 'booking.pengguna', 'booking.barber', 'booking.layanan'],
      });
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mencari invoice', error);
    }
  }

  /**
   * Mencari invoice berdasarkan booking ID
   */
  async dapatkanInvoiceByBookingId(bookingId: string): Promise<Invoice | null> {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({
        where: { bookingId },
        relations: ['booking'],
      });
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mencari invoice', error);
    }
  }

  /**
   * Mencari invoice berdasarkan nomor invoice
   */
  async dapatkanInvoiceByNomorInvoice(nomorInvoice: string): Promise<Invoice | null> {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({
        where: { nomorInvoice },
        relations: ['booking', 'booking.pengguna', 'booking.barber', 'booking.layanan'],
      });
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mencari invoice', error);
    }
  }
}
