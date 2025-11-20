import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntitas } from '@infrastruktur/database';
import { Booking } from '@domain/booking/entitas/booking.entitas';

/**
 * Entitas Invoice
 * Alasan: Menyimpan data invoice/bukti pembayaran untuk booking
 */
@Entity('invoice')
export class Invoice extends BaseEntitas {
  @Column({ name: 'nomor_invoice', type: 'varchar', length: 50, unique: true })
  @Index('idx_invoice_nomor')
  nomorInvoice: string;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  @Index('idx_invoice_booking')
  bookingId: string;

  @Column({ name: 'total_harga', type: 'decimal', precision: 10, scale: 2 })
  totalHarga: number;

  @Column({ name: 'url_invoice', type: 'text' })
  urlInvoice: string;

  // Relasi OneToOne ke Booking
  // Alasan: Satu invoice hanya untuk satu booking
  @OneToOne(() => Booking, booking => booking.invoice, { lazy: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Promise<Booking>;
}
