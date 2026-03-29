import React, { useMemo } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, CalendarX, CalendarDays } from 'lucide-react';
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isSameMonth,
  parseISO,
} from 'date-fns';
import { id } from 'date-fns/locale';

export default function ScheduleYearly({
  currentDate,
  selectedDate,
  logsByDate,
  onPrevYear,
  onNextYear,
  onToday,
  onDayClick,
  onDayDoubleClick,
  getCategoryBadgeColor,
}) {
  // Memoize months in the current year
  const months = useMemo(() => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
  }, [currentDate]);

  // OPTIMIZATION: Group logs by month once, instead of filtering in the render loop
  const logsByMonth = useMemo(() => {
    const grouped = {};
    const yearKey = format(currentDate, 'yyyy');

    Object.entries(logsByDate).forEach(([dateKey, logs]) => {
      if (dateKey.startsWith(yearKey)) {
        try {
          const date = parseISO(dateKey);
          const monthKey = format(date, 'yyyy-MM');
          if (!grouped[monthKey]) grouped[monthKey] = [];
          grouped[monthKey].push(...logs);
        } catch (e) {
          console.error('ScheduleYearly: Invalid date key', dateKey);
        }
      }
    });
    return grouped;
  }, [logsByDate, currentDate]);

  // Efficient total count
  const totalLogsThisYear = useMemo(() => {
    return Object.values(logsByMonth).reduce((acc, curr) => acc + curr.length, 0);
  }, [logsByMonth]);

  return (
    <Card className='border-0 bg-transparent'>
      <Card.Header className='bg-white d-flex align-items-center justify-content-between py-3 rounded-top border-bottom'>
        <Button
          variant='outline-primary'
          size='sm'
          className='rounded-circle p-1'
          onClick={onPrevYear}
        >
          <ChevronLeft size={24} />
        </Button>
        <div className='text-center'>
          <h4 className='mb-0 fw-bold text-primary d-flex align-items-center justify-content-center'>
            <CalendarDays className='me-2' size={24} />
            Tahun {format(currentDate, 'yyyy', { locale: id })}
          </h4>
          <Badge bg='light' text='dark' className='border'>
            {totalLogsThisYear} Schedule Terdaftar
          </Badge>
        </div>
        <Button
          variant='outline-primary'
          size='sm'
          className='rounded-circle p-1'
          onClick={onNextYear}
        >
          <ChevronRight size={24} />
        </Button>
      </Card.Header>

      <Card.Body className='p-3 bg-light/30'>
        <Row xs={1} sm={2} lg={3} xl={4} className='g-3'>
          {months.map((month) => {
            const monthKey = format(month, 'yyyy-MM');
            const monthLogs = logsByMonth[monthKey] || [];
            const hasLogs = monthLogs.length > 0;
            const isCurrentMonth = isSameMonth(month, new Date());

            return (
              <Col key={monthKey}>
                <Card
                  className={`h-100 border-0 shadow-sm transition-all duration-200 hover-lift ${isCurrentMonth ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
                  onClick={() => onDayClick(month)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Header
                    className={`d-flex justify-content-between align-items-center py-2 border-0 ${isCurrentMonth ? 'bg-primary text-white' : 'bg-white text-primary'}`}
                  >
                    <span className='fw-bold'>{format(month, 'MMMM', { locale: id })}</span>
                    {hasLogs && (
                      <Badge
                        bg={isCurrentMonth ? 'light' : 'primary'}
                        text={isCurrentMonth ? 'primary' : 'white'}
                        pill
                      >
                        {monthLogs.length}
                      </Badge>
                    )}
                  </Card.Header>
                  <Card.Body className='p-2'>
                    {hasLogs ? (
                      <div className='d-flex flex-column gap-1'>
                        {monthLogs.slice(0, 3).map((log, i) => (
                          <div
                            key={`${monthKey}-${i}`}
                            className='d-flex justify-content-between align-items-center p-1 px-2 rounded bg-light border-start border-3'
                            style={{
                              borderLeftColor: `var(--bs-${getCategoryBadgeColor(log.category)})`,
                              fontSize: '0.75rem',
                            }}
                          >
                            <span className='text-truncate fw-medium' style={{ maxWidth: '70%' }}>
                              {log.assetName || log.itItemId}
                            </span>
                            <span
                              className={`text-${getCategoryBadgeColor(log.category)} fw-bold`}
                              style={{ fontSize: '0.6rem' }}
                            >
                              ●
                            </span>
                          </div>
                        ))}
                        {monthLogs.length > 3 && (
                          <div className='text-muted text-center x-small mt-1 fst-italic'>
                            +{monthLogs.length - 3} schedule lainnya
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='text-muted text-center py-4 opacity-50'>
                        <CalendarX size={20} className='mb-1' />
                        <div style={{ fontSize: '0.7rem' }}>Kosong</div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card.Body>

      <Card.Footer className='bg-white border-top py-3 rounded-bottom'>
        <div className='d-flex justify-content-between align-items-center'>
          <Button variant='primary' size='sm' onClick={onToday} className='px-3 shadow-sm'>
            Kembali ke Hari Ini
          </Button>
          <div className='text-muted small d-none d-sm-block'>
            <i className='bi bi-info-circle me-1'></i>
            Klik kartu bulan untuk melihat detail harian
          </div>
        </div>
      </Card.Footer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hover-lift:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
        }
        .x-small { font-size: 0.7rem; }
        .ring-2 { box-shadow: 0 0 0 2px var(--bs-primary); }
      `,
        }}
      />
    </Card>
  );
}
