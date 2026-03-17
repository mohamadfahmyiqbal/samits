import { db } from "../../models/index.js";

export const listStatuses = async (req, res) => {
  try {
    const AssetStatus = db.AssetStatus;

    if (!AssetStatus) {
      // Fallback jika tabel asset_status belum tersedia
      return res.status(200).json({
        data: [
          { status_id: 1, status_name: 'Active', status_description: 'Asset aktif dan dapat digunakan' },
          { status_id: 2, status_name: 'Inactive', status_description: 'Asset tidak aktif/suspended' },
          { status_id: 3, status_name: 'In Repair', status_description: 'Asset sedang dalam perbaikan' },
          { status_id: 4, status_name: 'Disposed', status_description: 'Asset sudah di Dispose' }
        ]
      });
    }

    const statuses = await AssetStatus.findAll({
      attributes: ['status_id', 'status_name', 'status_description', 'is_active', 'is_disposed', 'display_order'],
      order: [['display_order', 'ASC'], ['status_name', 'ASC']],
      raw: true
    });

    return res.status(200).json({ data: statuses });
  } catch (error) {
    console.error("List statuses error:", error);
    return res.status(500).json({ message: "Gagal mengambil daftar status." });
  }
};

