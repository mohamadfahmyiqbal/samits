// src/middleware/auth.middleware.js
import { verifyToken } from '../utils/jwtHelper.js';

const authMiddleware = (req, res, next) => {
  // 1. Prioritas: Ambil token dari HTTP-only Cookie
  const cookieToken = req.cookies?.authToken; // 🔑 Perubahan Krusial: Mengakses req.cookies
  
  // 2. Alternatif: Ambil dari Authorization Header (Fallback)
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.startsWith('Bearer ') 
                      ? authHeader.split(' ')[1] 
                      : null;

  // 3. Tentukan token
  const token = cookieToken || headerToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ada atau format salah.' });
  }

  // 4. Verifikasi Token
  try {
    const decoded = verifyToken(token);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa.' });
  }
};

export default authMiddleware;