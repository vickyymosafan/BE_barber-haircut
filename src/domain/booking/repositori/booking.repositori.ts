import { Repository } from 'typeorm';
import { dapatkanKoneksiDatabase } from '@infrastruktur/database';
import { ErrorFactory } from '@infrastruktur/util';
import { Booking, StatusBooking } from '../entitas/booking.entitas';
import { IRepositoriBooking } from './booking.repositori.interface';

/**
 * Implementasi Repository Booking
 * Alasan: Menangani semua operasi database untuk entitas Booking
 */
export class RepositoriBooking implements IRepositoriBooking {
  private repository: Repository<Booking> | null = null;

  /**
   * Get TypeORM repository instance
   * Alasan: Lazy loading repository untuk serverless compatibility
   */
  private async getRepository(): Promise<Repository<Booking>> {
    if (!this.repository) {
      const dataSource = await dapatkanKoneksiDatabase();
      this.repository = dataSource.getRepository(Booking);
    }
    return this.repository;
  }

  /**
   * Membuat booking baru
   */
  async buatBooking(data: Partial<Booking>): Promise<Booking> {
    try {
      const repo = await this.getRepository();
      const booking = repo.create(data);
      return await repo.save(booking);
    } catch (error) {
      // Check untuk unique constraint violation (double booking)
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw ErrorFactory.slotTidakTersedia();
      }
      throw ErrorFactory.databaseError('Gagal membuat booking', error);
    }
  }

  /**
   * Cek ketersediaan slot waktu
   * Alasan: Mencegah double booking dengan query existing bookings
   */
  async cekKetersediaanSlot(barberId: string, tanggal: Date, jam: number): Promise<boolean> {
    try {
      const repo = await this.getRepository();

      // Query booking dengan barber, tanggal, dan jam yang sama
      // Hanya cek booking yang tidak dibatalkan
      const existingBooking = await repo
        .createQueryBuilder('booking')
        .where('booking.barberId = :barberId', { barberId })
        .andWhere('booking.tanggalBooking = :tanggal', { tanggal })
        .andWhere('booking.jamBooking = :jam', { jam })
        .andWhere('booking.status IN (:...statuses)', {
          statuses: [StatusBooking.MENUNGGU_PEMBAYARAN, StatusBooking.BERHASIL],
        })
        .getOne();

      // Slot tersedia jika tidak ada booking
      return !existingBooking;
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mengecek ketersediaan slot', error);
    }
  }

  /**
   * Mencari booking berdasarkan ID dengan relations
   */
  async dapatkanBookingById(id: string): Promise<Booking | null> {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({
        where: { id },
        relations: ['pengguna', 'barber', 'layanan'],
      });
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mencari booking', error);
    }
  }

  /**
   * Mendapatkan semua booking milik pengguna dengan relations
   */
  async dapatkanBookingByPengguna(penggunaId: string): Promise<Booking[]> {
    try {
      const repo = await this.getRepository();
      return await repo.find({
        where: { penggunaId },
        relations: ['pengguna', 'barber', 'layanan'],
        order: {
          tanggalBooking: 'DESC',
          jamBooking: 'DESC',
        },
      });
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mengambil riwayat booking', error);
    }
  }

  /**
   * Memperbarui status booking
   */
  async perbaruiStatusBooking(id: string, status: StatusBooking): Promise<Booking> {
    try {
      const repo = await this.getRepository();

      // Check apakah booking exists
      const booking = await this.dapatkanBookingById(id);
      if (!booking) {
        throw ErrorFactory.bookingTidakDitemukan();
      }

      // Update status
      await repo.update(id, { status });

      // Return updated booking
      const updated = await this.dapatkanBookingById(id);
      if (!updated) {
        throw ErrorFactory.databaseError('Gagal mengambil data booking setelah update');
      }

      return updated;
    } catch (error) {
      if (error instanceof Error && error.name === 'ErrorAplikasi') {
        throw error;
      }
      throw ErrorFactory.databaseError('Gagal memperbarui status booking', error);
    }
  }

  /**
   * Mendapatkan semua booking (untuk admin)
   */
  async dapatkanSemuaBooking(): Promise<Booking[]> {
    try {
      const repo = await this.getRepository();
      return await repo.find({
        relations: ['pengguna', 'barber', 'layanan'],
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mengambil data booking', error);
    }
  }
}
