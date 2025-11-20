import { Repository } from 'typeorm';
import { dapatkanKoneksiDatabase } from '@infrastruktur/database';
import { ErrorFactory } from '@infrastruktur/util';
import { Pengguna } from '../entitas/pengguna.entitas';
import { IRepositoriPengguna } from './pengguna.repositori.interface';

/**
 * Implementasi Repository Pengguna
 * Alasan: Menangani semua operasi database untuk entitas Pengguna
 */
export class RepositoriPengguna implements IRepositoriPengguna {
  private repository: Repository<Pengguna> | null = null;

  /**
   * Get TypeORM repository instance
   * Alasan: Lazy loading repository untuk serverless compatibility
   */
  private async getRepository(): Promise<Repository<Pengguna>> {
    if (!this.repository) {
      const dataSource = await dapatkanKoneksiDatabase();
      this.repository = dataSource.getRepository(Pengguna);
    }
    return this.repository;
  }

  /**
   * Membuat pengguna baru
   */
  async buatPengguna(data: Partial<Pengguna>): Promise<Pengguna> {
    try {
      const repo = await this.getRepository();
      const pengguna = repo.create(data);
      return await repo.save(pengguna);
    } catch (error) {
      // Check untuk duplicate email error
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw ErrorFactory.validasiGagal('Email sudah terdaftar');
      }
      throw ErrorFactory.databaseError('Gagal membuat pengguna', error);
    }
  }

  /**
   * Mencari pengguna berdasarkan email
   */
  async cariPenggunaByEmail(email: string, includePassword = false): Promise<Pengguna | null> {
    try {
      const repo = await this.getRepository();
      const query = repo.createQueryBuilder('pengguna').where('pengguna.email = :email', { email });

      // Include password hash jika diperlukan (untuk login verification)
      if (includePassword) {
        query.addSelect('pengguna.passwordHash');
      }

      return await query.getOne();
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mencari pengguna', error);
    }
  }

  /**
   * Mencari pengguna berdasarkan ID
   */
  async cariPenggunaById(id: string): Promise<Pengguna | null> {
    try {
      const repo = await this.getRepository();
      return await repo.findOne({ where: { id } });
    } catch (error) {
      throw ErrorFactory.databaseError('Gagal mencari pengguna', error);
    }
  }

  /**
   * Memperbarui data pengguna
   */
  async perbaruiPengguna(id: string, data: Partial<Pengguna>): Promise<Pengguna> {
    try {
      const repo = await this.getRepository();

      // Check apakah pengguna exists
      const pengguna = await this.cariPenggunaById(id);
      if (!pengguna) {
        throw ErrorFactory.validasiGagal('Pengguna tidak ditemukan');
      }

      // Update data
      await repo.update(id, data);

      // Return updated pengguna
      const updated = await this.cariPenggunaById(id);
      if (!updated) {
        throw ErrorFactory.databaseError('Gagal mengambil data pengguna setelah update');
      }

      return updated;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw ErrorFactory.validasiGagal('Email sudah digunakan oleh pengguna lain');
      }
      throw error;
    }
  }
}
