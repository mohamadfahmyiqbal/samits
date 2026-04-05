import React from "react";
import { Card } from "react-bootstrap";

export default function ScheduleSummary({ filteredLogs }) {
  const totalSchedule = filteredLogs.length;
  const doneCount = filteredLogs.filter(l => l.status === "done").length;
  const pendingCount = filteredLogs.filter(l => l.status === "pending").length;
  const inProgressCount = filteredLogs.filter(l => l.status === "in_progress").length;

  return (
    <Card className="mt-3">
      <Card.Header>
        <h6 className="mb-0">Ringkasan Bulan Ini</h6>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <span>Total Jadwal:</span>
          <strong>{totalSchedule}</strong>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Selesai:</span>
          <strong className="text-success">{doneCount}</strong>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Pending:</span>
          <strong className="text-secondary">{pendingCount}</strong>
        </div>
        <div className="d-flex justify-content-between">
          <span>In Progress:</span>
          <strong className="text-warning">{inProgressCount}</strong>
        </div>
      </Card.Body>
    </Card>
  );
}

