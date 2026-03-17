// controllers/user/loginController.js
import * as userService from '../../services/user.service.js';
import * as jwtHelper from '../../utils/jwtHelper.js';

/**
 * @description Menangani permintaan login pengguna.
 * @route POST /api/users/login
 * @access Public
 */
export const login = async (req, res) => {
    try {
        const { nik, password } = req.body;

        const nikInput = typeof nik === 'string' ? nik.trim() : '';
        const passwordInput = typeof password === 'string' ? password : '';

        if (!nikInput || !passwordInput) {
            return res.status(400).json({ message: 'NIK dan password wajib diisi.' });
        }

        const user = await userService.authenticateUser(nikInput, passwordInput);
        
        if (!user) {
             return res.status(401).json({ message: 'NIK atau password salah.' });
         }

         // Generate JWT token
         const token = jwtHelper.generateToken({ 
             id: user.nik, 
             nik: user.nik, 
             position: user.position 
         }); 

         res.cookie('authToken', token, {
             httpOnly: true,
             secure: true,
             sameSite: 'none',
             maxAge: 60 * 60 * 1000
         });

         res.status(200).json({ 
             message: 'Login berhasil.', 
             token: token, 
             user: {
                 nik: user.nik,
                 nama: user.nama,
                 name: user.nama,
                 dept: user.position,
                 position: user.position
             }
         });
    } catch (error) {
        console.error('Login error:', error);
        
         res.status(500).json({ 
             message: 'Terjadi kesalahan saat login.' 
         });
    }
};
