// utils/jwtHelper.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Ambil secret key dari environment variable
const JWT_SECRET = process.env.JWT_SECRET;
// Token akan kadaluarsa dalam 8 jam (full work day)
const TOKEN_EXPIRATION = "8h";

/**
 * Membuat token JWT baru dengan data pengguna yang diberikan.
 * @param {object} payload - Data pengguna (misalnya: id, nik, role)
 * @returns {string} Token JWT yang telah dibuat
 */
export const generateToken = (payload) => {
  // Pastikan secret key ada
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET tidak terdefinisi di environment variables.");
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

/**
 * Memverifikasi token JWT (digunakan di auth.middleware.js)
 * @param {string} token - Token JWT
 * @returns {object} Payload yang terdekode
 */
export const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET tidak terdefinisi di environment variables.");
  }
  return jwt.verify(token, JWT_SECRET);
};
