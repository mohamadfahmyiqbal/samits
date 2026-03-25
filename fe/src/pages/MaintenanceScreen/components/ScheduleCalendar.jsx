import React, { useMemo } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { ChevronLeft, ChevronRight, CalendarDays, CalendarCheck, Info } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from "date-fns";
import { id } from "date-fns/locale";

export default function ScheduleCalendar({
  currentDate,
  selectedDate,
  logsByDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onDayClick,
  onDayDoubleClick,
  getCategoryBadgeColor
}) {
  // Memoize all days in the current calendar view (including spill-over from prev/next months)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // OPTIMIZATION: Get logs for all visible days once, instead of formatting in the render loop
  const logsByVisibleDay = useMemo(() => {
    const result = {};
    calendarDays.forEach(day => {
      const dateKey = format(day, "yyyy-MM-dd");
      result[dateKey] = logsByDate[dateKey] || [];
    });
    return result;
  }, [calendarDays, logsByDate]);

  // Efficiently count total logs for current month only
  const totalLogsThisMonth = useMemo(() => {
    return calendarDays.reduce((total, day) => {
      if (isSameMonth(day, currentDate)) {
        const dateKey = format(day, "yyyy-MM-dd");
        return total + (logsByVisibleDay[dateKey]?.length || 0);
      }
      return total;
    }, 0);
  }, [calendarDays, currentDate, logsByVisibleDay]);

  const getCategoryLightColor = (category) => {
    const variant = getCategoryBadgeColor(category);
    const colors = {
      primary: 'rgba(13, 110, 253, 0.15)',
      success: 'rgba(25, 135, 84, 0.15)',
      info: 'rgba(13, 202, 240, 0.15)',
      danger: 'rgba(220, 53, 69, 0.15)',
      warning: 'rgba(255, 193, 7, 0.15)',
      secondary: 'rgba(108, 117, 125, 0.15)'
    };
    return colors[variant] || 'rgba(0,0,0,0.05)';
  };

  const getCategoryTextColor = (category) => {
    const variant = getCategoryBadgeColor(category);
    const colors = {
      primary: '#0d6efd',
      success: '#198754',
      info: '#0dcaf0',
      danger: '#dc3545',
      warning: '#997404',
      secondary: '#6c757d'
    };
    return colors[variant] || '#000';
  };

  return (
    <Card className="border-0 bg-transparent">
      <Card.Header className="bg-white d-flex align-items-center justify-content-between py-3 rounded-top border-bottom shadow-sm z-1">
        <Button variant="outline-primary" size="sm" className="rounded-circle p-1" onClick={onPrevMonth}>
          <ChevronLeft size={24} />
        </Button>
        <div className="text-center">
          <h4 className="mb-0 fw-bold text-primary d-flex align-items-center justify-content-center">
            <CalendarCheck className="me-2" size={24} />
            {format(currentDate, "MMMM yyyy", { locale: id })}
          </h4>
          <Badge bg="light" text="dark" className="border">
            {totalLogsThisMonth} Schedule Bulan Ini
          </Badge>
        </div>
        <Button variant="outline-primary" size="sm" className="rounded-circle p-1" onClick={onNextMonth}>
          <ChevronRight size={24} />
        </Button>
      </Card.Header>

      <Card.Body className="p-3 bg-white">
        {/* Days of week header */}
        <div className="calendar-grid mb-2">
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(dayName => (
            <div 
              key={dayName} 
              className="calendar-header text-center fw-bold py-2 text-muted x-small text-uppercase tracking-wider"
            >
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Actual calendar days */}
        <div className="calendar-grid gap-2">
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayLogs = logsByVisibleDay[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);
            const hasLogs = dayLogs.length > 0;

            return (
              <div
                key={idx}
                className={`calendar-day p-2 position-relative transition-all duration-200 hover-scale-xs ${!isCurrentMonth ? "bg-light opacity-50" : "bg-white"} ${isSelected ? "selected-day" : ""}`}
                style={{
                  minHeight: "110px",
                  border: isSelected ? "2px solid #0d6efd" : isDayToday ? "2px solid #ffc107" : "1px solid #edf2f7",
                  borderRadius: "12px",
                  cursor: "pointer",
                  boxShadow: isSelected ? '0 0 0 3px rgba(13, 110, 253, 0.1)' : 'none',
                  zIndex: isSelected ? 2 : 1
                }}
                onClick={() => onDayClick(day)}
                onDoubleClick={() => onDayDoubleClick(day)}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span 
                    className={`d-flex align-items-center justify-content-center fw-bold rounded-circle ${isDayToday ? "bg-warning text-white shadow-sm" : isSelected ? "bg-primary text-white" : "text-dark"}`}
                    style={{ 
                      fontSize: "0.85rem",
                      width: "28px",
                      height: "28px"
                    }}
                  >
                    {format(day, "d")}
                  </span>
                  {hasLogs && (
                    <Badge 
                      bg={isDayToday ? "warning" : "primary"} 
                      pill 
                      className="shadow-sm border border-white"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {dayLogs.length}
                    </Badge>
                  )}
                </div>

                <div className="d-flex flex-column gap-1 overflow-hidden" style={{ maxHeight: "60px" }}>
                  {dayLogs.slice(0, 3).map((log, i) => (
                    <div 
                      key={`${dateKey}-${i}`} 
                      className="text-truncate fw-medium px-2 py-1 rounded" 
                      style={{ 
                        fontSize: "0.65rem",
                        backgroundColor: getCategoryLightColor(log.category),
                        color: getCategoryTextColor(log.category),
                        maxWidth: '100%',
                        lineHeight: 1.2
                      }}
                    >
                      {log.assetName || log.itItemId}
                    </div>
                  ))}
                  {dayLogs.length > 3 && (
                    <div className="text-muted text-center x-small fst-italic mt-auto">
                      +{dayLogs.length - 3} lagi
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>

      <Card.Footer className="bg-white border-top py-3 rounded-bottom">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={onToday} className="px-3 shadow-sm d-flex align-items-center gap-2">
            <CalendarDays size={16} /> Hari Ini
          </Button>
          
          <div className="d-flex gap-2 flex-wrap">
            {['Hardware', 'Software', 'Infrastruktur', 'Cyber'].map(cat => (
              <div key={cat} className="d-flex align-items-center gap-1 x-small fw-medium bg-light px-2 py-1 rounded border">
                <span 
                  className="rounded-circle" 
                  style={{ width: '8px', height: '8px', backgroundColor: getCategoryTextColor(cat) }}
                ></span>
                {cat}
              </div>
            ))}
          </div>
          
          <div className="text-muted x-small d-none d-lg-flex align-items-center gap-1">
            <Info size={14} /> <i>Klik hari untuk melihat detail list</i>
          </div>
        </div>
      </Card.Footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .x-small { font-size: 0.7rem; }
        .hover-scale-xs:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
          z-index: 3;
        }
        .selected-day {
          background-color: #f0f7ff !important;
        }
        .tracking-wider { letter-spacing: 0.05em; }
      `}} />
    </Card>
  );
}
