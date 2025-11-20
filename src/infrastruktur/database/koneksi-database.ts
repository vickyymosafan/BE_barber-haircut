import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '@konfigurasi/environment';
import { Pengguna } from '../../domain/pengguna/entitas/pengguna.entitas';

/**
 * Singleton instance untuk database connection
 * Alasan: Menghindari pembuatan koneksi berulang di environment serverless
 */
let dataSource: DataSource | null = null;

/**
 * Mendapatkan koneksi database dengan singleton pattern
 * Jika koneksi sudah ada dan masih aktif, return koneksi existing
 * Jika belum ada atau tidak aktif, buat koneksi baru
 * Alasan: Serverless functions dapat reuse connection antar invocations
 */
export async function dapatkanKoneksiDatabase(): Promise<DataSource> {
  // Jika koneksi sudah ada dan masih connected, return existing
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  // Buat koneksi baru dengan konfigurasi serverless-friendly
  dataSource = new DataSource({
    type: 'postgres',
    url: config.database.url,
    entities: [
      Pengguna,
      // Entities lain akan ditambahkan saat domain dibuat
    ],
    migrations: ['src/infrastruktur/database/migrasi/*.ts'],
    synchronize: config.app.nodeEnv === 'development',
    logging: config.app.nodeEnv === 'development',
    // Serverless-friendly settings
    // Alasan: Serverless memiliki keterbatasan connection pool
    extra: {
      max: 1, // Maximum pool size untuk serverless (1 connection per instance)
      connectionTimeoutMillis: 5000, // Timeout 5 detik untuk menghindari hanging
    },
  });

  // Initialize connection
  await dataSource.initialize();

  return dataSource;
}

/**
 * Menutup koneksi database
 * Alasan: Untuk cleanup saat testing atau shutdown graceful
 */
export async function tutupKoneksiDatabase(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
    dataSource = null;
  }
}

/**
 * Mendapatkan DataSource instance tanpa initialize
 * Alasan: Untuk keperluan migration dan seeding
 */
export function getDataSource(): DataSource | null {
  return dataSource;
}
