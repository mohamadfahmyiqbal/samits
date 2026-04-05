// controllers/user/getAllKaryawanController.js
import HRGA from "../../config/HRGA.js";
import HRGAUserModel from "../../models/hrga/HRGAUser.js";

export const getAllKaryawan = async (req, res) => {
  try {
    const HRGAUser = HRGAUserModel(HRGA);

    const users = await HRGAUser.findAll({
      attributes: ["NIK", "NAMA", "DEPT"],
      order: [["NAMA", "ASC"]],
      raw: true,
    });

    const formattedUsers = users.map((user) => ({
      nik: String(user.NIK || "").trim(),
      nama: String(user.NAMA || "").trim(),
      dept: String(user.DEPT || "").trim(),
    }));

    res.status(200).json({ data: formattedUsers });
  } catch (error) {
    console.error("Error fetching all karyawan from HRGA DB:", error);
    console.error("Error details:", error.message);
    res.status(500).json({
      message: "Gagal mengambil data karyawan.",
      error: error.message,
    });
  }
};
