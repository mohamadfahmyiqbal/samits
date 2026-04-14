// fe\src\pages\MaintenanceSchedule\components\hooks\useYearlyOverlay.js
import { useMemo } from 'react';
import {
 collectDateKeys,
 createBookingSlot,
} from '../../utils/ganttBooking';
import {
 formatDateKey,
 parseDateKeyToDate,
} from '../../utils/ganttDate';

export default function useYearlyOverlay({
 isYearly,
 scheduleData,
}) {
 return useMemo(() => {
  if (!isYearly) return [];

  const getMonthWeek = (date) =>
   Math.min(4, Math.ceil(date.getDate() / 7));

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
     rowStart: getMonthWeek(startDate),
     rowEnd: getMonthWeek(endDate) + 1,
     min: startDate.getMonth() + 2,
     max: endDate.getMonth() + 3,
     originalData: item,
    };
   })
   .filter(Boolean);
 }, [isYearly, scheduleData]);
}