// fe\src\pages\MaintenanceSchedule\components\hooks\useYearlyOverlay.js
import { useMemo } from 'react';
import {
 collectDateKeys,
 createBookingSlot,
} from '../utils/ganttBooking';
import {
 formatDateKey,
 parseDateKeyToDate,
} from '../utils/ganttDate';
import { getWeekRow } from '../utils/ganttView';
import { MONTH_COLUMNS } from '../components/gantt/MONTHS';

export default function useYearlyOverlay({
 isYearly,
 scheduleData,
}) {
 return useMemo(() => {
  if (!isYearly) return [];

  const monthIndexMap =
   MONTH_COLUMNS.reduce(
    (acc, _, index) => {
     acc[index] = index + 2;
     return acc;
    },
    {}
   );

  return (scheduleData || [])
   .map((item) => {
    const dateKeys =
     collectDateKeys(item);

    if (!dateKeys.length) {
     return null;
    }

    const normalizedKeys =
     dateKeys
      .map((key) =>
       formatDateKey(key)
      )
      .filter(Boolean);

    if (!normalizedKeys.length) {
     return null;
    }

    const firstKey =
     normalizedKeys[0];

    const lastKey =
     normalizedKeys[
     normalizedKeys.length - 1
     ];

    const startDate =
     parseDateKeyToDate(firstKey);

    const endDate =
     parseDateKeyToDate(lastKey);

    if (!startDate || !endDate) {
     return null;
    }

    const bookingSlot =
     createBookingSlot({
      ...item,
      date: firstKey,
     });

    return {
     ...bookingSlot,
     rowStart:
      getWeekRow(startDate),
     rowEnd:
      getWeekRow(endDate) + 1,
     min:
      monthIndexMap[
      startDate.getMonth()
      ],
     max:
      monthIndexMap[
      endDate.getMonth()
      ] + 1,
     originalData: item,
    };
   })
   .filter(Boolean);
 }, [isYearly, scheduleData]);
}