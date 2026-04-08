import {
  parseISO,
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  differenceInCalendarDays,
} from 'date-fns';

export const parseTimeToDate = (value) => {
  if (!value) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

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

export const parseDateKeyToDate = (value) => {
  const cleaned = formatDateKey(value);
  if (!cleaned) return null;

  const [year, month, day] = cleaned.split('-').map(Number);

  if ([year, month, day].some(Number.isNaN)) {
    return null;
  }

  return new Date(year, month - 1, day);
};

export const toDateObject = (value) => {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value === 'string') {
    return parseDateKeyToDate(value);
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

export const buildDateSlots = (
  range = {},
  viewType = 'weekly'
) => {
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

  return eachDayOfInterval({
    start: startOfDay(start),
    end: endOfDay(end),
  }).map((date) => ({
    key: format(date, 'yyyy-MM-dd'),
    label: format(date, 'dd MMM'),
    start: date,
  }));
};

export const isDateInRange = (
  dateKey,
  range = {}
) => {
  if (!dateKey) return false;

  if (!range.start && !range.end) {
    return true;
  }

  try {
    const parsed = parseISO(dateKey);

    return isWithinInterval(parsed, {
      start: range.start
        ? startOfDay(range.start)
        : parsed,
      end: range.end
        ? endOfDay(range.end)
        : parsed,
    });
  } catch {
    return false;
  }
};

export const getWeekColumn = (
  date,
  monthStart
) => {
  if (!date || !monthStart) return null;

  const diff = differenceInCalendarDays(
    startOfDay(date),
    startOfDay(monthStart)
  );

  if (Number.isNaN(diff)) return null;

  return Math.max(1, Math.min(4, Math.floor(diff / 7) + 1));
};

