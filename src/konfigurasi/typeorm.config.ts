import 'reflect-metadata';
import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';
import { config } from './environment';

/**
 * DataSource configuration untuk TypeORM CLI
 * Digunakan untuk generate, run, dan revert migrations
 * Alasan: TypeORM CLI membutuhkan DataSource yang di-export untuk migration commands
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  entities: [
    // Load entities explicitly untuk migration CLI
    __dirname + '/../domain/**/entitas/*.{ts,js}',
  ],
  migrations: [__dirname + '/../infrastruktur/database/migrasi/*.{ts,js}'],
  synchronize: false, // Selalu false untuk production safety
  logging: config.app.nodeEnv === 'development',
  // Migration-specific settings
  migrationsTableName: 'migrasi_typeorm',
  migrationsRun: false, // Jangan auto-run migrations, harus manual
});

/**
 * Initialize DataSource untuk CLI usage
 * Alasan: CLI membutuhkan initialized DataSource
 */
AppDataSource.initialize()
  .then(() => {
    console.log('TypeORM DataSource initialized for CLI');
  })
  .catch(error => {
    console.error('Error initializing TypeORM DataSource:', error);
    process.exit(1);
  });
