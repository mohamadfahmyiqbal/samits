import React from "react";
import { Card, Badge, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Pencil, Trash2, Clock, User, Tag } from "lucide-react";

export default function ScheduleList({
  selectedDate,
  selectedDateLogs,
  getCategoryBadgeColor,
  getStatusBadgeColor,
  getStatusLabel,
  onEdit,
  onDelete
}) {
  if (!selectedDate) {
    return (
      <Card className="border-0 shadow-sm h-100">
        <Card.Header className="bg-white border-bottom py-3">
          <h6 className="mb-0 fw-bold">Pilih Tanggal</h6>
        </Card.Header>
        <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-5">
          <div className="bg-light rounded-circle p-4 mb-3">
            <Clock size={48} className="text-muted opacity-50" />
          </div>
          <p className="text-muted px-4">Klik pada tanggal di kalender untuk melihat detail jadwal maintenance</p>
        </Card.Body>
      </Card>
    );
  }

  const renderTooltip = (text) => (
    <Tooltip id="button-tooltip">{text}</Tooltip>
  );

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold text-primary">
          {format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}
        </h6>
        <Badge bg="secondary" pill className="px-2">{selectedDateLogs.length} Jadwal</Badge>
      </Card.Header>
      <Card.Body className="p-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
        {selectedDateLogs.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted small">Tidak ada jadwal maintenance pada tanggal ini</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {selectedDateLogs.map((log, idx) => (
              <Card key={log.id || log.itItemId || idx} className="border-0 shadow-sm hover-border transition-all">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold text-dark">{log.itItemId}</span>
                        <Badge bg={getCategoryBadgeColor(log.category)} className="x-small">
                          {log.category}
                        </Badge>
                      </div>
                      <div className="d-flex align-items-center gap-2 x-small text-muted mb-2">
                        <Tag size={12} /> {log.type}
                        <span className="mx-1">|</span>
                        <Badge bg={getStatusBadgeColor(log.status)} style={{ fontSize: '0.65rem' }}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-1">
                      <OverlayTrigger placement="top" overlay={renderTooltip("Edit Jadwal")}>
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="p-1 text-primary hover-bg-primary"
                          onClick={() => onEdit?.(log)}
                        >
                          <Pencil size={14} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={renderTooltip("Hapus Jadwal")}>
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="p-1 text-danger hover-bg-danger"
                          onClick={() => onDelete?.(log.id || log.itItemId)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </div>

{(log.notes || log.description) && (
                    <div className="bg-light p-2 rounded mb-2 x-small text-muted fst-italic">
                      "{log.notes || log.description}"
                    </div>
                  )}


                  {log.pic && (
                    <div className="d-flex align-items-center gap-1 x-small text-primary fw-medium">
                      <User size={12} />
                      <span>PIC: {log.pic}</span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Card.Body>
      <style dangerouslySetInnerHTML={{ __html: `
        .x-small { font-size: 0.7rem; }
        .hover-border { border: 1px solid transparent !important; border-left: 3px solid #0d6efd !important; }
        .hover-border:hover { border: 1px solid #dee2e6 !important; border-left: 3px solid #0d6efd !important; transform: translateX(2px); }
        .hover-bg-primary:hover { background-color: #e7f1ff !important; }
        .hover-bg-danger:hover { background-color: #f8d7da !important; }
        .hover-bg-warning:hover { background-color: #fff3cd !important; }
        .transition-all { transition: all 0.2s ease; }
      `}} />
    </Card>
  );
}
