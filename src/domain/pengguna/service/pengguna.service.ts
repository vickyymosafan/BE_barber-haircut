import { EnkripsiUtil, JwtUtil, ErrorFactory } from '@infrastruktur/util';
import { IRepositoriPengguna } from '../repositori';
import { DaftarPenggunaDto, LoginPenggunaDto } from '../dto';
import { Pengguna } from '../entitas/pengguna.entitas';

/**
 * Response untuk registrasi
 */
export interface HasilDaftar {
  pengguna: Pengguna;
  pesan: string;
}

/**
 * Response untuk login
 */
export interface HasilLogin {
  pengguna: Pengguna;
  token: string;
  pesan: string;
}

/**
 * Service Pengguna
 * Alasan: Menangani business logic untuk domain Pengguna
 */
export class ServicePengguna {
  constructor(private repositori: IRepositoriPengguna) {}

  /**
   * Registrasi pengguna baru
   * @param dto - Data registrasi pengguna
   * @returns Hasil registrasi dengan data pengguna
   */
  async daftarPengguna(dto: DaftarPenggunaDto): Promise<HasilDaftar> {
    // Check apakah email sudah terdaftar
    const existingUser = await this.repositori.cariPenggunaByEmail(dto.email);
    if (existingUser) {
      throw ErrorFactory.validasiGagal('Email sudah terdaftar');
    }

    // Validate password strength
    const passwordValidation = EnkripsiUtil.validatePasswordStrength(dto.password);
    if (!passwordValidation.isValid) {
      throw ErrorFactory.validasiGagal(passwordValidation.pesan || 'Password tidak valid');
    }

    // Hash password
    const passwordHash = await EnkripsiUtil.hashPassword(dto.password);

    // Buat pengguna baru
    const pengguna = await this.repositori.buatPengguna({
      nama: dto.nama,
      email: dto.email,
      nomorTelepon: dto.nomorTelepon,
      passwordHash,
      role: 'pelanggan', // Default role adalah pelanggan
    });

    return {
      pengguna,
      pesan: 'Registrasi berhasil',
    };
  }

  /**
   * Login pengguna
   * @param dto - Data login pengguna
   * @returns Hasil login dengan token JWT
   */
  async loginPengguna(dto: LoginPenggunaDto): Promise<HasilLogin> {
    // Cari pengguna berdasarkan email (include password untuk verification)
    const pengguna = await this.repositori.cariPenggunaByEmail(dto.email, true);
    if (!pengguna) {
      throw ErrorFactory.kredensialSalah();
    }

    // Verify password
    const isPasswordValid = await EnkripsiUtil.bandingkanPassword(
      dto.password,
      pengguna.passwordHash
    );
    if (!isPasswordValid) {
      throw ErrorFactory.kredensialSalah();
    }

    // Generate JWT token
    const token = JwtUtil.generateToken({
      id: pengguna.id,
      email: pengguna.email,
      role: pengguna.role,
    });

    // Remove password hash dari response
    // Alasan: Security - jangan expose password hash
    delete (pengguna as any).passwordHash;

    return {
      pengguna,
      token,
      pesan: 'Login berhasil',
    };
  }

  /**
   * Mendapatkan profil pengguna berdasarkan ID
   * @param id - ID pengguna
   * @returns Data pengguna
   */
  async dapatkanProfilPengguna(id: string): Promise<Pengguna> {
    const pengguna = await this.repositori.cariPenggunaById(id);
    if (!pengguna) {
      throw ErrorFactory.validasiGagal('Pengguna tidak ditemukan');
    }
    return pengguna;
  }

  /**
   * Memperbarui profil pengguna
   * @param id - ID pengguna
   * @param data - Data yang akan diupdate
   * @returns Pengguna yang telah diupdate
   */
  async perbaruiProfilPengguna(
    id: string,
    data: { nama?: string; nomorTelepon?: string }
  ): Promise<Pengguna> {
    // Validate pengguna exists
    await this.dapatkanProfilPengguna(id);

    // Update data
    return await this.repositori.perbaruiPengguna(id, data);
  }
}
