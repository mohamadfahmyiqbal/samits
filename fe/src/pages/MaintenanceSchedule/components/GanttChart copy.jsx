import React, { useMemo, useState } from 'react';
import { Badge, Button, Dropdown, Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { format, startOfDay, addDays } from 'date-fns';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const statusLabelMap = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Canceled',
  pending: 'Pending',
};

const GanttChart = ({
  scheduleData,
  ganttViewType,
  selectedDateRange,
  getDateRange,
  onEdit,
  onDelete,
  onViewDetail,
}) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const dateRange = getDateRange();

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#1890ff';
      case 'in_progress':
        return '#fa8c16';
      case 'completed':
        return '#52c41a';
      case 'cancelled':
        return '#ff4d4f';
      case 'pending':
        return '#8c8c8c';
      default:
        return '#d9d9d9';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#ff4d4f';
      case 'high':
        return '#fa8c16';
      case 'medium':
        return '#1890ff';
      case 'low':
        return '#52c41a';
      default:
        return '#8c8c8c';
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'critical':
        return '#ff4d4f';
      case 'high':
        return '#fa8c16';
      case 'medium':
        return '#1890ff';
      case 'low':
        return '#52c41a';
      default:
        return '#8c8c8c';
    }
  };

  const formatDateLabel = (date) => format(date, 'dd/MM');
  const formatDayLabel = (date) => format(date, 'EEE');

  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseDateString = (value) => {
    if (!value) return null;
    const clean = value.split('T')[0].trim();
    const parts = clean.split('-').map((part) => parseInt(part, 10));
    if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) return null;
    const [year, month, day] = parts;
    return { year, month, day };
  };

