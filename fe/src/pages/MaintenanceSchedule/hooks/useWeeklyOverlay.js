import { useMemo } from 'react';
import { collectDateKeys } from '../utils/ganttBooking';

export default function useWeeklyOverlay(
  scheduleData,
  rowIndexMap,
  createBookingSlot
) {
  return useMemo(() => {
    return (scheduleData || [])
      .flatMap((item) =>
        collectDateKeys(item)
          .map((dateKey) => {
            const rowStart = rowIndexMap[dateKey];
            if (!rowStart) return null;

            return {
              ...createBookingSlot(item),
              rowStart,
              rowEnd: rowStart + 1,
            };
          })
          .filter(Boolean)
      );
  }, [scheduleData, rowIndexMap, createBookingSlot]);
}