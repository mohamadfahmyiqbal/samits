// src/pages/Software.jsx
import React, { useContext, useMemo, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { MaintenanceContext } from "../context/MaintenanceContext";
import ScheduleTable from "../comp/maintenance/Tables/ScheduleTable";

export default function Software() {
  const { logs, updateLog } = useContext(MaintenanceContext);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Ambil semua logs kategori Software
  const softwareLogs = useMemo(
    () => logs.filter((l) => l.category === "Software"),
    [logs]
  );

  // Generate unique type options untuk dropdown
  const typeOptions = useMemo(() => {
    const types = softwareLogs.map((l) => l.type);
    return ["All", ...Array.from(new Set(types))];
  }, [softwareLogs]);

  // Fungsi handle update untuk ScheduleTable
  const handleUpdate = (assetId, update) => {
    updateLog(assetId, update);
  };

  return (
    <div className="p-3">
      <h2 className="mb-3">Software - Schedule Maintenance</h2>

      {/* Input search + type */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Cari noAsset, hostname, PIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {/* Kirim logs mentah + search + filterType ke ScheduleTable */}
      <ScheduleTable
        logs={softwareLogs}
        onUpdate={handleUpdate}
        search={search}
        filterType={filterType}
      />
    </div>
  );
}
