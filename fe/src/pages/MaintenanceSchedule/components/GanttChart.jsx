import React, { useMemo } from 'react';
import { format } from 'date-fns';
import './GanttChart.css';
import DailyView from './views/DailyView';
import WeeklyView from './views/WeeklyView';
import MonthlyView from './views/MonthlyView';
import YearlyView from './views/YearlyView';
import {
  buildTimeSlots,
  workingHours,
  groupByDate,
  buildDateSlots,
  formatDateKey,
  isDateInRange,
} from './utils';

export default function GanttChart({
  scheduleData = [],
  onEdit,
  viewType = 'weekly',
  dateRange = {},
  loading = false,
  error = null,
}) {
  const timeSlots = useMemo(buildTimeSlots, []);
  const groupedSchedule = useMemo(() => groupByDate(scheduleData), [scheduleData]);
  const scheduleEntries = Object.entries(groupedSchedule);
  const isDaily = viewType === 'daily';
  const isWeekly = viewType === 'weekly';
  const dailyDateKey =
    formatDateKey(dateRange?.start) || scheduleEntries[0]?.[0] || format(new Date(), 'yyyy-MM-dd');
  const dailyEntry = groupedSchedule[dailyDateKey] || {
    data: [],
    bookStatus: 'available',
    key: dailyDateKey,
  };
  const dateSlots = useMemo(() => buildDateSlots(dateRange, viewType), [dateRange, viewType]);
  const slotCount = isDaily ? 1 : isWeekly ? timeSlots.length : Math.max(dateSlots.length, 1);
  const lineSlots = Array.from({ length: slotCount }, (_, idx) => idx);
  const filteredEntries = isDaily
    ? []
    : scheduleEntries.filter(([dateKey]) => isDateInRange(dateKey, dateRange));
  const weeklySlots = isWeekly ? buildDateSlots(dateRange, 'weekly') : [];
  const rowsForView = isDaily
    ? []
    : isWeekly
      ? weeklySlots.map((slot) => ({
          dateKey: slot.key,
          bookingObj: groupedSchedule[slot.key] || {
            data: [],
            bookStatus: 'available',
            key: slot.key,
          },
        }))
      : filteredEntries.map(([tanggal, bookingObj]) => ({
          dateKey: tanggal,
          bookingObj,
        }));
  const headerColumns = isDaily
    ? [{ key: 'task', label: 'TUGAS' }]
    : isWeekly
      ? timeSlots
      : dateSlots.length
        ? dateSlots
        : lineSlots.map((slot) => ({ key: `slot-${slot}`, label: '-' }));

  if (loading) {
    return (
      <div className='gantt-master-container'>
        <div className='gantt-wrapper'>
          <div className='gantt-loading-container'>
            <div className='loading-spinner' aria-label='Loading schedule data'></div>
            <p className='loading-text'>Memuat jadwal maintenance...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='gantt-master-container'>
        <div className='gantt-wrapper'>
          <div className='gantt-error-container' role='alert'>
            <div className='error-icon'>⚠️</div>
            <p className='error-text'>{error}</p>
            <button
              className='error-retry-btn'
              onClick={() => window.location.reload()}
              aria-label='Retry loading schedule'
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='gantt-master-container'>
      <div className='gantt-wrapper'>
        <div
          className={`gantt${isDaily ? ' gantt--daily' : ''}`}
          style={{ '--slot-count': slotCount }}
          role='region'
          aria-label='Maintenance schedule gantt chart'
        >
          <header
            className={`gantt__row gantt__row--months${isDaily ? ' daily-wrap' : ''}`}
            role='banner'
          >
            <span
              className='gantt__cell'
              aria-label={isDaily ? 'Time column header' : 'Task column header'}
            >
              {isDaily ? 'JAM' : 'TASK'}
            </span>
            {isDaily ? (
              <span className='gantt__cell' aria-label='Task column header'>
                TUGAS
              </span>
            ) : (
              headerColumns.map((slot) => (
                <span
                  key={slot.key}
                  className='gantt__cell'
                  aria-label={`Column header: ${slot.label}`}
                >
                  {slot.label}
                </span>
              ))
            )}
          </header>

          {isDaily ? (
            <DailyView dailyEntry={dailyEntry} workingHours={workingHours} onEdit={onEdit} />
          ) : viewType === 'weekly' ? (
            <WeeklyView rowsForView={rowsForView} lineSlots={lineSlots} onEdit={onEdit} />
          ) : viewType === 'monthly' ? (
            <MonthlyView rowsForView={rowsForView} lineSlots={lineSlots} onEdit={onEdit} />
          ) : viewType === 'yearly' ? (
            <YearlyView rowsForView={rowsForView} lineSlots={lineSlots} onEdit={onEdit} />
          ) : (
            <WeeklyView rowsForView={rowsForView} lineSlots={lineSlots} onEdit={onEdit} />
          )}
        </div>
      </div>
    </div>
  );
}
