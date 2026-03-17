// src/utils/UserService.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://pik1com074.local.ikoito.co.id:5002/api";

const normalizeUser = (user = {}) => {
  const nama = user.nama || user.name || "";
  const dept = user.dept || user.position || "";

  return {
    ...user,
    nama,
    name: user.name || nama,
    dept,
    position: user.position || dept,
  };
};

const getAuthToken = () => localStorage.getItem("token");

const userService = {
  login: async (credentials) => {
    try {
      const url = `${API_BASE_URL}/users/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nik: credentials.nik,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (err) {
          console.warn("Gagal parse JSON error:", err);
        }

        return {
          status: response.status,
          message: errorData.message || "Login gagal. Silakan cek NIK dan Password Anda.",
        };
      }

      const data = await response.json();
      return {
        status: response.status,
        data: {
          ...data,
          user: normalizeUser(data?.user),
        },
        message: data.message || "Login berhasil!",
      };
    } catch (error) {
      console.error("Error saat koneksi ke server:", error);
      return {
        status: 500,
        message: "Koneksi ke server gagal. Pastikan server aktif dan jaringan terhubung.",
      };
    }
  },

  findUserByToken: async (signal) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Token tidak ditemukan");
    }

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      signal,
    });

    let data = {};
    try {
      data = await response.json();
    } catch (_error) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengambil profil pengguna.");
    }

    return {
      status: response.status,
      data: normalizeUser(data),
      message: data?.message || "Profil ditemukan.",
    };
  },

  logout: async () => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/users/logout`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        credentials: "include",
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_error) {
        data = {};
      }

      return {
        status: response.status,
        message: data.message || (response.ok ? "Logout berhasil." : "Logout gagal."),
      };
    } finally {
      userService.clearSession();
    }
  },

  clearSession: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  },
};

export default userService;
