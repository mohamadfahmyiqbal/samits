// controllers/dashboard.controller.js
export const getAssetSummary = async (req, res) => {
  try {
    const summaryData = {
      "Aset Utama": 120,
      "Aset Client": 85,
      "Aplikasi": 70,
      "Hardware": 150,
      "Cyber": 90
    };
    return res.status(200).json({ message: "Data ringkasan aset berhasil diambil.", data: summaryData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil data ringkasan aset." });
  }
};

export const getMaintenanceAlerts = async (req, res) => {
  try {
    const alerts = [
      { assetId: "SRV-DC01", pic: "Mohamad Fahmy", category: "Hardware", result: "Normal" },
      { assetId: "APP-Nessus", pic: "Fadhi", category: "Cyber", result: "Normal" },
      { assetId: "PC-FINANCE03", pic: "Rizky", category: "Aplikasi", result: "Abnormal" },
      { assetId: "SRV-WEB02", pic: "Sonia", category: "Hardware", result: "Abnormal" },
      { assetId: "NET-FW01", pic: "Dani", category: "Cyber", result: "Normal" },
      { assetId: "DB-PROD01", pic: "Fahmi", category: "Aplikasi", result: "Normal" },
      { assetId: "PC-HR05", pic: "Lisa", category: "Hardware", result: "Abnormal" },
      { assetId: "APP-ERP", pic: "Jennie", category: "Aplikasi", result: "Normal" },
      { assetId: "NET-SW07", pic: "Rose", category: "Cyber", result: "Abnormal" },
      { assetId: "SRV-TEST04", pic: "Jisoo", category: "Hardware", result: "Normal" },
      { assetId: "APP-CRM", pic: "Chaeyoung", category: "Aplikasi", result: "Normal" },
      { assetId: "PC-LOG01", pic: "Mina", category: "Hardware", result: "Abnormal" },
      { assetId: "SRV-WEB03", pic: "Jungkook", category: "Cyber", result: "Normal" },
      { assetId: "APP-BI", pic: "Taehyung", category: "Aplikasi", result: "Abnormal" },
      { assetId: "PC-MKT02", pic: "Jimin", category: "Hardware", result: "Normal" },
      { assetId: "SRV-DEV01", pic: "Suga", category: "Aplikasi", result: "Normal" },
      { assetId: "NET-AP01", pic: "RM", category: "Cyber", result: "Abnormal" },
      { assetId: "PC-IT01", pic: "J-Hope", category: "Hardware", result: "Normal" },
      { assetId: "APP-SLACK", pic: "Jin", category: "Aplikasi", result: "Abnormal" },
    ];
    return res.status(200).json({ data: alerts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil daftar maintenance alerts." });
  }
};
