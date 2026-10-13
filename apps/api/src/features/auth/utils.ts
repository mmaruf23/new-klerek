import crypto from "node:crypto";

export const getUsernameFromEmail = (email: string) => {
  return email.split("@")[0];
};

/**
 * 1. Fungsi untuk melakukan HASH password
 * @param password Password teks polos dari user
 * @returns String hasil gabungan salt dan hash untuk disimpan di database
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Membuat salt acak sepanjang 16 bytes (32 karakter hex)
    const salt = crypto.randomBytes(16).toString("hex");

    // Menggunakan scrypt untuk mengamankan password
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);

      const hash = derivedKey.toString("hex");
      // Gabungkan salt dan hash dengan titik (.) agar muat dalam 1 kolom database
      resolve(`${salt}.${hash}`);
    });
  });
}

/**
 * 2. Fungsi untuk meng-COMPARE / memverifikasi password
 * @param password Password teks polos yang diinput saat login
 * @param storedHash String hash yang diambil dari database (format: salt.hash)
 * @returns Boolean true jika cocok, false jika salah
 */
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Pisahkan kembali salt dan hash asli menggunakan pemisah '.'
    const [salt, originalHash] = storedHash.split(".");

    if (!salt || !originalHash) {
      return resolve(false); // Format hash cacat atau tidak valid
    }

    // Hash ulang password input dengan salt dari database
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);

      const currentHash = derivedKey.toString("hex");

      // Mengubah string hex ke bentuk Buffer agar bisa dibandingkan dengan aman
      const bufferOriginal = Buffer.from(originalHash, "hex");
      const bufferCurrent = Buffer.from(currentHash, "hex");

      // Proteksi awal jika panjang karakter berbeda
      if (bufferOriginal.length !== bufferCurrent.length) {
        return resolve(false);
      }

      // timingSafeEqual wajib digunakan untuk mencegah Timing Attacks
      const isMatch = crypto.timingSafeEqual(bufferOriginal, bufferCurrent);
      resolve(isMatch);
    });
  });
}
