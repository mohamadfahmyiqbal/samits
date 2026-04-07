import React, { useMemo } from 'react';
import {
  differenceInCalendarDays,
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
import DailyGanttChart from './gantt/DailyGanttChart';
import WeeklyGanttChart from './gantt/WeeklyGanttChart';
import MonthlyGanttChart from './gantt/MonthlyGanttChart';
import YearlyGanttChart from './gantt/YearlyGanttChart';
import './GanttChart.css';

const buildTimeSlots = () =>
  Array.from({ length: 10 }, (_, idx) => {
    const hour = 8 + idx;
    const next = hour + 1;
    return {
      key: idx,
      label: `${String(hour).padStart(2, '0')}:00`,
      range: `${String(hour).padStart(2, '0')}:00 - ${String(next).padStart(2, '0')}:00`,
    };
  });

const workdayStartMinutes = 8 * 60;
const workdayEndMinutes = 17 * 60;

const parseTimeToDate = (value) => {
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

const formatLocalTimeLabel = (value) => {
  const parsed = parseTimeToDate(value);
  return parsed ? format(parsed, 'HH:mm') : value || '--';
};

const normalizeTimeSlot = (timeString) => {
  if (!timeString) return 8;
  const parsed = parseTimeToDate(timeString);
  const hour = parsed ? parsed.getHours() : 8;
  return Math.min(17, Math.max(8, hour));
};

const formatDateKey = (value) => {
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

const parseDateKeyToDate = (value) => {
  const cleaned = formatDateKey(value);
  if (!cleaned) return null;
  const [year, month, day] = cleaned.split('-').map((num) => Number(num));
  if ([year, month, day].some((num) => Number.isNaN(num))) return null;
  return new Date(year, month - 1, day);
};

const dateFieldCandidates = ['date', 'scheduledDate', 'start_date', 'startDate', 'scheduled_start_date'];
const endDateFieldCandidates = ['scheduledEndDate', 'end_date', 'endDate', 'scheduled_end_date'];

const collectCandidateKeys = (item, fields) =>
  fields
    .map((field) => formatDateKey(item?.[field]))
    .filter(Boolean);

const selectDateKey = (keys, order = 'asc') => {
  if (!keys.length) return null;
  const parsedKeys = keys
    .map((key) => ({ key, date: parseDateKeyToDate(key) }))
    .filter((entry) => entry.date && !Number.isNaN(entry.date.getTime()));
  if (!parsedKeys.length) return keys[0] || null;
  parsedKeys.sort((a, b) => a.date - b.date);
  return order === 'asc'
    ? parsedKeys[0].key
    : parsedKeys[parsedKeys.length - 1].key;
};

const collectDateKeys = (item) => {
  const startKeys = collectCandidateKeys(item, dateFieldCandidates);
  if (!startKeys.length) {
    return [];
  }
  const endKeys = collectCandidateKeys(item, endDateFieldCandidates);
  const startKey = selectDateKey(startKeys, 'asc');
  const endKey =
    selectDateKey(endKeys.length ? endKeys : startKeys, 'desc') || startKey;

  if (!startKey) {
    return [];
  }

  try {
    const startDate = parseDateKeyToDate(startKey);
    const endDate = parseDateKeyToDate(endKey);
    if (
      !startDate ||
      !endDate ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return [startKey];
    }
    return eachDayOfInterval({ start: startDate, end: endDate }).map((date) =>
      format(date, 'yyyy-MM-dd'),
    );
  } catch {
    return [startKey];
  }
};

const toDateObject = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }
  if (typeof value === 'string') {
    return parseDateKeyToDate(value);
  }
  if (typeof value === 'number') {
    const parsed = parseISO(value.toString());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const getScheduleDateRange = (items = []) => {
  let earliest = null;
  let latest = null;
  (items || []).forEach((item) => {
    const dateKeys = collectDateKeys(item);
    dateKeys.forEach((key) => {
      if (!key) return;
      const parsed = parseDateKeyToDate(key);
      if (Number.isNaN(parsed.getTime())) return;
      if (!earliest || parsed < earliest) earliest = parsed;
      if (!latest || parsed > latest) latest = parsed;
    });
  });
  return { start: earliest, end: latest };
};

const createBookingSlot = (item) => {
  const startTime = item.start_time || item.scheduledStartTime;
  const endTime = item.end_time || item.scheduledEndTime;
  const startHour = normalizeTimeSlot(startTime);
  const endHour = Math.max(startHour + 1, normalizeTimeSlot(endTime || startTime));
  const duration = Math.max(1, endHour - startHour);
  const startDate = parseTimeToDate(startTime);
  const endDate = parseTimeToDate(endTime);
  const rawStartMinute = startDate ? startDate.getHours() * 60 + startDate.getMinutes() : workdayStartMinutes;
  const rawEndMinute = endDate ? endDate.getHours() * 60 + endDate.getMinutes() : rawStartMinute + 60;
  const normalizedStartMinute = Math.min(workdayEndMinutes - 10, Math.max(workdayStartMinutes, rawStartMinute));
  const normalizedEndMinute = Math.max(normalizedStartMinute + 10, Math.min(workdayEndMinutes, rawEndMinute));
  const startRow = Math.floor((normalizedStartMinute - workdayStartMinutes) / 10) + 1;
  const spanRows = Math.max(1, Math.ceil((normalizedEndMinute - normalizedStartMinute) / 10));
  const slotColumnOffset = 2; // tanggal + subject columns
  const startColumn = slotColumnOffset + Math.max(0, startHour - 8);
  const endColumn = startColumn + Math.max(1, duration);
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

const groupByDate = (scheduleData) => {
  const grouped = {};
  (scheduleData || []).forEach((item) => {
    const dateKeys = collectDateKeys(item);
    if (!dateKeys.length) return;

    dateKeys.forEach((dateKey) => {
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          bookStatus: item.status,
          data: [],
          key: dateKey,
        };
      }
      grouped[dateKey].data.push(
        createBookingSlot({
          ...item,
          date: dateKey,
        }),
      );
    });
  });
  return grouped;
};

const buildDateSlots = (range = {}, viewType = 'weekly') => {
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

const isDateInRange = (dateKey, range = {}) => {
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

const getWeekColumn = (date, monthStart) => {
  if (!date || !monthStart) return null;
  const diff = differenceInCalendarDays(startOfDay(date), startOfDay(monthStart));
  if (Number.isNaN(diff)) return null;
  const index = Math.floor(diff / 7) + 1;
  return Math.max(1, Math.min(4, index));
};

export default function GanttChart({ scheduleData = [], onEdit, viewType = 'weekly', dateRange = {} }) {
  const timeSlots = useMemo(buildTimeSlots, []);
  const groupedSchedule = useMemo(() => groupByDate(scheduleData), [scheduleData]);
  const scheduleEntries = Object.entries(groupedSchedule);
  const isDaily = viewType === 'daily';
  const isWeekly = viewType === 'weekly';
  const isMonthly = viewType === 'monthly';
  const isYearly = viewType === 'yearly';
  const dailyDateKey =
    formatDateKey(dateRange.start) ||
    scheduleEntries[0]?.[0] ||
    format(new Date(), 'yyyy-MM-dd');
  const dailyEntry = groupedSchedule[dailyDateKey] || {
    data: [],
    bookStatus: 'available',
    key: dailyDateKey,
  };
  const dateSlots = useMemo(() => buildDateSlots(dateRange, viewType), [dateRange, viewType]);
  const scheduleDateRange = useMemo(() => getScheduleDateRange(scheduleData), [scheduleData]);
  const slotCount = isDaily ? 1 : isWeekly ? timeSlots.length : Math.max(dateSlots.length, 1);
  const dailyColumnTemplate = 'minmax(120px, 180px) 1fr';
  const lineSlots = Array.from({ length: slotCount }, (_, idx) => idx);
  const filteredEntries = isDaily
    ? []
    : scheduleEntries.filter(([dateKey]) => isDateInRange(dateKey, dateRange));
  const monthlyViewAnchor =
    toDateObject(dateRange.start) || scheduleDateRange.start || scheduleDateRange.end || new Date();
  const monthlyRange = monthlyViewAnchor
    ? {
        start: startOfMonth(monthlyViewAnchor),
        end: endOfMonth(monthlyViewAnchor),
      }
    : null;
  const monthlySlots = isMonthly && monthlyRange ? buildDateSlots(monthlyRange, 'monthly') : [];
  const weeklyRange = useMemo(() => {
    if (!isWeekly) return null;
    const normalizedBaseStart = toDateObject(dateRange.start);
    const normalizedBaseEnd = toDateObject(dateRange.end);
    const normalizedExtraStart = toDateObject(scheduleDateRange.start);
    const normalizedExtraEnd = toDateObject(scheduleDateRange.end);
    const startCandidates = [normalizedBaseStart, normalizedExtraStart].filter(Boolean);
    const endCandidates = [normalizedBaseEnd, normalizedExtraEnd].filter(Boolean);
    const start = startCandidates.reduce((acc, curr) => (!acc || curr < acc ? curr : acc), null);
    const end = endCandidates.reduce((acc, curr) => (!acc || curr > acc ? curr : acc), null);
    const fallbackStart = normalizedBaseStart || normalizedExtraStart;
    const fallbackEnd = normalizedBaseEnd || normalizedExtraEnd;
  const finalStart = start || normalizedExtraStart || normalizedBaseStart;
  const finalEnd = end || normalizedExtraEnd || normalizedBaseEnd;
    if (!finalStart || !finalEnd) {
      return { start: fallbackStart, end: fallbackEnd };
    }
    if (finalStart > finalEnd) {
      return { start: finalStart, end: finalStart };
    }
    return { start: finalStart, end: finalEnd };
  }, [isWeekly, dateRange.start, dateRange.end, scheduleDateRange.start, scheduleDateRange.end]);
  const weeklySlots = isWeekly ? buildDateSlots(weeklyRange || dateRange, 'weekly') : [];
  const weeklyRowKeys = useMemo(() => {
    if (!isWeekly) return [];
    const slotKeys = weeklySlots.map((slot) => slot.key).filter(Boolean);
    const scheduleKeys = Object.keys(groupedSchedule || {});
    const merged = Array.from(new Set([...slotKeys, ...scheduleKeys]));
    merged.sort((a, b) => {
      const dateA = parseDateKeyToDate(a);
      const dateB = parseDateKeyToDate(b);
      if (dateA && dateB) {
        return dateA - dateB;
      }
      return (a || '').localeCompare(b || '');
    });
    return merged;
  }, [isWeekly, weeklySlots, groupedSchedule]);
  const monthlyRowsForView = isMonthly
    ? monthlySlots.map((slot) => {
        const bookingObj = groupedSchedule[slot.key] || {
          data: [],
          bookStatus: 'available',
          key: slot.key,
        };
      const dayNumber = slot.start ? format(slot.start, 'dd') : '--';
      const monthLabel = slot.start ? format(slot.start, 'MMM') : '';
      return {
        dateKey: slot.key,
        bookingObj,
        dayNumber,
        monthLabel,
      };
    })
    : [];

  const rowsForView = isDaily
    ? []
    : isWeekly
      ? weeklyRowKeys.map((dateKey) => {
        const slotEntry = weeklySlots.find((slot) => slot.key === dateKey);
        const bookingObj = groupedSchedule[dateKey] || {
          data: [],
          bookStatus: 'available',
          key: dateKey,
        };
        const dayNumber = slotEntry?.start ? format(slotEntry.start, 'dd') : '--';
        const monthLabel = slotEntry?.start ? format(slotEntry.start, 'MMM') : '';
        return {
          dateKey,
          bookingObj,
          dayNumber,
          monthLabel,
        };
      })
      : filteredEntries.map(([tanggal, bookingObj]) => ({
        dateKey: tanggal,
        bookingObj,
      }));

  const weeklyRowIndexMap = useMemo(
    () =>
      rowsForView.reduce((acc, row, index) => {
        if (row?.dateKey) {
          acc[row.dateKey] = index + 1;
        }
        return acc;
      }, {}),
    [rowsForView],
  );

  const weeklyOverlayBookings = useMemo(() => {
    if (!isWeekly || !rowsForView.length) {
      return [];
    }

    return (scheduleData || [])
      .flatMap((item) => {
        const dateKeys = collectDateKeys(item);
        if (!dateKeys.length) return [];

        return dateKeys
          .map((dateKey) => {
            const rowStart = weeklyRowIndexMap[dateKey];
            if (!rowStart) return null;
            const bookingSlot = createBookingSlot({
              ...item,
              date: dateKey,
            });
            return {
              ...bookingSlot,
              rowStart,
              rowEnd: rowStart + 1,
            };
          })
          .filter(Boolean);
      })
      .filter(Boolean);
  }, [isWeekly, scheduleData, weeklyRowIndexMap, rowsForView]);

  const monthlyRowIndexMap = useMemo(
    () =>
      monthlyRowsForView.reduce((acc, row, index) => {
        acc[row.dateKey] = index + 1;
        return acc;
      }, {}),
    [monthlyRowsForView],
  );

  const monthlyStartDate = monthlySlots[0]?.start ? startOfDay(monthlySlots[0].start) : null;

  const monthlyOverlayBookings = useMemo(() => {
    if (!isMonthly || !monthlyRowsForView.length || !monthlyStartDate) {
      return [];
    }
    return (scheduleData || [])
      .map((item) => {
        const dateKeys = collectDateKeys(item);
        if (!dateKeys.length) return null;
        const startKey = dateKeys[0];
        const lastKey = dateKeys[dateKeys.length - 1];
        const rowStart = monthlyRowIndexMap[startKey];
        if (!rowStart) return null;
        const rowEndIndex = monthlyRowIndexMap[lastKey] || rowStart;

        const startDate = parseISO(startKey);
        const endDate = parseISO(lastKey);
        const weekStart = getWeekColumn(startDate, monthlyStartDate);
        const weekEnd = getWeekColumn(endDate, monthlyStartDate);

        if (!weekStart || !weekEnd) return null;

        const bookingSlot = createBookingSlot(item);

        return {
          ...bookingSlot,
          rowStart,
          rowEnd: rowEndIndex + 1,
          min: weekStart,
          max: weekEnd + 1,
        };
      })
      .filter(Boolean);
  }, [isMonthly, monthlyRowsForView, monthlyStartDate, monthlyRowIndexMap, scheduleData]);
  return (
    <div className="gantt-wrapper">
      {isDaily && (
        <div className="gantt-wrapper daily-gantt-wrapper">
          <div className="gantt daily-gantt" style={{ '--slot-count': slotCount }}>
            <DailyGanttChart dailyEntry={dailyEntry} columnTemplate={dailyColumnTemplate} onEdit={onEdit} />
          </div>
        </div>
      )}
      {isWeekly && (
        <div className="gantt-wrapper weekly-gantt-wrapper">
          <div className="gantt weekly-gantt" style={{ '--slot-count': slotCount }}>
            <WeeklyGanttChart
              headerColumns={timeSlots}
              rowsForView={rowsForView}
              lineSlots={lineSlots}
              onEdit={onEdit}
              overlayBookings={weeklyOverlayBookings}
            />
          </div>
        </div>
      )}
      {viewType === 'monthly' && (
        <div className="monthly-gantt-wrapper">
          <MonthlyGanttChart
            rowsForView={monthlyRowsForView}
            onEdit={onEdit}
            overlayBookings={monthlyOverlayBookings}
          />
        </div>
      )}
      {viewType === 'yearly' && (
        <div className="yearly-gantt-wrapper">
          <YearlyGanttChart rowsForView={rowsForView} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
}
