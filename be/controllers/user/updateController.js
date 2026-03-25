// controllers/user/updateController.js
import * as userService from '../../services/user.service.js';

/**
 * @description Memperbarui data pengguna berdasarkan NIK.
 * @route PUT /api/users/:nik
 * @access Protected
 */
export const updateUser = async (req, res) => {
    try {
        const nikToUpdate = req.params.nik;
        
        const updatedUser = await userService.updateUser(nikToUpdate, req.body);
        
        res.status(200).json({ 
            message: 'Pengguna berhasil diperbarui.', 
            data: updatedUser 
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            message: 'Gagal memperbarui pengguna.'
        });
    }
};
