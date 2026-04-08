import {
  parseTimeToDate,
  formatDateKey,
  parseDateKeyToDate,
  normalizeTimeSlot,
  formatLocalTimeLabel,
} from './ganttDate';
import { eachDayOfInterval, format } from 'date-fns';

const WORKDAY_START_MINUTES = 8 * 60;
const WORKDAY_END_MINUTES = 17 * 60;

const normalizeBookingStatus = (status) => {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'in_progress':
      return 'in_progress';
    case 'planned':
      return 'planned';
    default:
      return 'planned';
  }
};

export const createBookingSlot = (item) => {
  const startTime =
    item.start_time || item.scheduledStartTime;

  const endTime =
    item.end_time || item.scheduledEndTime;

  const startHour =
    normalizeTimeSlot(startTime);

  const endHour = Math.max(
    startHour + 1,
    normalizeTimeSlot(
      endTime || startTime
    )
  );

  const duration = Math.max(
    1,
    endHour - startHour
  );

  const startDate =
    parseTimeToDate(startTime);

  const endDate =
    parseTimeToDate(endTime);

  const rawStartMinute = startDate
    ? startDate.getHours() * 60 +
      startDate.getMinutes()
    : WORKDAY_START_MINUTES;

  const rawEndMinute = endDate
    ? endDate.getHours() * 60 +
      endDate.getMinutes()
    : rawStartMinute + 60;

  const normalizedStartMinute =
    Math.min(
      WORKDAY_END_MINUTES - 10,
      Math.max(
        WORKDAY_START_MINUTES,
        rawStartMinute
      )
    );

  const normalizedEndMinute =
    Math.max(
      normalizedStartMinute + 10,
      Math.min(
        WORKDAY_END_MINUTES,
        rawEndMinute
      )
    );

  const startRow =
    Math.floor(
      (normalizedStartMinute -
        WORKDAY_START_MINUTES) /
        10
    ) + 1;

  const spanRows = Math.max(
    1,
    Math.ceil(
      (normalizedEndMinute -
        normalizedStartMinute) /
        10
    )
  );

  const slotColumnOffset = 2;

  const startColumn =
    slotColumnOffset +
    Math.max(0, startHour - 8);

  const endColumn =
    startColumn +
    Math.max(1, duration);

  const dateKey =
    formatDateKey(item.date) ||
    formatDateKey(
      item.scheduledDate
    ) ||
    formatDateKey(
      item.start_date
    ) ||
    null;

  const normalizedStatus =
    normalizeBookingStatus(
      item.status
    );

  return {
    ...item,
    startHour,
    endHour,
    duration,
    rangeLabel: `${formatLocalTimeLabel(
      startTime
    )} - ${formatLocalTimeLabel(
      endTime
    )}`,
    min: startColumn,
    max: endColumn,
    startRow,
    spanRows,
    bookStatus:
      normalizedStatus,
    dateKey,
    originalData:
      item.originalData || item,
  };
};

export const collectDateKeys = (
  item
) => {
  const startCandidates = [
    item?.date,
    item?.scheduledDate,
    item?.start_date,
    item?.startDate,
    item?.scheduled_start_date,
  ]
    .map(formatDateKey)
    .filter(Boolean);

  const endCandidates = [
    item?.scheduledEndDate,
    item?.end_date,
    item?.endDate,
    item?.scheduled_end_date,
    item?.date_end,
    item?.finish_date,
  ]
    .map(formatDateKey)
    .filter(Boolean);

  const startKey =
    startCandidates[0] || null;

  const endKey =
    endCandidates[0] ||
    startKey;

  if (!startKey) {
    return [];
  }

  const startDate =
    parseDateKeyToDate(startKey);

  const endDate =
    parseDateKeyToDate(endKey);

  if (!startDate || !endDate) {
    return [startKey];
  }

  try {
    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    }).map((date) =>
      format(
        date,
        'yyyy-MM-dd'
      )
    );
  } catch {
    return [startKey];
  }
};

export const groupByDate = (
  scheduleData
) => {
  const grouped = {};

  (scheduleData || []).forEach(
    (item) => {
      const dateKeys =
        collectDateKeys(item);

      if (!dateKeys.length) {
        return;
      }

      dateKeys.forEach(
        (dateKey) => {
          if (
            !grouped[dateKey]
          ) {
            grouped[
              dateKey
            ] = {
              bookStatus:
                normalizeBookingStatus(
                  item.status
                ),
              data: [],
              key: dateKey,
            };
          }

          grouped[
            dateKey
          ].data.push(
            createBookingSlot({
              ...item,
              date: dateKey,
            })
          );
        }
      );
    }
  );

  return grouped;
};

export const getScheduleDateRange = (
  items = []
) => {
  let earliest = null;
  let latest = null;

  (items || []).forEach(
    (item) => {
      const dateKeys =
        collectDateKeys(item);

      dateKeys.forEach(
        (key) => {
          if (!key) return;

          const parsed =
            parseDateKeyToDate(
              key
            );

          if (
            !parsed ||
            Number.isNaN(
              parsed.getTime()
            )
          ) {
            return;
          }

          if (
            !earliest ||
            parsed < earliest
          ) {
            earliest = parsed;
          }

          if (
            !latest ||
            parsed > latest
          ) {
            latest = parsed;
          }
        }
      );
    }
  );

  return {
    start: earliest,
    end: latest,
  };
};