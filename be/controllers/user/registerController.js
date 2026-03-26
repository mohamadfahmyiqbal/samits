// controllers/user/registerController.js
import * as userService from '../../services/user.service.js';

const normalizeString = (value) => {
    return typeof value === 'string' ? value.trim() : '';
};

/**
 * @description Mendaftarkan karyawan baru ke dalam sistem pengguna lokal.
 * @route POST /api/users/register
 * @access Public (atau sesuai otorisasi)
 */
export const registerKaryawan = async (req, res) => {
    try {
        const { nik, nama, password, email, phone, position, roleId } = req.body;

        const trimmedNik = normalizeString(nik);
        const trimmedNama = normalizeString(nama);
        const passwordInput = typeof password === 'string' ? password : '';

        if (!trimmedNik || !trimmedNama || !passwordInput) {
            return res.status(400).json({
                message: 'NIK, nama, dan password wajib diisi.'
            });
        }

        const payload = {
            nik: trimmedNik,
            nama: trimmedNama,
            password: passwordInput,
            email: normalizeString(email) || null,
            phone: normalizeString(phone) || null,
            position: normalizeString(position) || null
        };

        if (roleId) {
            payload.roleId = Number(roleId);
        }

        const createdUser = await userService.registerUser(payload);

        res.status(201).json({
            message: 'Karyawan berhasil didaftarkan.',
            data: createdUser
        });
    } catch (error) {
        console.error('Register karyawan error:', error);

        const status = error.statusCode || 500;
        const message = error.statusCode === 409 || error.statusCode === 400
            ? error.message
            : 'Gagal mendaftarkan karyawan.';

        res.status(status).json({ message });
    }
};
