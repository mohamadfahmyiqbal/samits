import React from "react";
import { Badge } from "react-bootstrap";
import { useSchedule } from "../context/ScheduleContext";

const ScheduleHeader = () => {
  const { filteredLogs } = useSchedule();
  
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="mb-0 fw-bold text-primary">
        <i className="bi bi-calendar-check-fill me-2"></i>
        Preventive Maintenance Schedule
      </h2>
      <div className="d-flex gap-2">
        <Badge bg="info" className="py-2 px-3 shadow-sm">
          <i className="bi bi-clock-history me-1"></i>
          Overdue: {filteredLogs.filter(l => l.status === 'overdue').length}
        </Badge>
        <Badge bg="secondary" className="py-2 px-3 shadow-sm">
          <i className="bi bi-list-task me-1"></i>
          Total: {filteredLogs.length}
        </Badge>
      </div>
    </div>
  );
};

export default ScheduleHeader;
