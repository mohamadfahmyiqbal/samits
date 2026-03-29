// controllers/user/Login.jsx
import * as userService from "../../services/user.service.js";
import * as jwtHelper from "../../utils/jwtHelper.js";

/**
 * @description Menangani permintaan login pengguna.
 * @route POST /api/users/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { nik, password } = req.body;

    if (!nik || !password) {
      return res.status(400).json({
        success: false,
        message: "NIK dan password harus diisi",
      });
    }

    // TEMPORARY: Mock login for testing without database
    if (nik === "test" && password === "test") {
      const token = jwtHelper.generateToken({
        nik: "test",
        name: "Test User",
        position: "Developer",
        role: "admin",
      });

      return res.json({
        success: true,
        message: "Login berhasil",
        data: {
          token,
          user: {
            nik: "test",
            name: "Test User",
            position: "Developer",
            role: "admin",
          },
        },
      });
    }

    // Original database authentication (commented out for now)
    /*
    const user = await userService.authenticateUser(nik, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'NIK atau password salah'
      });
    }

    const token = jwtHelper.generateToken({
      nik: user.nik,
      name: user.name,
      position: user.position,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          nik: user.nik,
          name: user.name,
          position: user.position,
          role: user.role
        }
      }
    });
    */

    // If not mock credentials, return error
    return res.status(401).json({
      success: false,
      message: "NIK atau password salah",
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat login",
    });
  }
};
