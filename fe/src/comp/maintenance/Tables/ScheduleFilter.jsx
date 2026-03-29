
import React from "react";
import { Form } from "react-bootstrap";

export default function ScheduleFilter({ filterStatus, setFilterStatus }) {
  return (
    <Form as="form".Select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
    >
      <option value="All">All</option>
      <option value="Normal">Normal</option>
      <option value="Abnormal">Abnormal</option>
    </Form.Select>
  );
}
