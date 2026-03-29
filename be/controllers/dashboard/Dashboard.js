// controllers/dashboard/Dashboard.jsx
export const getAssetSummary = async (req, res) => {
  try {
    const summaryData = {
      "Aset Utama": 120,
      "Aset Client": 85,
      Aplikasi: 70,
      Hardware: 150,
      Cyber: 90,
    };

    res.json({
      success: true,
      data: summaryData,
    });
  } catch (error) {
    console.error("[DASHBOARD] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data dashboard",
    });
  }
};

export const getMaintenanceAlerts = async (req, res) => {
  try {
    const alertsData = [
      {
        id: 1,
        title: "Maintenance Server Aset Utama",
        description: "Scheduled maintenance untuk server database",
        priority: "high",
        status: "scheduled",
        date: "2026-03-30",
      },
      {
        id: 2,
        title: "Update Security Patch",
        description: "Security update untuk sistem monitoring",
        priority: "medium",
        status: "in-progress",
        date: "2026-03-28",
      },
    ];

    res.json({
      success: true,
      data: alertsData,
    });
  } catch (error) {
    console.error("[DASHBOARD] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data maintenance alerts",
    });
  }
};

export const getMaintenanceStats = async (req, res) => {
  try {
    const statsData = {
      Selesai: 45,
      "Sedang Berjalan": 12,
      Terjadwal: 8,
      Overdue: 3,
    };

    res.json({
      success: true,
      data: statsData,
    });
  } catch (error) {
    console.error("[DASHBOARD] Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil statistik maintenance",
    });
  }
};
