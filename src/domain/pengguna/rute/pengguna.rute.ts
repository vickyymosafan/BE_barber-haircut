import { Router } from 'express';
import { asyncErrorWrapper, autentikasiMiddleware, validasiDto } from '@infrastruktur/middleware';
import { RepositoriPengguna } from '../repositori';
import { ServicePengguna } from '../service';
import { ControllerPengguna } from '../controller';
import { DaftarPenggunaDto, LoginPenggunaDto } from '../dto';

/**
 * Setup routes untuk domain Pengguna
 * Alasan: Centralized routing configuration
 */
export function setupRutePengguna(): Router {
  const router = Router();

  // Initialize dependencies
  // Alasan: Dependency injection pattern untuk testability
  const repositori = new RepositoriPengguna();
  const service = new ServicePengguna(repositori);
  const controller = new ControllerPengguna(service);

  /**
   * POST /api/auth/daftar
   * Registrasi pengguna baru
   * Public endpoint
   */
  router.post(
    '/daftar',
    validasiDto(DaftarPenggunaDto),
    asyncErrorWrapper(controller.daftar.bind(controller))
  );

  /**
   * POST /api/auth/login
   * Login pengguna
   * Public endpoint
   */
  router.post(
    '/login',
    validasiDto(LoginPenggunaDto),
    asyncErrorWrapper(controller.login.bind(controller))
  );

  /**
   * GET /api/auth/profil
   * Mendapatkan profil pengguna yang sedang login
   * Protected endpoint - requires authentication
   */
  router.get(
    '/profil',
    autentikasiMiddleware,
    asyncErrorWrapper(controller.dapatkanProfil.bind(controller))
  );

  /**
   * PUT /api/auth/profil
   * Memperbarui profil pengguna yang sedang login
   * Protected endpoint - requires authentication
   */
  router.put(
    '/profil',
    autentikasiMiddleware,
    asyncErrorWrapper(controller.perbaruiProfil.bind(controller))
  );

  return router;
}
