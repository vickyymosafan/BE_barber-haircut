import { IsNotEmpty, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';

/**
 * DTO untuk membuat booking baru
 * Alasan: Validasi input dari client sebelum diproses
 */
export class BuatBookingDto {
  @IsNotEmpty({ message: 'Barber ID tidak boleh kosong' })
  @IsUUID('4', { message: 'Format Barber ID tidak valid' })
  barberId: string;

  @IsNotEmpty({ message: 'Layanan ID tidak boleh kosong' })
  @IsUUID('4', { message: 'Format Layanan ID tidak valid' })
  layananId: string;

  @IsNotEmpty({ message: 'Tanggal booking tidak boleh kosong' })
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  tanggalBooking: string;

  @IsNotEmpty({ message: 'Jam booking tidak boleh kosong' })
  @IsInt({ message: 'Jam booking harus berupa angka bulat' })
  @Min(9, { message: 'Jam booking minimal 09.00' })
  @Max(23, { message: 'Jam booking maksimal 23.00' })
  jamBooking: number;
}
