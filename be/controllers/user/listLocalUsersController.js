import { db } from '../../models/index.js';

export const listLocalUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['nik', 'nama', 'position', 'status', 'last_login'],
      include: [
        {
          model: db.Role,
          as: 'roles',
          attributes: ['role_id', 'role_name'],
          through: { attributes: [] },
        },
      ],
      order: [['nama', 'ASC']],
    });

    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching local users:", error);
    res.status(500).json({ message: "Gagal mengambil daftar user." });
  }
};
