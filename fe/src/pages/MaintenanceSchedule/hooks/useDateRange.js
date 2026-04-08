// fe/src/pages/MaintenanceSchedule/hooks/useDateRange.js
import { useMemo } from 'react';
import {
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

export default function useDateRange(
  ganttViewType,
  selectedDateRange
) {
  return useMemo(() => {
    const now = new Date();

    if (
      selectedDateRange?.[0] &&
      selectedDateRange?.[1]
    ) {
      return {
        start:
          selectedDateRange[0].toDate(),
        end:
          selectedDateRange[1].toDate(),
      };
    }

    switch (ganttViewType) {
      case 'daily':
        return {
          start: now,
          end: now,
        };

      case 'weekly':
        return {
          start: startOfWeek(now, {
            weekStartsOn: 1,
          }),
          end: endOfWeek(now, {
            weekStartsOn: 1,
          }),
        };

      case 'monthly':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };

      case 'yearly':
        return {
          start: startOfYear(now),
          end: endOfYear(now),
        };

      default:
        return {
          start: subDays(now, 7),
          end: addDays(now, 30),
        };
    }
  }, [
    ganttViewType,
    selectedDateRange,
  ]);
}