//fe\src\pages\MaintenanceSchedule\components\utils\ganttView.js
export const getWeekRow = (date) => {
 if (!date) return null;

 const startOfYear = new Date(
  date.getFullYear(),
  0,
  1
 );

 const diffDays =
  Math.floor(
   (date - startOfYear) /
   (1000 * 60 * 60 * 24)
  ) + 1;

 return Math.ceil(diffDays / 7);
};

export const getMonthColumn = (date) => {
 if (!date) return null;

 return date.getMonth() + 2;
};

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