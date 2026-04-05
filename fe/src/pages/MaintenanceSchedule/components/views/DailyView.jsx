import React, { memo } from 'react';
import { format } from 'date-fns';

const DailyTaskCard = memo(({ task, onEdit }) => {
  // DEBUG: Log render values
  console.log('DailyTaskCard render:', {
    subject: task.subject,
    startRow: task.startRow,
    spanRows: task.spanRows,
    gridRow: `${task.startRow || 1} / span ${Math.max(1, task.spanRows || 1)}`,
  });

  const handleTaskClick = () => {
    onEdit && onEdit(task.originalData || task);
  };

  const handleTaskKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTaskClick();
    }
  };

  return (
    <div
      key={`${task.id || task.subject}-${task.rangeLabel}`}
      className={`daily-task-card daily-task-card--grid ${task.bookStatus || 'available'}`}
      style={{
        gridRow: `${task.startRow || 1} / span ${Math.max(1, task.spanRows || 1)}`,
      }}
      onClick={handleTaskClick}
      onKeyDown={handleTaskKeyDown}
      role='button'
      tabIndex={0}
      aria-label={`Task: ${task.subject || task.equipment}. Time: ${task.rangeLabel}. PIC: ${task.team || task.userName || 'Unknown PIC'}. Location: ${task.location || 'Lokasi belum tersedia'}. Status: ${task.bookStatus || 'available'}`}
    >
      <div className='daily-task-title'>{task.subject || task.equipment}</div>
      <div className='daily-task-time'>{task.rangeLabel}</div>
      <div className='daily-task-meta'>
        <span>{task.team || task.userName || 'Unknown PIC'}</span>
        <span>{task.location || 'Lokasi belum tersedia'}</span>
      </div>
    </div>
  );
});

const DailyView = memo(({ dailyEntry, workingHours, onEdit }) => {
  if (!dailyEntry) {
    return (
      <div className='gantt__row gantt__row--daily'>
        <div className='gantt__cell daily-hour-cell'>
          <div className='daily-hour-axis'>
            {workingHours.map((hour, idx) => (
              <div
                key={`hour-${hour}`}
                className='daily-hour-label'
                style={{ gridRow: `${idx * 6 + 1} / span 6` }}
              >
                {`${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>
        </div>
        <div className='gantt__cell daily-task-cell'>
          <div className='daily-task-grid' role='main' aria-label='Daily maintenance tasks'>
            <div className='daily-empty' role='status' aria-live='polite'>
              Tidak ada jadwal pada hari ini
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='gantt__row gantt__row--daily'>
      <div className='gantt__cell daily-hour-cell'>
        <div className='daily-hour-axis'>
          {workingHours.map((hour, idx) => (
            <div
              key={`hour-${hour}`}
              className='daily-hour-label'
              style={{ gridRow: `${idx * 6 + 1} / span 6` }}
            >
              {`${String(hour).padStart(2, '0')}:00`}
            </div>
          ))}
        </div>
      </div>
      <div className='gantt__cell daily-task-cell'>
        <div className='daily-task-grid' role='main' aria-label='Daily maintenance tasks'>
          {dailyEntry.data.length === 0 ? (
            <div className='daily-empty' role='status' aria-live='polite'>
              Tidak ada jadwal pada hari ini
            </div>
          ) : (
            dailyEntry.data.map((task) => (
              <DailyTaskCard
                key={`${task.id || task.subject}-${task.rangeLabel}`}
                task={task}
                onEdit={onEdit}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

DailyView.displayName = 'DailyView';

export default DailyView;
