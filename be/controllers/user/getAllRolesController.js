import { db } from '../../models/index.js';

export const getAllRoles = async (req, res) => {
  try {
    const roles = await db.Role.findAll({
      attributes: ['role_id', 'role_name'],
      order: [['role_name', 'ASC']],
    });

    res.status(200).json({ data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Gagal mengambil daftar role." });
  }
};
