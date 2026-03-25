// src/pages/WorkOrderScreen/utils/workOrderUtils.js
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDateWO = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, 'dd MMM yyyy HH:mm', { locale: id });
  } catch {
    return '-';
  }
};

export const formatDate = formatDateWO;

export const formatShortDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return format(date, 'dd/MM', { locale: id });
  } catch {
    return '-';
  }
};

export const getOverdueStatus = (dueDate, status) => {
  if (status !== 'new' && status !== 'assigned') return false;
  if (!dueDate) return false;
  const due = new Date(dueDate);
  return new Date() > due;
};

export const exportWorkOrdersToExcel = (workOrders, filteredOrders) => {
  // Excel export logic (placeholder)
  console.log('Export:', filteredOrders);
};

import { PRIORITY_CONFIG, STATUS_BADGE_CONFIG, statusLabels } from '../constants/workOrderConstants.js';

export const priorityColors = PRIORITY_CONFIG;
export const statusConfig = STATUS_BADGE_CONFIG;
export { statusLabels } from '../constants/workOrderConstants.js';
