import { useMemo } from 'react';
import {
  collectDateKeys,
  createBookingSlot,
} from '../../utils/ganttBooking';
import {
  formatDateKey,
  parseDateKeyToDate,
  getWeekColumn,
} from '../../utils/ganttDate';

export default function useMonthlyOverlay({
  isMonthly,
  monthlyRowsForView,
  monthlyStartDate,
  monthlyRowIndexMap,
  scheduleData,
}) {
  return useMemo(() => {
    if (
      !isMonthly ||
      !monthlyRowsForView.length ||
      !monthlyStartDate
    ) {
      return [];
    }

    return (scheduleData || [])
      .map((item) => {
        const dateKeys = collectDateKeys(item);

        if (!dateKeys.length) return null;

        const normalizedKeys = dateKeys
          .map((key) => formatDateKey(key))
          .filter(Boolean);

        if (!normalizedKeys.length) return null;

        const firstKey = normalizedKeys[0];
        const lastKey =
          normalizedKeys[
            normalizedKeys.length - 1
          ];

        const rowStart =
          monthlyRowIndexMap[firstKey];

        const rowEndIndex =
          monthlyRowIndexMap[lastKey];

        if (!rowStart || !rowEndIndex) {
          return null;
        }

        const startDate =
          parseDateKeyToDate(firstKey);

        const endDate =
          parseDateKeyToDate(lastKey);

        if (!startDate || !endDate) {
          return null;
        }

        const weekStart = getWeekColumn(
          startDate,
          monthlyStartDate
        );

        const weekEnd = getWeekColumn(
          endDate,
          monthlyStartDate
        );

        if (!weekStart || !weekEnd) {
          return null;
        }

        const bookingSlot =
          createBookingSlot({
            ...item,
            date: firstKey,
          });

        return {
          ...bookingSlot,
          rowStart,
          rowEnd: rowEndIndex + 1,
          min: weekStart + 1,
          max: weekEnd + 2,
        };
      })
      .filter(Boolean);
  }, [
    isMonthly,
    monthlyRowsForView,
    monthlyStartDate,
    monthlyRowIndexMap,
    scheduleData,
  ]);
}