import { db } from "../../models/index.js";
import maintenanceService from "../../services/maintenance.service.js";

export { db, maintenanceService };

export const statusLabels = {
  pending: "Open",
  in_progress: "In Progress",
  done: "Done",
  abnormal: "Abnormal",
  overdue: "Terlambat",
  cancelled: "Cancelled",
};

export const formatStatusLabel = (status) =>
  statusLabels[status] || status;

export const formatTimeValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().slice(11, 16);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length >= 2) {
      return trimmed.length > 5
        ? trimmed.slice(0, 5)
        : trimmed;
    }

    return trimmed;
  }

  return null;
};

export const buildTimeRangeLabel = (
  start,
  end
) => {
  const startLabel = formatTimeValue(start);
  const endLabel = formatTimeValue(end);

  if (
    startLabel &&
    endLabel &&
    startLabel !== endLabel
  ) {
    return `${startLabel} - ${endLabel}`;
  }

  return startLabel || endLabel || null;
};