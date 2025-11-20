/**
 * Invoice Utility
 * Alasan: Utility functions untuk generate nomor invoice dan handle invoice operations
 */

/**
 * Generate nomor invoice unik
 * Format: INV-YYYYMMDD-XXXXX
 * Alasan: Format yang mudah dibaca dan unique
 *
 * @returns Nomor invoice unik
 *
 * @example
 * generateNomorInvoice() // "INV-20250120-A1B2C"
 */
export function generateNomorInvoice(): string {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Generate random 5 character alphanumeric string
  // Alasan: Kombinasi timestamp dan random untuk ensure uniqueness
  const timestamp = Date.now().toString(36).toUpperCase(); // Convert to base36
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const uniquePart = (timestamp + random).substring(0, 5);

  return `INV-${datePart}-${uniquePart}`;
}

/**
 * Generate URL invoice placeholder
 * Alasan: Untuk MVP, kita return placeholder URL
 * Dalam production, ini bisa diganti dengan actual cloud storage URL atau PDF generation
 *
 * @param nomorInvoice - Nomor invoice
 * @returns URL invoice
 */
export function generateUrlInvoice(nomorInvoice: string): string {
  // Untuk MVP, return placeholder URL
  // Dalam production, ini bisa diganti dengan:
  // - Cloud storage URL (S3, Cloudinary, etc)
  // - PDF generation service URL
  // - Base64 encoded PDF
  return `/api/invoice/download/${nomorInvoice}`;
}
