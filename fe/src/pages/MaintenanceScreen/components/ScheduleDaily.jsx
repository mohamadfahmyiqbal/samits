import React, { useMemo, useEffect, useRef } from "react";
import { Card, Button, Badge, Row, Col } from "react-bootstrap";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Tag, 
  HardDrive, 
  CalendarCheck,
  CalendarDays,
  Info
} from "lucide-react";
import { 
  format, 
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  isSameHour,
  isToday,
  parseISO
} from "date-fns";
import { id } from "date-fns/locale";

// Helper to parse time from various formats
const parseLogTime = (log) => {
  const timeCandidate = log.scheduledStartTime || log.scheduledTime;
  if (!timeCandidate) return 9; // Default to 09:00 if missing
  
  let timeStr;
  if (typeof timeCandidate === 'string') {
    timeStr = timeCandidate;
  } else if (timeCandidate instanceof Date) {
    return timeCandidate.getHours();
  } else {
    timeStr = String(timeCandidate);
  }
  
  // Match HH:MM
  const timeMatch = timeStr.match(/([01]?\d|2[0-3]):([0-5]\d)/);
  if (!timeMatch) return 9;
  
  return parseInt(timeMatch[1], 10);
};

export default function ScheduleDaily({
  currentDate,
  selectedDate,
  logsByDate,
  onPrevDay,
  onNextDay,
  onToday,
  onDayClick,
  onDayDoubleClick,
  onEdit,
  getCategoryBadgeColor
}) {
  const scrollRef = useRef(null);

  // Memoize 24 hour slots
  const hourSlots = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    return eachHourOfInterval({ start: dayStart, end: dayEnd });
  }, [currentDate]);

  // Get all logs for current date
  const dayLogs = useMemo(() => {
    const dateKey = format(currentDate, "yyyy-MM-dd");
    return logsByDate[dateKey] || [];
  }, [logsByDate, currentDate]);

  // OPTIMIZATION: Group logs by hour ONCE instead of filtering in loop
  const logsByHour = useMemo(() => {
    const grouped = {};
    dayLogs.forEach(log => {
      const hour = parseLogTime(log);
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(log);
    });
    return grouped;
  }, [dayLogs]);

  // Scroll to current hour on mount if today
  useEffect(() => {
    if (isToday(currentDate) && scrollRef.current) {
      const currentHour = new Date().getHours();
      const element = document.getElementById(`hour-${currentHour}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentDate]);

  const getStatusBadgeVariant = (status) => {
    const variants = {
      done: "success",
      in_progress: "warning",
      abnormal: "danger",
      pending: "secondary",
      overdue: "danger"
    };
    return variants[status] || "secondary";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Open",
      in_progress: "In Progress",
      done: "Done",
      abnormal: "Abnormal",
      overdue: "Terlambat"
    };
    return labels[status] || status;
  };

  return (
    <Card className="border-0 bg-transparent">
      <Card.Header className="bg-white d-flex align-items-center justify-content-between py-3 rounded-top border-bottom shadow-sm z-1">
        <Button variant="outline-primary" size="sm" className="rounded-circle p-1" onClick={onPrevDay}>
          <ChevronLeft size={24} />
        </Button>
        <div className="text-center">
          <h4 className="mb-0 fw-bold text-primary">
            {format(currentDate, "EEEE, d MMMM yyyy", { locale: id })}
          </h4>
          <Badge bg="light" text="dark" className="border">
            {dayLogs.length} Schedule Hari Ini
          </Badge>
        </div>
        <Button variant="outline-primary" size="sm" className="rounded-circle p-1" onClick={onNextDay}>
          <ChevronRight size={24} />
        </Button>
      </Card.Header>

      <Card.Body 
        ref={scrollRef}
        style={{ maxHeight: "600px", overflowY: "auto" }} 
        className="p-3 bg-light/30 custom-scrollbar"
      >
        {dayLogs.length === 0 ? (
          <div className="text-center text-muted py-5 my-5">
            <CalendarCheck size={64} className="mb-3 opacity-20" />
            <h5 className="fw-bold">Tidak ada jadwal</h5>
            <p className="small mb-4 text-muted">Hari ini bebas dari jadwal maintenance.</p>
            <Button variant="primary" size="sm" onClick={onToday} className="px-4 shadow-sm">
              Kembali ke Hari Ini
            </Button>
          </div>
        ) : (
          <div className="timeline-container position-relative ps-4">
            {/* Timeline vertical line */}
            <div className="position-absolute h-100 border-start border-2 opacity-20 start-0 ms-2" style={{ top: 0 }}></div>

            {hourSlots.map((hourDate) => {
              const hourValue = hourDate.getHours();
              const hourLogs = logsByHour[hourValue] || [];
              const isCurrentHour = isToday(currentDate) && isSameHour(hourDate, new Date());
              
              return (
                <div 
                  key={hourValue} 
                  id={`hour-${hourValue}`}
                  className={`timeline-row mb-4 position-relative ${isCurrentHour ? 'active-hour' : ''}`}
                >
                  {/* Timeline dot */}
                  <div 
                    className={`position-absolute rounded-circle border-4 border-white shadow-sm start-0 ${isCurrentHour ? 'bg-primary' : 'bg-light border-secondary opacity-50'}`}
                    style={{ width: '16px', height: '16px', left: '-27px', top: '4px', marginLeft: '-15px', zIndex: 2 }}
                  ></div>

                  <div className="d-flex align-items-start">
                    <div className={`time-label me-3 fw-bold ${isCurrentHour ? 'text-primary' : 'text-muted'}`} style={{ minWidth: '55px', fontSize: '0.85rem' }}>
                      {format(hourDate, "HH:mm")}
                    </div>
                    
                    <div className="flex-grow-1">
                      {hourLogs.length === 0 ? (
                        <div className="text-muted opacity-30 small pt-1">---</div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {hourLogs.map((log, idx) => (
                            <Card 
                              key={`${hourValue}-${idx}`}
                              className="border-0 shadow-sm hover-scale-sm"
                              style={{ cursor: "pointer" }}
                              onClick={() => onEdit?.(log)}
                              onDoubleClick={() => onDayDoubleClick(new Date(log.scheduledDate))}
                            >
                              <Card.Body className="p-3 border-start border-4 rounded-end" style={{ borderLeftColor: `var(--bs-${getCategoryBadgeColor(log.category)})` }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <span className="fw-bold text-dark">{log.assetName || log.itItemId}</span>
                                      <Badge bg={getCategoryBadgeColor(log.category)} className="x-small">
                                        {log.category}
                                      </Badge>
                                      <Badge bg={getStatusBadgeVariant(log.status)} className="x-small">
                                        {getStatusLabel(log.status)}
                                      </Badge>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 x-small text-muted">
                                      <span className="d-flex align-items-center gap-1">
                                        <HardDrive size={12} /> {log.hostname || "-"}
                                      </span>
                                      <span className="d-flex align-items-center gap-1">
                                        <Tag size={12} /> {log.type || "-"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    {log.pic && (
                                      <div className="x-small fw-medium text-primary d-flex align-items-center gap-1">
                                        <User size={12} /> {log.pic}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {log.description && (
                                  <div className="x-small text-muted mt-2 p-2 bg-light rounded fst-italic">
                                    {log.description}
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>

      <Card.Footer className="bg-white border-top py-3 rounded-bottom shadow-sm-top">
        <div className="d-flex justify-content-between align-items-center">
          <Button variant="outline-primary" size="sm" onClick={onPrevDay} className="px-3 d-flex align-items-center gap-1">
            <ChevronLeft size={16} /> Kemarin
          </Button>
          <Button variant="primary" size="sm" onClick={onToday} className="px-4 shadow-sm d-flex align-items-center gap-2">
            <CalendarDays size={16} /> Hari Ini
          </Button>
          <Button variant="outline-primary" size="sm" onClick={onNextDay} className="px-3 d-flex align-items-center gap-1">
            Besok <ChevronRight size={16} />
          </Button>
        </div>
      </Card.Footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
        .hover-scale-sm { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-scale-sm:hover { transform: translateX(5px); box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
        .x-small { font-size: 0.7rem; }
        .active-hour { background-color: rgba(13, 110, 253, 0.05); border-radius: 8px; }
      `}} />
    </Card>
  );
}
