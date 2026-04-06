import React from 'react';

const DailyGanttChart = ({ dailyEntry, workingHours, columnTemplate, onEdit }) => (
 <div className="gantt__row gantt__row--daily" style={{ gridTemplateColumns: columnTemplate }}>
  <div className="daily-hour-axis">
   {workingHours.map((hour, idx) => (
    <div
     key={`hour-${hour}`}
     className="daily-hour-label"
     style={{ gridRow: `${idx * 6 + 1} / span 6` }}
    >
     {`${String(hour).padStart(2, '0')}:00`}
    </div>
   ))}
  </div>
  <div className="daily-task-grid">
   {dailyEntry.data.length === 0 ? (
    <div className="daily-empty">Tidak ada jadwal pada jam ini</div>
   ) : (
    dailyEntry.data.map((task) => {
     const rowStart = task.startRow || 1;
     const spanHours = Math.max(1, task.spanRows || 1);
     return (
      <div
       key={`${task.id || task.subject}-${task.rangeLabel}`}
       className="daily-task-card daily-task-card--grid"
       style={{
        gridRow: `${rowStart} / span ${spanHours}`,
       }}
       onClick={() => onEdit && onEdit(task.originalData || task)}
      >
       <div className="daily-task-title">{task.subject || task.equipment}</div>
       <div className="daily-task-time">{task.rangeLabel}</div>
       <div className="daily-task-meta">
        <span>{task.team || task.userName || 'Unknown PIC'}</span>
        <span>{task.location || 'Lokasi belum tersedia'}</span>
       </div>
      </div>
     );
    })
   )}
  </div>
 </div>
);

DailyGanttChart.displayName = 'DailyGanttChart';
export default DailyGanttChart;

