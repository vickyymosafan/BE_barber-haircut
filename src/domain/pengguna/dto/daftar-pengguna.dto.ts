import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO untuk registrasi pengguna baru
 * Alasan: Validasi input dari client sebelum diproses
 */
export class DaftarPenggunaDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString({ message: 'Nama harus berupa text' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  nama: string;

  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  @IsString({ message: 'Nomor telepon harus berupa text' })
  @Matches(/^[0-9+\-() ]+$/, {
    message: 'Format nomor telepon tidak valid',
  })
  nomorTelepon: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa text' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password harus mengandung huruf dan angka',
  })
  password: string;
}
