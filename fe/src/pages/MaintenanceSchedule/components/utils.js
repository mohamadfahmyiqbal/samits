import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
} from 'date-fns';

export const buildTimeSlots = () =>
  Array.from({ length: 10 }, (_, idx) => {
    const hour = 8 + idx;
    const next = hour + 1;
    return {
      key: idx,
      label: `${String(hour).padStart(2, '0')}:00`,
      range: `${String(hour).padStart(2, '0')}:00 - ${String(next).padStart(2, '0')}:00`,
    };
  });

export const workingHours = Array.from({ length: 10 }, (_, idx) => 8 + idx);

export const parseHourFromValue = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const isoCandidate = trimmed.includes('T') ? trimmed : `1970-01-01T${trimmed}`;
    const parsedIso = parseISO(isoCandidate);
    if (!Number.isNaN(parsedIso.getTime())) return parsedIso.getHours();
    const [hourString] = trimmed.split(':');
    const parsedHour = Number(hourString);
    if (!Number.isNaN(parsedHour)) return parsedHour;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getHours();
  }
  return null;
};

export const workdayStartMinutes = 8 * 60;
export const workdayEndMinutes = 17 * 60;

export const parseTimeToDate = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const hasTimezone = /[Zz]|([-+]\d{2}:?\d{2})/.test(trimmed);
  const input = trimmed.includes('T')
    ? trimmed
    : hasTimezone
      ? trimmed
      : `1970-01-01T${trimmed}${trimmed.endsWith('Z') ? '' : 'Z'}`;
  const parsed = parseISO(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatLocalTimeLabel = (value) => {
  const parsed = parseTimeToDate(value);
  return parsed ? format(parsed, 'HH:mm') : value || '--';
};

export const normalizeTimeSlot = (timeString) => {
  if (!timeString) return 8;
  const parsed = parseTimeToDate(timeString);
  const hour = parsed ? parsed.getHours() : 8;
  return Math.min(17, Math.max(8, hour));
};

export const clampMinute = (minute) =>
  Math.max(workdayStartMinutes, Math.min(workdayEndMinutes, minute));

export const formatDateKey = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return format(value, 'yyyy-MM-dd');
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/Z$/, '').split('T')[0];
    return cleaned.slice(0, 10);
  }
  return null;
};

export const createBookingSlot = (item) => {
  const startTime = item.start_time || item.scheduledStartTime;
  const endTime = item.end_time || item.scheduledEndTime;

  // DEBUG: Log raw data
  console.log('createBookingSlot - raw data:', {
    subject: item.subject,
    start_time: item.start_time,
    end_time: item.end_time,
    scheduledStartTime: item.scheduledStartTime,
    scheduledEndTime: item.scheduledEndTime,
  });

  const startHour = normalizeTimeSlot(startTime);
  const endHour = Math.max(startHour + 1, normalizeTimeSlot(endTime || startTime));
  const duration = Math.max(1, endHour - startHour);
  const startDate = parseTimeToDate(startTime);
  const endDate = parseTimeToDate(endTime);

  // Parse actual times from database
  const rawStartMinute = startDate
    ? startDate.getHours() * 60 + startDate.getMinutes()
    : workdayStartMinutes;
  const rawEndMinute = endDate
    ? endDate.getHours() * 60 + endDate.getMinutes()
    : rawStartMinute + 60;

  // Clamp to workday bounds (08:00 - 17:00)
  const clampedStartMinute = Math.max(
    workdayStartMinutes,
    Math.min(workdayEndMinutes, rawStartMinute)
  );
  const clampedEndMinute = Math.max(
    clampedStartMinute + 6,
    Math.min(workdayEndMinutes, rawEndMinute)
  );

  // Calculate grid rows (each row = 6 minutes)
  const startRow = Math.floor((clampedStartMinute - workdayStartMinutes) / 6) + 1;
  const spanRows = Math.max(1, Math.ceil((clampedEndMinute - clampedStartMinute) / 6));

  // DEBUG: Log calculated values
  console.log('createBookingSlot - calculated:', {
    rawStartMinute,
    rawEndMinute,
    clampedStartMinute,
    clampedEndMinute,
    startRow,
    spanRows,
    rangeLabel: `${formatLocalTimeLabel(startTime)} - ${formatLocalTimeLabel(endTime)}`,
  });

  const startColumn = startHour - 7 + 1;
  const endColumn = startColumn + duration;
  const dateKey =
    formatDateKey(item.date) ||
    formatDateKey(item.scheduledDate) ||
    formatDateKey(item.start_date) ||
    null;

  return {
    ...item,
    startHour,
    endHour,
    duration,
    rangeLabel: `${formatLocalTimeLabel(startTime)} - ${formatLocalTimeLabel(endTime)}`,
    min: startColumn,
    max: endColumn,
    startRow,
    spanRows,
    bookStatus:
      item.status === 'completed'
        ? 'completed'
        : item.status === 'cancelled'
          ? 'locked'
          : item.status === 'in_progress'
            ? 'running'
            : 'available',
    dateKey,
    originalData: item.originalData || item,
  };
};

export const groupByDate = (scheduleData) => {
  const grouped = {};
  (scheduleData || []).forEach((item) => {
    const dateKey =
      formatDateKey(item.date) ||
      formatDateKey(item.scheduledDate) ||
      formatDateKey(item.start_date) ||
      null;
    if (!dateKey) return;
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        bookStatus: item.status,
        data: [],
        key: dateKey,
      };
    }
    grouped[dateKey].data.push(createBookingSlot(item));
  });
  return grouped;
};

export const buildDateSlots = (range = {}, viewType = 'weekly') => {
  const { start, end } = range;
  if (!start || !end) return [];

  if (viewType === 'yearly') {
    return eachMonthOfInterval({
      start: startOfMonth(start),
      end: endOfMonth(end),
    }).map((date) => ({
      key: format(date, 'yyyy-MM'),
      label: format(date, 'MMM yyyy'),
      start: date,
    }));
  }

  const startDay = startOfDay(start);
  const endDay = endOfDay(end);
  return eachDayOfInterval({ start: startDay, end: endDay }).map((date) => ({
    key: format(date, 'yyyy-MM-dd'),
    label: format(date, 'dd MMM'),
    start: date,
  }));
};

export const isDateInRange = (dateKey, range = {}) => {
  if (!dateKey) return false;
  if (!range.start && !range.end) return true;
  try {
    const parsed = parseISO(dateKey);
    const start = range.start ? startOfDay(range.start) : parsed;
    const end = range.end ? endOfDay(range.end) : parsed;
    return isWithinInterval(parsed, { start, end });
  } catch {
    return true;
  }
};
