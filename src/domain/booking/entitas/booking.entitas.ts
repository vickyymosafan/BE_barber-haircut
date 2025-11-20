import { Entity, Column, ManyToOne, OneToOne, JoinColumn, Unique, Index } from 'typeorm';
import { BaseEntitas } from '@infrastruktur/database';
import { Pengguna } from '@domain/pengguna/entitas/pengguna.entitas';
import { Barber } from '@domain/barber/entitas/barber.entitas';
import { Layanan } from '@domain/layanan/entitas/layanan.entitas';

/**
 * Status Booking
 * Alasan: Enum untuk status lifecycle booking
 */
export enum StatusBooking {
  MENUNGGU_PEMBAYARAN = 'menunggu_pembayaran',
  BERHASIL = 'berhasil',
  DIBATALKAN = 'dibatalkan',
}

/**
 * Entitas Booking
 * Alasan: Menyimpan data reservasi slot waktu untuk layanan barber
 */
@Entity('booking')
@Unique(['barberId', 'tanggalBooking', 'jamBooking'])
export class Booking extends BaseEntitas {
  @Column({ name: 'pengguna_id', type: 'uuid' })
  @Index('idx_booking_pengguna')
  penggunaId: string;

  @Column({ name: 'barber_id', type: 'uuid' })
  @Index('idx_booking_barber')
  barberId: string;

  @Column({ name: 'layanan_id', type: 'uuid' })
  @Index('idx_booking_layanan')
  layananId: string;

  @Column({ name: 'tanggal_booking', type: 'date' })
  @Index('idx_booking_tanggal')
  tanggalBooking: Date;

  @Column({ name: 'jam_booking', type: 'integer' })
  jamBooking: number;

  @Column({
    type: 'enum',
    enum: StatusBooking,
    default: StatusBooking.MENUNGGU_PEMBAYARAN,
  })
  @Index('idx_booking_status')
  status: StatusBooking;

  // Relasi ManyToOne ke Pengguna
  // Alasan: Satu pengguna bisa memiliki banyak booking
  @ManyToOne(() => Pengguna, pengguna => pengguna.bookings, { lazy: true })
  @JoinColumn({ name: 'pengguna_id' })
  pengguna: Promise<Pengguna>;

  // Relasi ManyToOne ke Barber
  // Alasan: Satu barber bisa melayani banyak booking
  @ManyToOne(() => Barber, barber => barber.bookings, { lazy: true })
  @JoinColumn({ name: 'barber_id' })
  barber: Promise<Barber>;

  // Relasi ManyToOne ke Layanan
  // Alasan: Satu layanan bisa digunakan di banyak booking
  @ManyToOne(() => Layanan, layanan => layanan.bookings, { lazy: true })
  @JoinColumn({ name: 'layanan_id' })
  layanan: Promise<Layanan>;

  // Relasi OneToOne ke Pembayaran
  // Alasan: Satu booking hanya memiliki satu pembayaran
  // Akan didefinisikan dari sisi Pembayaran
  @OneToOne('Pembayaran', 'booking', { lazy: true })
  pembayaran: Promise<unknown>;

  // Relasi OneToOne ke Invoice
  // Alasan: Satu booking hanya memiliki satu invoice
  // Akan didefinisikan dari sisi Invoice
  @OneToOne('Invoice', 'booking', { lazy: true })
  invoice: Promise<unknown>;
}
