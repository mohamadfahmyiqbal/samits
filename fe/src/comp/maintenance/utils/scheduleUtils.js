// Excel export disabled due to security concerns
// import * as XLSX from "xlsx";

// Format tanggal
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Cek apakah jadwal sudah waktunya
export const isDue = (log) => {
  if (!log.nextMaintenance) return true;
  return new Date(log.nextMaintenance) <= new Date();
};

// Export Excel
export const handleExportExcel = (logs, sortedLogs) => {
  const exportData = sortedLogs.map((log, idx) => ({
    No: idx + 1,
    'No.Asset': log.assetId,
    Category: log.category || '-',
    Type: log.type,
    PIC: log.pic || '-',
    'Schedule Maintenance': formatDate(log.nextMaintenance),
    Status: log.status,
    SOP: log.sop || '-',
  }));

  // Excel export disabled due to security concerns
  alert('Excel export temporarily disabled for security reasons');
  // TODO: Implement safer export alternative
  /*
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
  XLSX.writeFile(wb, 'MaintenanceSchedule.xlsx');
  */
};
