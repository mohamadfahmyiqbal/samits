// services/user.service.js (Koreksi Final)

// KOREKSI 1: Import db sebagai NAMED EXPORT
import { db } from '../models/index.js'; 
import bcrypt from 'bcryptjs'; 

// HAPUS: const User = db.User; 

/**
 * Otentikasi pengguna berdasarkan nik dan password.
 * @param {string} nik - NIK pengguna (Disesuaikan dari 'username').
 * @param {string} password - Password yang dimasukkan.
 */
export const authenticateUser = async (nik, password) => {
    
    try {
        // KOREKSI 2: Akses model User DI DALAM FUNGSI
        const User = db.User; 
        
        // 1. Cari pengguna berdasarkan NIK
       const user = await User.findOne({ 
            where: { nik: nik },
            // OPTIMASI: Secara eksplisit mengecualikan kolom yang mungkin menyebabkan konflik 
            // atau kolom yang tidak dibutuhkan untuk login.
            attributes: { exclude: ['department_id', 'level_name', 'token'] }
        });

         if (!user) {
             return null; // Pengguna tidak ditemukan
         }

         // 2. Bandingkan password
         // KOREKSI 3: Gunakan user.password (sesuai skema baru)
         const isMatch = await bcrypt.compare(password, user.password); 
         

         if (!isMatch) {
            return null; // Password salah
         }

         // 3. Otentikasi sukses
         const userData = user.get({ plain: true }); 
         delete userData.password; 
         return userData;

    } catch (error) {
        console.error('Error saat otentikasi pengguna:', error);
        throw new Error('Gagal mengakses database untuk otentikasi.');
    }
};

/**
 * Mengambil profil pengguna (placeholder untuk fungsi getProfile)
 */
export const getUserProfile = async (userId) => {
    try {
        const User = db.User;
        if (!User) {
            throw new Error('Model User tidak tersedia.');
        }

        const where = typeof userId === 'string'
            ? { nik: userId }
            : { id: userId };

        const user = await User.findOne({
            where,
            attributes: ['nik', 'nama', 'email', 'phone', 'position', 'status', 'last_login']
        });

        if (!user) {
            return null;
        }

        return user.get({ plain: true });
    } catch (error) {
        console.error('Error saat mengambil profil pengguna:', error);
        throw new Error('Gagal mengambil profil pengguna dari database.');
    }
};

/**
 * Memperbarui data pengguna (placeholder untuk fungsi updateUser)
 */
export const updateUser = async (nik, updates) => {
    return { nik, ...updates };
};

/**
 * Meregistrasi karyawan baru ke dalam tabel `users`.
 */
export const registerUser = async (payload) => {
    try {
        const User = db.User;

        if (!User) {
            const error = new Error('Model User tidak tersedia untuk registrasi.');
            error.statusCode = 500;
            throw error;
        }

        const normalizedNik = typeof payload.nik === 'string' ? payload.nik.trim() : '';

        if (!normalizedNik) {
            const error = new Error('NIK tidak boleh kosong.');
            error.statusCode = 400;
            throw error;
        }

        const existingNik = await User.findOne({
            where: { nik: normalizedNik }
        });

        if (existingNik) {
            const error = new Error('NIK sudah terdaftar.');
            error.statusCode = 409;
            throw error;
        }

        if (payload.email) {
            const existingEmail = await User.findOne({
                where: { email: payload.email }
            });

            if (existingEmail) {
                const error = new Error('Email sudah digunakan.');
                error.statusCode = 409;
                throw error;
            }
        }

        const newUser = await User.create({
            ...payload,
            nik: normalizedNik
        });

        const userData = newUser.get({ plain: true });
        delete userData.password;

        return userData;
    } catch (error) {
        console.error('Error saat registrasi karyawan:', error);
        throw error;
    }
};
