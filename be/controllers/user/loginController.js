// controllers/user/loginController.js
import * as userService from "../../services/user.service.js";
import * as jwtHelper from "../../utils/jwtHelper.js";

/**
 * @description Menangani permintaan login pengguna.
 * @route POST /api/users/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    console.log("=== LOGIN DEBUG ===");
    console.log("Request body:", req.body);
    const { nik, password } = req.body;

    const nikInput = typeof nik === "string" ? nik.trim() : "";
    const passwordInput = typeof password === "string" ? password : "";

    console.log("NIK Input:", nikInput);
    console.log("Password Input:", passwordInput);
    console.log("Password Input type:", typeof passwordInput);
    console.log("Password Input length:", passwordInput.length);

    if (!nikInput || !passwordInput) {
      console.log("Missing NIK or password");
      return res.status(400).json({
        status: 400,
        message: "NIK dan password wajib diisi.",
      });
    }

    console.log("Calling authenticateUser...");
    const user = await userService.authenticateUser(nikInput, passwordInput);
    console.log("User from service:", user);

    if (!user) {
      console.log("Authentication failed");
      return res.status(401).json({
        status: 401,
        message: "NIK atau password salah.",
      });
    }

    // Generate JWT token
    const token = jwtHelper.generateToken({
      id: user.nik,
      nik: user.nik,
      position: user.position,
      roles: user.roles || [],
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    });

    res.status(200).json({
      status: 200,
      message: "Login berhasil.",
      data: {
        token: token,
        user: {
          nik: user.nik,
          nama: user.nama,
          name: user.nama,
          dept: user.position,
          position: user.position,
          roles: user.roles || [],
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan saat login.",
    });
  }
};
