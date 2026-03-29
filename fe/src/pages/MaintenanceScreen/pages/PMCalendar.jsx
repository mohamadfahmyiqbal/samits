import React, { useContext, useState, useMemo } from 'react';
import { Row, Col, Card, Button, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { MaintenanceContext } from '../../../context/MaintenanceContext';

// Date Localizer untuk react-big-calendar
const locales = {
  'id-ID': require('date-fns/locale/id'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom Event Component
const PMEvent = ({ event }) => (
  <div className='event-wrapper'>
    <div className='event-title'>{event.title}</div>
    {event.status === 'overdue' && (
      <Badge bg='danger' className='ms-1'>
        Terlambat
      </Badge>
    )}
    {event.status === 'pending' && (
      <Badge bg='warning' className='ms-1'>
        Pending
      </Badge>
    )}
    <div className='event-time small text-muted'>
      {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
);

// Main Calendar Component
export default function PMCalendar() {
  const { pmlogs = [], loading, error } = useContext(MaintenanceContext) || {};
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Transform logs ke calendar events
  const events = useMemo(() => {
    return pmlogs
      .map((log) => ({
        id: log.id,
        title: `${log.assetName || log.itItemId} - ${log.detail?.substring(0, 30)}...`,
        start: new Date(log.scheduledDate),
        end: new Date(log.scheduledEndDate || log.scheduledDate),
        allDay: !log.scheduledTime,
        resource: {
          category: log.category,
          status: log.status,
          pic: log.pic,
        },
        ...log,
      }))
      .filter((event) => event.start && !isNaN(event.start.getTime()));
  }, [pmlogs]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    // Buat task baru - redirect ke form
    alert(`Buat schedule baru untuk ${format(start, 'dd MMM yyyy HH:mm')}?`);
  };

  const EventAgenda = ({ event }) => (
    <div className='p-2 border-bottom'>
      <div className='fw-bold small'>{event.title}</div>
      <div className='small text-muted'>
        {event.category} • {event.pic} • {event.status}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className='d-flex justify-content-center p-5'>
        <Spinner animation='border' />
      </div>
    );
  }

  return (
    <div className='pm-calendar-container p-4' style={{ height: '90vh' }}>
      <Row className='mb-4'>
        <Col md={8}>
          <h2 className='fw-bold'>
            <i className='bi bi-calendar3-week me-2 text-info'></i>
            PM Calendar
          </h2>
          <p className='text-muted mb-0'>
            Lihat semua jadwal Preventive Maintenance dalam tampilan kalender
          </p>
        </Col>
        <Col md={4} className='text-end'>
          <div className='btn-group' role='group'>
            <Button variant='outline-secondary' size='sm' className='me-1'>
              Hari Ini
            </Button>
            <Button variant='outline-secondary' size='sm' className='me-1'>
              Minggu
            </Button>
            <Button variant='outline-secondary' size='sm'>
              Bulan
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant='danger' className='mb-4'>
          {error}
        </Alert>
      )}

      <Card className='shadow-sm flex-grow-1' style={{ height: '100%' }}>
        <div className='calendar-wrapper' style={{ height: '100%' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor='start'
            endAccessor='end'
            style={{ height: '100%' }}
            messages={{
              next: 'Selanjutnya',
              previous: 'Sebelumnya',
              today: 'Hari Ini',
              month: 'Bulan',
              week: 'Minggu',
              day: 'Hari',
              agenda: 'Agenda',
              date: 'Tanggal',
              time: 'Waktu',
              event: 'Event',
            }}
            eventPropGetter={(event) => ({
              className: `event-${event.status}`,
              style: {
                borderLeft: `4px solid var(--bs-${event.status === 'overdue' ? 'danger' : event.status === 'completed' ? 'success' : 'info'})`,
              },
            })}
            components={{
              event: PMEvent,
              agenda: { event: EventAgenda },
            }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
      </Card>

      {/* Event Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Detail {selectedEvent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>
                    <strong>Asset:</strong>
                  </h6>
                  <p>{selectedEvent.assetName || selectedEvent.itItemId}</p>

                  <h6>
                    <strong>Jadwal:</strong>
                  </h6>
                  <p>
                    <Badge bg='info'>{selectedEvent.start?.toLocaleDateString('id-ID')}</Badge>{' '}
                    <Badge bg='secondary'>
                      {selectedEvent.start?.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Badge>
                  </p>

                  <h6>
                    <strong>PIC:</strong>
                  </h6>
                  <p>{selectedEvent.pic}</p>
                </Col>
                <Col md={6}>
                  <h6>
                    <strong>Status:</strong>
                  </h6>
                  <Badge
                    bg={
                      selectedEvent.status === 'overdue'
                        ? 'danger'
                        : selectedEvent.status === 'completed'
                          ? 'success'
                          : 'warning'
                    }
                  >
                    {selectedEvent.status}
                  </Badge>

                  <h6>
                    <strong>Kategori:</strong>
                  </h6>
                  <Badge bg='primary'>{selectedEvent.category}</Badge>

                  <h6>
                    <strong>Detail:</strong>
                  </h6>
                  <p>{selectedEvent.detail}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary'>
            <i className='bi bi-pencil me-1'></i>Edit Schedule
          </Button>
          <Button variant='outline-danger'>
            <i className='bi bi-trash me-1'></i>Hapus
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .calendar-wrapper {
          padding: 20px;
        }
        .event-wrapper {
          font-size: 0.85em;
        }
        .event-title {
          font-weight: 600;
          margin-bottom: 2px;
        }
        .rbc-event {
          border: none !important;
          padding: 2px 5px;
          border-radius: 4px;
          overflow: hidden;
          font-size: 0.85em;
        }
        .rbc-month-view {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
