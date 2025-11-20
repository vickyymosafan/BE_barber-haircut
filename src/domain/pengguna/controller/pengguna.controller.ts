import { Request, Response } from 'express';
import { ResponseBuilder } from '@infrastruktur/util';
import { AuthenticatedRequest } from '@infrastruktur/middleware';
import { ServicePengguna } from '../service';
import { DaftarPenggunaDto, LoginPenggunaDto } from '../dto';

/**
 * Controller Pengguna
 * Alasan: Menangani HTTP requests untuk domain Pengguna
 */
export class ControllerPengguna {
  constructor(private service: ServicePengguna) {}

  /**
   * Handler untuk registrasi pengguna baru
   * POST /api/auth/daftar
   */
  async daftar(req: Request, res: Response): Promise<void> {
    const dto = req.body as DaftarPenggunaDto;
    const hasil = await this.service.daftarPengguna(dto);

    res.status(201).json(ResponseBuilder.created(hasil.pengguna, hasil.pesan));
  }

  /**
   * Handler untuk login pengguna
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const dto = req.body as LoginPenggunaDto;
    const hasil = await this.service.loginPengguna(dto);

    res.json(
      ResponseBuilder.sukses(
        {
          pengguna: hasil.pengguna,
          token: hasil.token,
        },
        hasil.pesan
      )
    );
  }

  /**
   * Handler untuk mendapatkan profil pengguna
   * GET /api/auth/profil
   */
  async dapatkanProfil(req: AuthenticatedRequest, res: Response): Promise<void> {
    // User ID dari JWT token yang sudah diverifikasi
    const userId = req.user!.id;
    const pengguna = await this.service.dapatkanProfilPengguna(userId);

    res.json(ResponseBuilder.sukses(pengguna, 'Profil berhasil diambil'));
  }

  /**
   * Handler untuk memperbarui profil pengguna
   * PUT /api/auth/profil
   */
  async perbaruiProfil(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { nama, nomorTelepon } = req.body;

    const pengguna = await this.service.perbaruiProfilPengguna(userId, {
      nama,
      nomorTelepon,
    });

    res.json(ResponseBuilder.updated(pengguna, 'Profil berhasil diperbarui'));
  }
}
