import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Schema Migration
 * Membuat semua tabel untuk aplikasi barber booking
 */
export class InitialSchema1732176000000 implements MigrationInterface {
  name = 'InitialSchema1732176000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enums
    await queryRunner.query(`
      CREATE TYPE "pengguna_role_enum" AS ENUM('pelanggan', 'admin')
    `);

    await queryRunner.query(`
      CREATE TYPE "booking_status_enum" AS ENUM('menunggu_pembayaran', 'berhasil', 'dibatalkan')
    `);

    await queryRunner.query(`
      CREATE TYPE "pembayaran_status_enum" AS ENUM('pending', 'berhasil', 'gagal')
    `);

    // Create pengguna table
    await queryRunner.query(`
      CREATE TABLE "pengguna" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "nama" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "nomor_telepon" character varying(20) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role" "pengguna_role_enum" NOT NULL DEFAULT 'pelanggan',
        CONSTRAINT "UQ_pengguna_email" UNIQUE ("email"),
        CONSTRAINT "PK_pengguna" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pengguna_email" ON "pengguna" ("email")
    `);

    // Create barber table
    await queryRunner.query(`
      CREATE TABLE "barber" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "nama" character varying(255) NOT NULL,
        "foto_profil_url" text,
        "rating" numeric(3,2) NOT NULL DEFAULT 0.0,
        "status_aktif" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_barber" PRIMARY KEY ("id")
      )
    `);

    // Create layanan table
    await queryRunner.query(`
      CREATE TABLE "layanan" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "nama_layanan" character varying(255) NOT NULL,
        "harga" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_layanan" PRIMARY KEY ("id")
      )
    `);

    // Create booking table
    await queryRunner.query(`
      CREATE TABLE "booking" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "pengguna_id" uuid NOT NULL,
        "barber_id" uuid NOT NULL,
        "layanan_id" uuid NOT NULL,
        "tanggal_booking" date NOT NULL,
        "jam_booking" integer NOT NULL,
        "status" "booking_status_enum" NOT NULL DEFAULT 'menunggu_pembayaran',
        CONSTRAINT "PK_booking" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_booking_slot" UNIQUE ("barber_id", "tanggal_booking", "jam_booking"),
        CONSTRAINT "FK_booking_pengguna" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_barber" FOREIGN KEY ("barber_id") REFERENCES "barber"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_booking_layanan" FOREIGN KEY ("layanan_id") REFERENCES "layanan"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_booking_pengguna" ON "booking" ("pengguna_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_booking_barber" ON "booking" ("barber_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_booking_layanan" ON "booking" ("layanan_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_booking_tanggal" ON "booking" ("tanggal_booking")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_booking_status" ON "booking" ("status")
    `);

    // Create pembayaran table
    await queryRunner.query(`
      CREATE TABLE "pembayaran" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "booking_id" uuid NOT NULL,
        "metode_pembayaran" character varying(50) NOT NULL,
        "jumlah" numeric(10,2) NOT NULL,
        "status_pembayaran" "pembayaran_status_enum" NOT NULL DEFAULT 'pending',
        CONSTRAINT "UQ_pembayaran_booking" UNIQUE ("booking_id"),
        CONSTRAINT "PK_pembayaran" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pembayaran_booking" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pembayaran_booking" ON "pembayaran" ("booking_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pembayaran_status" ON "pembayaran" ("status_pembayaran")
    `);

    // Create invoice table
    await queryRunner.query(`
      CREATE TABLE "invoice" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "nomor_invoice" character varying(50) NOT NULL,
        "booking_id" uuid NOT NULL,
        "total_harga" numeric(10,2) NOT NULL,
        "url_invoice" text NOT NULL,
        CONSTRAINT "UQ_invoice_nomor" UNIQUE ("nomor_invoice"),
        CONSTRAINT "UQ_invoice_booking" UNIQUE ("booking_id"),
        CONSTRAINT "PK_invoice" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoice_booking" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_invoice_nomor" ON "invoice" ("nomor_invoice")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_invoice_booking" ON "invoice" ("booking_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables (foreign keys akan otomatis terhapus)
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pembayaran" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "booking" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "layanan" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "barber" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pengguna" CASCADE`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "pembayaran_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "booking_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "pengguna_role_enum"`);
  }
}
