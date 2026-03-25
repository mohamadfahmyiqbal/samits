// controllers/user/profileController.js
import * as userService from '../../services/user.service.js';

/**
 * @description Mendapatkan profil pengguna yang sedang login (Authenticated).
 * @route GET /api/users/profile
 * @access Protected
 */
export const getProfile = async (req, res) => {
    try {
        // req.user disuntikkan oleh authMiddleware
        const userId = req.user?.nik || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Token tidak valid.' });
        }
        
        const profile = await userService.getUserProfile(userId);
        
        if (!profile) {
            return res.status(404).json({ message: 'Profil tidak ditemukan.' });
        }
        
        res.status(200).json(profile);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Gagal mengambil profil pengguna.'
        });
    }
};
