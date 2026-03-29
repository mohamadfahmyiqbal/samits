import React, { useState } from 'react';
import { Tooltip, Badge, Dropdown, Button } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  format,
  differenceInDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';

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

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#e6f7ff';
      case 'in_progress':
        return '#fff7e6';
      case 'completed':
        return '#f6ffed';
      case 'cancelled':
        return '#fff2f0';
      case 'pending':
        return '#f5f5f5';
      default:
        return '#fafafa';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <CalendarOutlined />;
      case 'in_progress':
        return <ClockCircleOutlined />;
      case 'completed':
        return <CheckCircleOutlined />;
      case 'cancelled':
        return <ExclamationCircleOutlined />;
      default:
        return <CalendarOutlined />;
    }
  };

  const getGanttData = () => {
    return scheduleData.map((item) => {
      const dateStr = item.date || item.scheduledDate;
      const startTime = item.start_time || item.scheduledStartTime || '00:00';
      const endTime = item.end_time || item.scheduledEndTime || '23:59';

      const startDateTime = `${dateStr}T${startTime}:00`;
      const endDateTime = `${dateStr}T${endTime}:00`;

      return {
        id: item.id,
        name: `${item.equipment} - ${item.subcategory}`,
        start: parseISO(startDateTime),
        end: parseISO(endDateTime),
        dateStr: dateStr,
        progress: item.status === 'completed' ? 100 : item.status === 'in_progress' ? 50 : 0,
        status: item.status,
        priority: item.priority,
        criticality: item.criticality,
        team: item.team,
        dependencies: [],
      };
    });
  };

  const ganttData = getGanttData();
  const { start: startDate, end: endDate } = getDateRange();
  const totalDays = differenceInDays(endDate, startDate) + 1;

  const isHourlyView = ganttViewType === 'daily';
  const displayDays = isHourlyView ? 24 : Math.min(totalDays, ganttViewType === 'monthly' ? 31 : 7);
  const hourLabels = isHourlyView
    ? Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
    : Array.from({ length: displayDays }, (_, i) =>
        ganttViewType === 'monthly'
          ? format(addDays(startDate, i), 'dd')
          : format(addDays(startDate, i), 'dd/MM')
      );

  return (
    <div
      className='gantt-chart'
      style={{
        overflow: 'hidden',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #f0f0f0',
      }}
    >
      {/* Header with view controls */}
      <div
        style={{
          padding: '16px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#262626', fontSize: '16px' }}>Maintenance Timeline</h3>
          <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: '12px' }}>
            {ganttViewType === 'daily'
              ? 'Daily View'
              : ganttViewType === 'weekly'
                ? 'Weekly View'
                : 'Monthly View'}{' '}
            •{scheduleData.length} tasks
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge
            count={scheduleData.filter((t) => t.status === 'completed').length}
            style={{ backgroundColor: '#52c41a' }}
          >
            <Button size='small' icon={<CheckCircleOutlined />}>
              Completed
            </Button>
          </Badge>
          <Badge
            count={scheduleData.filter((t) => t.status === 'in_progress').length}
            style={{ backgroundColor: '#fa8c16' }}
          >
            <Button size='small' icon={<ClockCircleOutlined />}>
              In Progress
            </Button>
          </Badge>
        </div>
      </div>

      {/* Timeline content */}
      <div
        className='gantt-scroll-wrapper'
        style={{
          overflow: 'auto',
          maxHeight: '500px',
          background: '#fff',
        }}
      >
        <div className='gantt-content' style={{ minWidth: 'fit-content' }}>
          {/* Date header */}
          <div
            className='gantt-header'
            style={{
              position: 'sticky',
              left: 0,
              zIndex: 10,
              background: 'linear-gradient(to right, #f8f9fa 0%, #ffffff 100%)',
              width: '100px',
              borderRight: '2px solid #1890ff',
            }}
          >
            <div className='gantt-timeline-vertical'>
              {hourLabels.map((label, i) => (
                <div
                  key={i}
                  className={`gantt-day-vertical ${isHourlyView ? 'gantt-hour-vertical' : ''}`}
                  style={{
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: i % 2 === 0 ? '#fafafa' : '#fff',
                    color: '#262626',
                    borderRight: '1px solid #e8e8e8',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{label}</div>
                    {ganttViewType === 'monthly' && (
                      <div style={{ fontSize: '9px', color: '#8c8c8c', marginTop: '2px' }}>
                        {format(addDays(startDate, i), 'EEE')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks area */}
          <div className='gantt-body' style={{ display: 'flex', marginLeft: '100px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              {/* Timeline slots */}
              {hourLabels.map((label, i) => (
                <div
                  key={i}
                  style={{
                    height: '70px',
                    borderBottom: '1px solid #f0f0f0',
                    position: 'relative',
                    background: i % 2 === 0 ? '#fafafa' : '#fff',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredTask(i)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  {/* Tasks for this slot */}
                  {ganttData
                    .filter((task) => {
                      const taskStart = new Date(task.start);
                      const taskEnd = new Date(task.end);
                      const taskDate = task.dateStr;

                      if (isHourlyView) {
                        const taskHour = taskStart.getHours();
                        return taskHour === parseInt(label.split(':')[0]);
                      } else {
                        const rangeStartObj = new Date(startDate);
                        const taskDateObj = new Date(taskDate);
                        const localDiffDays = Math.floor(
                          (taskDateObj.getTime() - rangeStartObj.getTime()) / (1000 * 60 * 60 * 24)
                        );

                        if (ganttViewType === 'monthly') {
                          const taskDay = taskDateObj.getDate();
                          const labelDay = parseInt(label);
                          return taskDay === labelDay;
                        } else {
                          return localDiffDays === i;
                        }
                      }
                    })
                    .map((task, taskIndex) => {
                      const taskStart = new Date(task.start);
                      const taskEnd = new Date(task.end);

                      let duration;
                      if (isHourlyView) {
                        const taskStartHour = taskStart.getHours() + taskStart.getMinutes() / 60;
                        const taskEndHour = taskEnd.getHours() + taskEnd.getMinutes() / 60;
                        duration = taskEndHour - taskStartHour;
                      } else {
                        duration = Math.min(
                          (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24),
                          1
                        );
                      }

                      const isHovered = hoveredTask === task.id;
                      const isSelected = selectedTask === task.id;

                      const menuItems = [
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

                      return (
                        <div
                          key={task.id}
                          style={{
                            position: 'absolute',
                            top: `${4 + taskIndex * 24}px`,
                            left: '4px',
                            right: '4px',
                            padding: '6px',
                            backgroundColor: getStatusBgColor(task.status),
                            borderRadius: '6px',
                            border: `2px solid ${getStatusColor(task.status)}`,
                            fontSize: '10px',
                            zIndex: isSelected ? 10 : isHovered ? 5 : 1,
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected
                              ? '0 4px 12px rgba(24, 144, 255, 0.15)'
                              : isHovered
                                ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                                : 'none',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                          onClick={() => setSelectedTask(task.id)}
                        >
                          {/* Task header */}
                          <div
                            style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}
                          >
                            <div
                              style={{
                                width: '16px',
                                textAlign: 'center',
                                marginRight: '4px',
                                color: getStatusColor(task.status),
                              }}
                            >
                              {getStatusIcon(task.status)}
                            </div>
                            <div
                              style={{
                                flex: 1,
                                fontSize: '9px',
                                fontWeight: 'bold',
                                color: '#262626',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {task.name.length > 18
                                ? task.name.substring(0, 18) + '...'
                                : task.name}
                            </div>
                            <Dropdown
                              menu={{ items: menuItems }}
                              trigger={['click']}
                              placement='bottomRight'
                            >
                              <Button
                                type='text'
                                size='small'
                                icon={<MoreOutlined />}
                                style={{
                                  padding: '0 2px',
                                  height: '16px',
                                  minWidth: '16px',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Dropdown>
                          </div>

                          {/* Status bar */}
                          <div
                            style={{
                              height: '14px',
                              backgroundColor: getStatusColor(task.status),
                              opacity: task.status === 'completed' ? 0.8 : 1,
                              borderRadius: '2px',
                              marginBottom: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '8px',
                              color: '#fff',
                              fontWeight: 'bold',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <span
                              style={{
                                textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%',
                              }}
                            >
                              {task.status === 'completed'
                                ? '✓ Done'
                                : task.status === 'in_progress'
                                  ? '⏳ Progress'
                                  : task.status === 'scheduled'
                                    ? '📅 Scheduled'
                                    : task.status.charAt(0).toUpperCase()}
                            </span>
                            {task.progress > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  height: '100%',
                                  width: `${task.progress}%`,
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  borderRadius: '2px',
                                }}
                              />
                            )}
                          </div>

                          {/* Task details */}
                          <div
                            style={{
                              fontSize: '8px',
                              color: '#666',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '60%',
                              }}
                            >
                              {task.team}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <span
                                style={{
                                  color: getPriorityColor(task.priority),
                                  fontWeight: 'bold',
                                  fontSize: '7px',
                                }}
                              >
                                {task.priority?.charAt(0).toUpperCase() || 'M'}
                              </span>
                              <span
                                style={{
                                  color: getCriticalityColor(task.criticality),
                                  fontWeight: 'bold',
                                  fontSize: '7px',
                                }}
                              >
                                {task.criticality?.charAt(0).toUpperCase() || 'M'}
                              </span>
                            </div>
                          </div>

                          {/* Tooltip */}
                          <Tooltip
                            title={
                              <div style={{ padding: '8px', fontSize: '11px', maxWidth: '250px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                  {task.name}
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <strong>Team:</strong> {task.team}
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <strong>Status:</strong>
                                  <span
                                    style={{
                                      color: getStatusColor(task.status),
                                      marginLeft: '4px',
                                    }}
                                  >
                                    {task.status.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <strong>Priority:</strong>
                                  <span
                                    style={{
                                      color: getPriorityColor(task.priority),
                                      marginLeft: '4px',
                                    }}
                                  >
                                    {task.priority?.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <strong>Criticality:</strong>
                                  <span
                                    style={{
                                      color: getCriticalityColor(task.criticality),
                                      marginLeft: '4px',
                                    }}
                                  >
                                    {task.criticality?.toUpperCase()}
                                  </span>
                                </div>
                                <div style={{ marginBottom: '2px' }}>
                                  <strong>Date:</strong> {task.dateStr}
                                </div>
                                <div>
                                  <strong>Duration:</strong>{' '}
                                  {Math.round(duration * (isHourlyView ? 1 : 24))} hours
                                </div>
                              </div>
                            }
                            placement='topLeft'
                          >
                            <div
                              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            />
                          </Tooltip>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
