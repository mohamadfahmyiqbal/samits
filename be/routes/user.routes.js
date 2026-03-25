// routes/user.routes.js
import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';

// Import Controller yang sudah dipecah (direfactor)
import { login } from '../controllers/user/loginController.js';
import { logout } from '../controllers/user/logoutController.js';
import { registerKaryawan } from '../controllers/user/registerController.js';
import { getProfile } from '../controllers/user/profileController.js';
import { updateUser } from '../controllers/user/updateController.js';
import { getAllKaryawan } from '../controllers/user/getAllKaryawanController.js';
import { getKaryawanByNik } from '../controllers/user/getKaryawanByNikController.js';

const router = express.Router();

// Public route
router.post('/register', registerKaryawan);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes (Perlu Token JWT)
router.get('/profile', authMiddleware, getProfile);
router.put('/:nik', authMiddleware, updateUser);
router.get('/karyawan/:nik', authMiddleware, getKaryawanByNik);

// Public route - untuk dropdown karyawan
router.get('/getallkaryawan', getAllKaryawan);

export default router;
