
import React from "react";
import { Modal, Button, Tabs, Tab, Table } from "react-bootstrap";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID");
};

export default function ModalAssetHistory({
  show,
  onHide,
  asset,
  auditLogs = [],
  statusHistory = [] }) {
  if (!asset) return null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Riwayat Asset - {asset.noAsset || "-"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="audit" className="mb-3">
          <Tab eventKey="audit" title="Audit Log">
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Event</th>
                  <th>Actor</th>
                  <th>Module</th>
                  <th>Request ID</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Belum ada data audit log.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((row, idx) => (
                    <tr key={row.audit_id || idx}>
                      <td>{formatDateTime(row.event_at)}</td>
                      <td>
                        <Badge bg="secondary">{row.event_type || "-"}</Badge>
                      </td>
                      <td>{row.actor_name || row.actor_nik || "-"}</td>
                      <td>{row.source_module || "-"}</td>
                      <td>{row.request_id || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="status" title="Status History">
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Status Lama</th>
                  <th>Status Baru</th>
                  <th>Changed By</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {statusHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Belum ada data status history.
                    </td>
                  </tr>
                ) : (
                  statusHistory.map((row, idx) => (
                    <tr key={row.history_id || idx}>
                      <td>{formatDateTime(row.changed_at)}</td>
                      <td>{row.old_status || "-"}</td>
                      <td>
                        <Badge bg={row.new_status === "Active" ? "success" : "secondary"}>
                          {row.new_status || "-"}
                        </Badge>
                      </td>
                      <td>{row.changed_by_name || row.changed_by_nik || "-"}</td>
                      <td>{row.reason || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
