export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const isDue = (log) => {
  if (!log.nextMaintenance) return true;
  return new Date(log.nextMaintenance) <= new Date();
};

export const handleExportExcel = () => {
  alert('Excel export temporarily disabled for security reasons');
};
