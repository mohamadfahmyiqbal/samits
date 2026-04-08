import React, { memo } from 'react';

const WORK_START_HOUR = 8;
const WORK_END_HOUR = 17;

const workingHours = Array.from(
 {
  length:
   WORK_END_HOUR -
   WORK_START_HOUR +
   1,
 },
 (_, idx) =>
  WORK_START_HOUR + idx
);

const statusLabelMap = {
 planned: 'Planned',
 in_progress: 'In Progress',
 completed: 'Completed',
 cancelled: 'Cancelled',
};

const DailyGanttChart = memo(
 ({
  dailyEntry = { data: [] },
  onEdit,
  selectedDate,
  columnTemplate = 'minmax(120px, 180px) 1fr',
 }) => {
  const tasks = Array.isArray(
   dailyEntry?.data
  )
   ? dailyEntry.data
   : [];

  return (
   <>
    <div
     className="gantt__row gantt__row--months gantt__row--daily-header"
     style={{
      gridTemplateColumns:
       columnTemplate,
      borderBottom:
       '1px solid rgba(15, 23, 42, 0.12)',
     }}
    >
     <span className="gantt__cell">
      JAM
     </span>
     <span className="gantt__cell">
      TUGAS
     </span>
    </div>

    <div
     className="gantt-scrollable"
     style={{
      '--slot-count':
       workingHours.length,
     }}
    >
     <div
      className="gantt__row gantt__row--daily"
      style={{
       gridTemplateColumns:
        columnTemplate,
       border:
        '1px solid rgba(15, 23, 42, 0.08)',
       borderRadius: '12px',
      }}
     >
      <div className="daily-hour-axis">
       {workingHours.map(
        (hour, idx) => (
         <div
          key={`hour-${hour}`}
          className="daily-hour-label"
          style={{
           gridRow: `${idx * 6 + 1} / span 6`,
          }}
         >
          {`${String(hour).padStart(
           2,
           '0'
          )}:00`}
         </div>
        )
       )}
      </div>

      <div className="daily-task-grid">
       {!tasks.length ? (
        <div className="daily-empty">
         Tidak ada jadwal
         untuk tanggal ini
        </div>
       ) : (
        tasks.map(
         (task, index) => {
          const rowStart =
           Math.max(
            1,
            task.startRow ||
            1
           );

          const spanRows =
           Math.max(
            1,
            task.spanRows ||
            6
           );

          return (
           <div
            key={`task-${task.id ?? index}-${task.dateKey}-${rowStart}-${spanRows}`}
            className="daily-task-card daily-task-card--grid"
            style={{
             gridRow: `${rowStart} / span ${spanRows}`,
            }}
            onClick={() =>
             onEdit?.(
              task.originalData ||
              task
             )
            }
           >
            <div className="daily-task-header">
             <div className="daily-task-title">
              {task.subject ||
               task.equipment ||
               'Maintenance'}
             </div>

             <span
              className={`daily-task-status daily-task-status--${task.bookStatus || 'planned'}`}
             >
              {statusLabelMap[task.bookStatus] || 'Planned'}
             </span>
            </div>
            <div className="daily-task-time">
             {task.rangeLabel ||
              'Waktu belum tersedia'}
            </div>

            <div className="daily-task-meta">
             <span>
              {task.team ||
               task.userName ||
               'Unknown PIC'}
             </span>
             <span>
              {task.location ||
               'Lokasi belum tersedia'}
             </span>
            </div>
           </div>
          );
         }
        )
       )}
      </div>
     </div>
    </div>
   </>
  );
 }
);

DailyGanttChart.displayName =
 'DailyGanttChart';

export default DailyGanttChart;