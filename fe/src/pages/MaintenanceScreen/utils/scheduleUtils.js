// fe/src/pages/MaintenanceScreen/utils/scheduleUtils.js
// Production-ready utilities untuk PM pages

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    pending: 'secondary',
    scheduled: 'info',
    'in-progress': 'warning',
    completed: 'success',
    overdue: 'danger',
    cancelled: 'dark'
  };
  return colors[status] || 'secondary';
};

export const getCategoryBadgeColor = (category) => {
  const colors = {
    hardware: 'primary',
    software: 'info',
    network: 'warning',
    cyber: 'danger',
    infrastruktur: 'success'
  };
  return colors[category?.toLowerCase()] || 'secondary';
};

export const isDueSoon = (scheduledDate, days = 3) => {
  const today = new Date();
  const dueDate = new Date(scheduledDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days && diffDays > 0;
};

export const calculateNextMaintenance = (lastDate, frequency = 'monthly') => {
  const last = new Date(lastDate);
  switch (frequency) {
    case 'daily': last.setDate(last.getDate() + 1); break;
    case 'weekly': last.setDate(last.getDate() + 7); break;
    case 'monthly': last.setMonth(last.getMonth() + 1); break;
    case 'yearly': last.setFullYear(last.getFullYear() + 1); break;
    default: last.setMonth(last.getMonth() + 1);
  }
  return last.toISOString().split('T')[0];
};

