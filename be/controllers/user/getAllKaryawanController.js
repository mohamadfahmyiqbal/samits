import { QueryTypes } from 'sequelize';
import HRGA from '../../config/HRGA.js';

export const getAllKaryawan = async (req, res) => {
  try {
    const users = await HRGA.query(
      `SELECT NIK, NAMA, DEPT FROM "USER" ORDER BY NAMA ASC`,
      {
        type: QueryTypes.SELECT,
      }
    );
  

    const formattedUsers = users.map(user => ({
      nik: String(user.NIK || '').trim(),
      nama: String(user.NAMA || '').trim(),
      dept: String(user.DEPT || '').trim(),
    }));

    res.status(200).json({ data: formattedUsers });
  } catch (error) {
    console.error("Error fetching all karyawan from HRGA DB:", error);
    res.status(500).json({ message: "Gagal mengambil data karyawan." });
  }
};

