// src/comp/maintenance/config/sopConfig.js

export const sopConfig = {
  Hardware: {
    Laptop: "Cek baterai, bersihkan keyboard, update OS, cek antivirus",
    Desktop: "Bersihkan debu casing, cek koneksi kabel, update OS",
    Printer: "Cek tinta, bersihkan head printer, tes cetak dokumen"
  },
  Infrastruktur: {
    Server: "Cek kondisi server, backup data, update OS dan patch keamanan",
    UPS: "Cek baterai, tes daya, cek koneksi listrik",
    AC_Rack: "Cek suhu, bersihkan filter, pastikan aliran udara lancar"
  },
  Cyber: {
    Firewall: "Cek rules, update firmware, pastikan log aktif",
    IDS: "Cek deteksi intrusi, update signature, tes alert",
    VPN: "Tes koneksi, update software, periksa akses user"
  },
  Software: {
    ERP: "Backup data, update versi terbaru, tes fungsi utama",
    CRM: "Backup database, update user permission, tes integrasi"
  }
};
