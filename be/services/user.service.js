// services/user.service.js (Koreksi Final)

// KOREKSI 1: Import db sebagai NAMED EXPORT
import { db } from "../models/index.js";
import bcrypt from "bcryptjs";

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

    // 1. Cari pengguna berdasarkan NIK (dengan roles)
    const user = await User.findOne({
      where: { nik: nik },
      attributes: { exclude: ["department_id", "level_name", "token"] },
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["role_id", "role_name"],
          through: { attributes: [] },
        },
      ],
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
    console.error("Error saat otentikasi pengguna:", error);
    throw new Error("Gagal mengakses database untuk otentikasi.");
  }
};

/**
 * Mengambil profil pengguna dengan roles
 */
export const getUserProfile = async (userId) => {
  try {
    const User = db.User;
    if (!User) {
      throw new Error("Model User tidak tersedia.");
    }

    const where = typeof userId === "string" ? { nik: userId } : { id: userId };

    const user = await User.findOne({
      where,
      attributes: [
        "nik",
        "nama",
        "email",
        "phone",
        "position",
        "status",
        "last_login",
      ],
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["role_id", "role_name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return null;
    }

    return user.get({ plain: true });
  } catch (error) {
    console.error("Error saat mengambil profil pengguna:", error);
    throw new Error("Gagal mengambil profil pengguna dari database.");
  }
};

/**
 * Memperbarui data pengguna (placeholder untuk fungsi updateUser)
 */
export const updateUser = async (nik, updates) => {
  const User = db.User;
  if (!User) {
    throw new Error("Model User tidak tersedia untuk update.");
  }

  const user = await User.findOne({ where: { nik } });
  if (!user) {
    const error = new Error("User tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  await user.update(updates);

  if (updates.roleId) {
    const UserRole = db.UserRole;
    if (!UserRole) {
      const roleError = new Error("Model UserRole tidak tersedia.");
      roleError.statusCode = 500;
      throw roleError;
    }

    await UserRole.destroy({ where: { nik } });
    await UserRole.create({
      nik,
      role_id: updates.roleId,
    });
  }

  const userData = user.get({ plain: true });
  delete userData.password;
  return userData;
};

export const deleteUser = async (nik) => {
  const User = db.User;
  if (!User) {
    throw new Error("Model User tidak tersedia untuk delete.");
  }

  const user = await User.findOne({ where: { nik } });
  if (!user) {
    const error = new Error("User tidak ditemukan.");
    error.statusCode = 404;
    throw error;
  }

  const UserRole = db.UserRole;
  if (UserRole) {
    await UserRole.destroy({ where: { nik } });
  }

  await user.destroy();
  return true;
};

/**
 * Meregistrasi karyawan baru ke dalam tabel `users`.
 */
export const registerUser = async (payload) => {
  try {
    const User = db.User;

    if (!User) {
      const error = new Error("Model User tidak tersedia untuk registrasi.");
      error.statusCode = 500;
      throw error;
    }

    const normalizedNik =
      typeof payload.nik === "string" ? payload.nik.trim() : "";

    if (!normalizedNik) {
      const error = new Error("NIK tidak boleh kosong.");
      error.statusCode = 400;
      throw error;
    }

    const existingNik = await User.findOne({
      where: { nik: normalizedNik },
    });

    if (existingNik) {
      const error = new Error("NIK sudah terdaftar.");
      error.statusCode = 409;
      throw error;
    }

    if (payload.email) {
      const existingEmail = await User.findOne({
        where: { email: payload.email },
      });

      if (existingEmail) {
        const error = new Error("Email sudah digunakan.");
        error.statusCode = 409;
        throw error;
      }
    }

    const newUser = await User.create({
      ...payload,
      nik: normalizedNik,
    });

    if (payload.roleId) {
      const UserRole = db.UserRole;
      if (!UserRole) {
        const roleError = new Error("Model UserRole tidak tersedia.");
        roleError.statusCode = 500;
        throw roleError;
      }

      await UserRole.create({
        nik: normalizedNik,
        role_id: payload.roleId,
      });
    }

    const userData = newUser.get({ plain: true });
    delete userData.password;

    return userData;
  } catch (error) {
    console.error("Error saat registrasi karyawan:", error);
    throw error;
  }
};