const parseTimeString = (value) => {
  if (!value) return { hours: 0, minutes: 0, seconds: 0 };
  let parsed;
  if (value.includes('T')) {
    parsed = dayjs.utc(value).utcOffset(7);
  } else {
    parsed = dayjs(value, ['HH:mm', 'HH:mm:ss']);
  }
  if (!parsed.isValid()) return { hours: 0, minutes: 0, seconds: 0 };
  return {
    hours: parsed.hour(),
    minutes: parsed.minute(),
    seconds: parsed.second(),
  };
};

  const ganttData = useMemo(() => {
    return scheduleData
      .map((item) => {
        const startDateValue = item.scheduledDate || item.date || item.start_date;
        const startTime = item.scheduledStartTime || item.start_time || '00:00';
        const endTime = item.scheduledEndTime || item.end_time || startTime || '23:59';
        const startDateParts = parseDateString(startDateValue);
        const startTimeParts = parseTimeString(startTime);
        const endTimeParts = parseTimeString(endTime);
        const startMinutesOfDay = startTimeParts.hours * 60 + startTimeParts.minutes;
        const endMinutesOfDay = endTimeParts.hours * 60 + endTimeParts.minutes;
        const displayDate =
          startDateParts &&
          new Date(startDateParts.year, startDateParts.month - 1, startDateParts.day);

        return {
          ...item,
          startTime,
          endTime,
          startMinutesOfDay,
          endMinutesOfDay,
          name: `${item.equipment} - ${item.subcategory}`,
          statusLabel: statusLabelMap[item.status] || 'Scheduled',
          durationMinutes: Math.max(endMinutesOfDay - startMinutesOfDay, 0),
          dateKey: startDateParts
            ? `${startDateParts.year}-${String(startDateParts.month).padStart(2, '0')}-${String(
                startDateParts.day,
              ).padStart(2, '0')}`
            : format(new Date(), 'yyyy-MM-dd'),
        };
      })
      .sort((a, b) => a.startMinutesOfDay - b.startMinutesOfDay);
  }, [scheduleData]);

  const createDateFromKey = (key) => {
    const parts = key.split('-').map((part) => parseInt(part, 10));
    if (parts.length < 3 || parts.some((part) => Number.isNaN(part))) {
      return new Date();
    }
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  };

  const dateGroups = useMemo(() => {
    if (!dateRange.start || !dateRange.end) {
      return [];
    }

    const normalizedStart = startOfDay(dateRange.start);
    const normalizedEnd = startOfDay(dateRange.end);

    if (ganttViewType === 'daily') {
      const primaryDayKey = format(normalizedStart, 'yyyy-MM-dd');
      const DAILY_START_HOUR = 8;
      const DAILY_END_HOUR = 17;
      const hourBuckets = [];
      for (let index = DAILY_START_HOUR; index <= DAILY_END_HOUR; index += 1) {
        hourBuckets.push({
          key: `${primaryDayKey}-${index.toString().padStart(2, '0')}`,
          date: normalizedStart,
          hour: index,
          label: `${index.toString().padStart(2, '0')}:00`,
          tasks: [],
          isHourly: true,
        });
      }

      const map = hourBuckets.reduce((acc, bucket) => {
        acc[bucket.key] = bucket;
        return acc;
      }, {});

      ganttData.forEach((task) => {
        const taskDateKey = task.dateKey || primaryDayKey;
        const bucketHourNumber = Math.floor(task.startMinutesOfDay / 60);
        const clampedHour = Math.min(
          DAILY_END_HOUR,
          Math.max(DAILY_START_HOUR, Number.isNaN(bucketHourNumber) ? DAILY_START_HOUR : bucketHourNumber),
        )
          .toString()
          .padStart(2, '0');
        const bucketKey = `${taskDateKey}-${clampedHour}`;

        if (!map[bucketKey]) {
          map[bucketKey] = {
            key: bucketKey,
            date: createDateFromKey(taskDateKey),
            hour: parseInt(clampedHour, 10),
            label: `${clampedHour}:00`,
            tasks: [],
            isHourly: true,
          };
        }
        map[bucketKey].tasks.push(task);
      });

      return Object.values(map)
        .map((group) => ({
          ...group,
          tasks: group.tasks.sort((a, b) => a.startMinutesOfDay - b.startMinutesOfDay),
        }))
        .sort((a, b) => a.key.localeCompare(b.key));
    }

    const days = [];
    let cursor = normalizedStart;
    while (cursor <= normalizedEnd) {
      const key = format(cursor, 'yyyy-MM-dd');
      days.push({
        key,
        date: new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
        tasks: [],
        isHourly: false,
      });
      cursor = addDays(cursor, 1);
    }

    const map = days.reduce((acc, day) => {
      acc[day.key] = day;
      return acc;
    }, {});

    ganttData.forEach((task) => {
      const key = task.dateKey;
      if (!map[key]) {
        map[key] = {
          key,
          date: createDateFromKey(key),
          tasks: [],
          isHourly: false,
        };
      }
      map[key].tasks.push(task);
    });

    return Object.values(map)
      .map((group) => ({
        ...group,
        tasks: group.tasks.sort((a, b) => a.startMinutesOfDay - b.startMinutesOfDay),
      }))
      .sort((a, b) => a.date - b.date);
  }, [ganttData, dateRange, ganttViewType]);

  const totalTasks = scheduleData.length;
  const statusCounts = useMemo(
    () => ({
      completed: scheduleData.filter((item) => item.status === 'completed').length,
      inProgress: scheduleData.filter((item) => item.status === 'in_progress').length,
    }),
    [scheduleData],
  );

  const toPlainDate = (value) => {
    if (!value) return null;
    if (typeof value.toDate === 'function') {
      return value.toDate();
    }
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  };

  const rangeLabel = useMemo(() => {
    const start = toPlainDate(selectedDateRange?.[0]) || dateRange.start;
    const end = toPlainDate(selectedDateRange?.[1]) || dateRange.end;

    if (!start || !end) return null;
    return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
  }, [dateRange, selectedDateRange]);

  const viewTitle =
    ganttViewType === 'daily'
      ? 'Daily View'
      : ganttViewType === 'weekly'
        ? 'Weekly View'
        : 'Monthly View';

  const buildActionMenu = (task) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => onViewDetail && onViewDetail(task),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => onEdit && onEdit(task),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => onDelete && onDelete(task.id),
    },
  ];

  const getTimelinePercent = (minutes) => {
    const totalMinutes = 24 * 60;
    return Math.max(0, Math.min(100, (minutes / totalMinutes) * 100));
  };

  return (
    <div
      className='gantt-chart'
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}
    >
      <div
        className='gantt-header'
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #f0f0f0',
          gap: '24px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Maintenance Timeline</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
            {viewTitle} • {totalTasks} tasks
          </p>
          {rangeLabel && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>{rangeLabel}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge
            count={statusCounts.completed}
            style={{ backgroundColor: '#52c41a', boxShadow: 'none' }}
          >
            <Button
              size='small'
              style={{
                borderRadius: '20px',
                fontSize: '12px',
                height: '32px',
                borderColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              icon={<CheckCircleOutlined />}
            >
              Completed
            </Button>
          </Badge>
          <Badge
            count={statusCounts.inProgress}
            style={{ backgroundColor: '#fa8c16', boxShadow: 'none' }}
          >
            <Button
              size='small'
              style={{
                borderRadius: '20px',
                fontSize: '12px',
                height: '32px',
                borderColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              icon={<ClockCircleOutlined />}
            >
              In Progress
            </Button>
          </Badge>
        </div>
      </div>

      <div
        className='gantt-body'
        style={{
          padding: '16px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {dateGroups.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Tidak ada jadwal maintenance di periode ini.
          </div>
        ) : (
          dateGroups.map((group) => (
            <div
              key={group.key}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '14px 16px',
                background: '#f9fafb',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  minWidth: '88px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 6px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#0b1c2c' }}>
                  {group.isHourly ? group.label : formatDateLabel(group.date)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {group.isHourly ? format(group.date, 'dd MMM yyyy') : formatDayLabel(group.date)}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.tasks.length === 0 ? (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px dashed #e5e7eb',
                      color: '#94a3b8',
                      fontSize: '12px',
                    }}
                  >
                    Tidak ada jadwal pada {group.isHourly ? 'jam ini' : 'hari ini'}.
                  </div>
                ) : (
                  group.tasks.map((task) => {
                    const isHovered = hoveredTask === task.id;
                    const isSelected = selectedTask === task.id;
                    const startPercent = getTimelinePercent(task.startMinutesOfDay);
                    const endPercent = getTimelinePercent(task.endMinutesOfDay);
                    const widthPercent = Math.max(endPercent - startPercent, 6);

                    const rawTask = task.originalData || task;
                    const menuItems = buildActionMenu(rawTask);

                    return (
                      <div
                        key={task.id}
                        onMouseEnter={() => setHoveredTask(task.id)}
                        onMouseLeave={() => setHoveredTask(null)}
                        onClick={() => {
                          setSelectedTask(task.id);
                          onEdit && onEdit(rawTask);
                        }}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: isSelected ? '1px solid #2563eb' : '1px solid #e5e7eb',
                          boxShadow: isSelected
                            ? '0 8px 20px rgba(37,99,235,0.15)'
                            : isHovered
                              ? '0 6px 16px rgba(15,23,42,0.08)'
                              : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {task.name}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: '#64748b',
                                marginTop: '2px',
                              }}
                            >
                              {task.team}
                            </div>
                          </div>
                          <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            placement='bottomRight'
                          >
                            <Button
                              type='text'
                              icon={<MoreOutlined />}
                              style={{
                                padding: '0',
                                color: '#475569',
                                height: '22px',
                                width: '22px',
                              }}
                              onClick={(event) => event.stopPropagation()}
                            />
                          </Dropdown>
                        </div>

                        <div
                          style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}
                        >
                          <Tag
                            color={getStatusColor(task.status)}
                            style={{
                              fontWeight: 600,
                              fontSize: '11px',
                              textTransform: 'capitalize',
                            }}
                          >
                            {task.statusLabel}
                          </Tag>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Tag
                              color={getPriorityColor(task.priority)}
                              style={{ fontSize: '10px', fontWeight: 600 }}
                            >
                              P: {task.priority?.charAt(0)?.toUpperCase() || 'M'}
                            </Tag>
                            <Tag
                              color={getCriticalityColor(task.criticality)}
                              style={{ fontSize: '10px', fontWeight: 600 }}
                            >
                              C: {task.criticality?.charAt(0)?.toUpperCase() || 'M'}
                            </Tag>
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              color: '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <ClockCircleOutlined />
                            {`${(task.durationMinutes / 60).toFixed(1)} hrs`}
                          </div>
                        </div>

                        <Tooltip
                          trigger={['hover']}
                          title={`${formatMinutes(task.startMinutesOfDay)} - ${formatMinutes(
                            task.endMinutesOfDay,
                          )}`}
                        >
                          <div
                            style={{
                              position: 'relative',
                              height: '8px',
                              borderRadius: '4px',
                              background: '#e5e7eb',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                                height: '100%',
                                borderRadius: '4px',
                                background: `linear-gradient(90deg, ${getStatusColor(
                                  task.status,
                                )} 0%, ${getStatusColor(task.status)}cc 100%)`,
                              }}
                            />
                          </div>
                        </Tooltip>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            color: '#94a3b8',
                          }}
                        >
                          <span>{formatMinutes(task.startMinutesOfDay)}</span>
                          <span>{formatMinutes(task.endMinutesOfDay)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GanttChart;
