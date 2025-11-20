import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntitas } from '@infrastruktur/database';

/**
 * Entitas Pengguna
 * Alasan: Menyimpan data pengguna sistem (pelanggan dan admin)
 */
@Entity('pengguna')
export class Pengguna extends BaseEntitas {
  @Column({ type: 'varchar', length: 255 })
  nama: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_pengguna_email')
  email: string;

  @Column({ name: 'nomor_telepon', type: 'varchar', length: 20 })
  nomorTelepon: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['pelanggan', 'admin'],
    default: 'pelanggan',
  })
  role: 'pelanggan' | 'admin';

  // Relasi one-to-many ke Booking
  // Alasan: Satu pengguna bisa memiliki banyak booking
  // Lazy loading untuk performance - hanya load saat dibutuhkan
  @OneToMany('Booking', 'pengguna', { lazy: true })
  bookings: Promise<unknown[]>;

  /**
   * Method untuk convert entity ke plain object tanpa password
   * Alasan: Security - jangan expose password hash ke client
   */
  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...result } = this;
    return result;
  }
}
