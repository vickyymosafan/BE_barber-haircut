import { Pengguna } from '../entitas/pengguna.entitas';

/**
 * Interface Repository Pengguna
 * Alasan: Abstraksi untuk data access layer, memudahkan testing dan maintainability
 */
export interface IRepositoriPengguna {
  /**
   * Membuat pengguna baru
   * @param data - Data pengguna baru
   * @returns Pengguna yang telah dibuat
   */
  buatPengguna(data: Partial<Pengguna>): Promise<Pengguna>;

  /**
   * Mencari pengguna berdasarkan email
   * @param email - Email pengguna
   * @param includePassword - Include password hash untuk verification (default: false)
   * @returns Pengguna atau null jika tidak ditemukan
   */
  cariPenggunaByEmail(email: string, includePassword?: boolean): Promise<Pengguna | null>;

  /**
   * Mencari pengguna berdasarkan ID
   * @param id - ID pengguna
   * @returns Pengguna atau null jika tidak ditemukan
   */
  cariPenggunaById(id: string): Promise<Pengguna | null>;

  /**
   * Memperbarui data pengguna
   * @param id - ID pengguna
   * @param data - Data yang akan diupdate
   * @returns Pengguna yang telah diupdate
   */
  perbaruiPengguna(id: string, data: Partial<Pengguna>): Promise<Pengguna>;
}
