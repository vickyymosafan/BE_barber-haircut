import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO untuk login pengguna
 * Alasan: Validasi input login dari client
 */
export class LoginPenggunaDto {
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa text' })
  password: string;
}
