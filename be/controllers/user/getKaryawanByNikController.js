import { db } from '../../models/index.js';

export const getKaryawanByNik = async (req, res) => {
  try {
    const { nik } = req.params;

    if (!nik) {
      return res.status(400).json({ message: "NIK wajib diisi." });
    }

    const user = await db.HRGAUser.findOne({
      where: { NIK: nik.trim() }
    });

    if (!user) {
      return res.status(404).json({ message: "Karyawan tidak ditemukan." });
    }

    res.status(200).json({
      data: {
        nik: String(user.NIK || '').trim(),
        nama: String(user.NAMA || '').trim(),
        dept: String(user.DEPT || '').trim(),
      }
    });
  } catch (error) {
    console.error("Error fetching karyawan by NIK from HRGA DB:", error);
    res.status(500).json({ message: "Gagal mengambil data karyawan." });
  }
};


