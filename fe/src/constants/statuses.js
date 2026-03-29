export const STATUSES = {
  PENDING: { value: 'pending', label: 'Pending', color: 'orange' },
  IN_PROGRESS: { value: 'in_progress', label: 'In Progress', color: 'blue' },
  COMPLETED: { value: 'completed', label: 'Completed', color: 'green' },
  REJECTED: { value: 'rejected', label: 'Rejected', color: 'red' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'default' }
};

export const PRIORITIES = {
  LOW: { value: 'low', label: 'Low', color: 'green' },
  MEDIUM: { value: 'medium', label: 'Medium', color: 'blue' },
  HIGH: { value: 'high', label: 'High', color: 'orange' },
  CRITICAL: { value: 'critical', label: 'Critical', color: 'red' }
};

export const IMPACT_LEVELS = {
  LOW: { value: 'low', label: 'Low', color: 'green' },
  MEDIUM: { value: 'medium', label: 'Medium', color: 'blue' },
  HIGH: { value: 'high', label: 'High', color: 'orange' },
  CRITICAL: { value: 'critical', label: 'Critical', color: 'red' }
};

export const getStatusColor = (status) => {
  const statusObj = Object.values(STATUSES).find(s => s.value === status);
  return statusObj ? statusObj.color : 'default';
};

export const getPriorityColor = (priority) => {
  const priorityObj = Object.values(PRIORITIES).find(p => p.value === priority);
  return priorityObj ? priorityObj.color : 'default';
};
