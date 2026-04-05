// be/controllers/user/getMaintenanceTeamController.js
import { db } from "../../models/index.js";

export const getMaintenanceTeam = async (req, res) => {
  try {
    const { User, Role, UserRole } = db;

    if (!User || !Role || !UserRole) {
      return res.status(500).json({
        message: "Model User, Role, atau UserRole belum tersedia.",
      });
    }

    // Query users dengan role 'maintenance'
    const maintenanceUsers = await User.findAll({
      attributes: ["nik", "nama", "email", "phone", "position"],
      include: [
        {
          model: Role,
          as: "roles",
          through: {
            model: UserRole,
            attributes: [],
          },
          where: {
            role_name: "maintenance",
          },
          attributes: ["role_id", "role_name"],
        },
      ],
      order: [["nama", "ASC"]],
    });

    // Format response untuk frontend
    const formattedUsers = maintenanceUsers.map((user) => {
      const roles = user.roles || [];
      const maintenanceRole = roles.find(
        (role) => role.role_name === "maintenance",
      );

      return {
        nik: user.nik,
        name: user.nama,
        email: user.email,
        phone: user.phone,
        position: user.position,
        role: maintenanceRole?.role_name || null,
        role_id: maintenanceRole?.role_id || null,
        role_description: null,
        display_name: `${user.nama} (${user.nik})`,
      };
    });

    console.log(`Found ${formattedUsers.length} maintenance team members`);

    return res.status(200).json({
      success: true,
      data: formattedUsers,
      message: `Berhasil mengambil ${formattedUsers.length} user dengan role maintenance`,
    });
  } catch (error) {
    console.error("Get maintenance team error:", error);
    return res.status(500).json({
      message: "Gagal mengambil data tim maintenance.",
    });
  }
};
