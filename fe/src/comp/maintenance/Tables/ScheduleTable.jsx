import React, { useMemo, useState, useEffect } from "react";
import { Table, Button, Badge, Form } from "react-bootstrap";
import "../../../styles/ScheduleTable.css";

import ModalSop from "../../../comp/ModalSop";
import ModalMulaiMTC from "../../../comp/ModalMulaiMTC";
import FormMaintenance from "../../../comp/FormMaintenance";
import ScheduleActions from "./ScheduleAction";

import { statusOrder, badgeColors } from "../constants/scheduleConstants";
import { formatDate, isDue, handleExportExcel } from "../utils/scheduleUtils";

export default function ScheduleTable({ logs, onUpdate, onDelete, search, filterType, filterCategory }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal SOP
  const [showSOPModal, setShowSOPModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);

  // Modal Mulai/Update Maintenance
  const [showMulaiModal, setShowMulaiModal] = useState(false);
  const [selectedLogMulai, setSelectedLogMulai] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    checklist: "",
    part: "",
    tools: "",
    notes: "",
    result: "Normal",
    startDate: "",
    endDate: "",
  });

  const itemsPerPage = 20;

  // Filter logs
  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filterType !== "All" && log.type !== filterType) return false;
      
      if (filterCategory !== "All" && log.category !== filterCategory) return false;

      if (search) {
        const s = search.toLowerCase();
        if (
          !log.itItemId.toLowerCase().includes(s) &&
          !log.type.toLowerCase().includes(s) &&
          !(log.pic && log.pic.toLowerCase().includes(s))
        )
          return false;
      }

      if (filterStatus === "Normal" && log.status !== "done") return false;
      if (filterStatus === "Abnormal" && log.status !== "abnormal") return false;

      return true;
    });
  }, [logs, search, filterType, filterCategory, filterStatus]);

  // Auto update status jika jadwal lewat
  useEffect(() => {
    filtered.forEach((log) => {
      if (log.status === "done" && log.nextMaintenance && new Date(log.nextMaintenance) <= new Date()) {
        onUpdate(log.itItemId, { status: "pending" });
      }
    });
  }, [filtered, onUpdate]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    return [...filtered].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [filtered]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Mulai/Update Maintenance
  const openMulaiModal = (log) => {
    setSelectedLogMulai(log);
    setFormData({
      type: log.type,
      checklist: log.checklist || "",
      part: log.part || "",
      tools: log.tools || "",
      notes: log.notes || "",
      result: "Normal",
      startDate: "",
      endDate: "",
    });

    if ((log.status === "pending" || log.status === "done") && isDue(log)) {
      onUpdate(log.itItemId, { status: "in_progress" });
    }

    setShowMulaiModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-3 d-flex align-items-center flex-wrap">
        <Button variant="primary" onClick={() => handleExportExcel(logs, sortedLogs)}>
          Export Excel
        </Button>

        <Form.Select
          size="sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="ms-2"
          style={{ width: "120px" }}
        >
          <option value="All">All</option>
          <option value="Normal">Normal</option>
          <option value="Abnormal">Abnormal</option>
        </Form.Select>

        {totalPages > 1 && (
          <div className="mt-2 ms-auto">
            Halaman {currentPage} dari {totalPages}
            <Button
              size="sm"
              variant="secondary"
              className="ms-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="ms-1"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Table striped bordered hover responsive className="schedule-table">
        <thead className="table-primary">
          <tr>
            <th>No</th>
            <th>No.Asset</th>
            <th>Category</th>
            <th>Type</th>
            <th>PIC</th>
            <th>Schedule Maintenance</th>
            <th>Status</th>
            <th>SOP</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {paginatedLogs.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted">
                Tidak ada jadwal maintenance yang sesuai filter.
              </td>
            </tr>
          ) : (
            paginatedLogs.map((log, index) => (
              <tr key={log.itItemId} className={log.overdue ? "table-danger" : ""}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{log.itItemId}</td>
                <td>{log.category || "-"}</td>
                <td>{log.type}</td>
                <td>{log.pic || "-"}</td>
                <td>{formatDate(log.nextMaintenance)}</td>
                <td>
                  <Badge bg={badgeColors[log.status] || "secondary"}>
                    {log.status === "pending"
                      ? "Open"
                      : log.status === "in_progress"
                      ? "In Progress"
                      : log.status === "done"
                      ? "Done"
                      : log.status === "abnormal"
                      ? "Abnormal"
                      : log.status}
                  </Badge>
                </td>
                <td>
                  {log.sop ? (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setSelectedLog(log);
                        setModalEditMode(false);
                        setShowSOPModal(true);
                      }}
                    >
                      📄 View
                    </Button>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <ScheduleActions
                    log={log}
                    openMulaiModal={openMulaiModal}
                    setSelectedLog={setSelectedLog}
                    setModalEditMode={setModalEditMode}
                    setShowSOPModal={setShowSOPModal}
                    isDue={isDue}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modals */}
      <ModalSop
        show={showSOPModal}
        onClose={() => setShowSOPModal(false)}
        sop={selectedLog?.sop}
        onSave={(newSop) => selectedLog && onUpdate(selectedLog.itItemId, { sop: newSop })}
        editMode={modalEditMode}
      />

      <ModalMulaiMTC show={showMulaiModal} log={selectedLogMulai} onClose={() => setShowMulaiModal(false)}>
        <FormMaintenance
          currentItem={selectedLogMulai}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={() => {
            if (!selectedLogMulai) return;

            const newStatus = formData.result === "Normal" ? "done" : "abnormal";
            const startDate = formData.startDate || new Date().toISOString().split("T")[0];

            onUpdate(selectedLogMulai.itItemId, {
              status: newStatus,
              nextMaintenance:
                newStatus === "done"
                  ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
                  : selectedLogMulai.nextMaintenance,
              checklist: formData.checklist,
              part: formData.part,
              tools: formData.tools,
              notes: formData.notes,
              result: formData.result,
              startDate,
              endDate: formData.endDate,
            });

            setShowMulaiModal(false);
          }}
        />
      </ModalMulaiMTC>
    </div>
  );
}
