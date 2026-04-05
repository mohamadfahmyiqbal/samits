// be/controllers/user/listUsersController.js
import { QueryTypes } from 'sequelize';
import HRGA from '../../config/HRGA.js';

export const listUsers = async (req, res) => {
  try {
    const users = await HRGA.query(
      `SELECT USER_ID, NAME FROM "USER" ORDER BY NAME ASC`,
      {
        type: QueryTypes.SELECT,
      }
    );

    // Ubah USER_ID menjadi nik dan NAME menjadi name untuk konsistensi di frontend
    const formattedUsers = users.map(user => ({
      nik: String(user.USER_ID || '').trim(),
      name: String(user.NAME || '').trim(),
    }));

    res.status(200).json({ data: formattedUsers });
  } catch (error) {
    console.error("Error fetching users from HRGA DB:", error);
    res.status(500).json({ message: "Gagal mengambil data pengguna." });
  }
};
