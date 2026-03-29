
import React, { useContext, useState } from "react";
import { Table, ButtonGroup, Button } from "react-bootstrap";
import { MaintenanceContext } from "../context/MaintenanceContext";
import { format } from "date-fns";

export default function Summary() {
  const { getFilteredLogs } = useContext(MaintenanceContext);
  const [period, setPeriod] = useState("daily");
  const [filter, setFilter] = useState("all");

  const filteredLogs = getFilteredLogs(period, filter);

  const statusColor = {
    done: "success",
    abnormal: "danger" };

  return (
    <div className="summary-page p-3">
      <h2>Summary Maintenance</h2>

      <div className="mb-3 d-flex gap-2">
        <ButtonGroup>
          <Button variant={period === "daily" ? "primary" : "outline-primary"} onClick={() => setPeriod("daily")}>Daily</Button>
          <Button variant={period === "monthly" ? "primary" : "outline-primary"} onClick={() => setPeriod("monthly")}>Monthly</Button>
          <Button variant={period === "yearly" ? "primary" : "outline-primary"} onClick={() => setPeriod("yearly")}>Yearly</Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button variant={filter === "all" ? "primary" : "outline-primary"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "normal" ? "primary" : "outline-primary"} onClick={() => setFilter("normal")}>Normal</Button>
          <Button variant={filter === "abnormal" ? "primary" : "outline-primary"} onClick={() => setFilter("abnormal")}>Abnormal</Button>
        </ButtonGroup>
      </div>

      <Table bordered hover responsive>
        <thead className="table-primary">
          <tr>
            <th>No</th>
            <th>Asset</th>
            <th>Category</th>
            <th>Type</th>
            <th>PIC</th>
            <th>Status</th>
            <th>Start</th>
            <th>End</th>
            <th>Checklist</th>
            <th>Part</th>
            <th>Tools</th>
            <th>Notes</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center">Tidak ada log maintenance</td>
            </tr>
          ) : (
            filteredLogs.map((log, index) => (
              <tr key={index} className={log.result === "Abnormal" ? "table-danger" : ""}>
                <td>{index + 1}</td>
                <td>{log.assetId}</td>
                <td>{log.category}</td>
                <td>{log.type}</td>
                <td>{log.pic}</td>
                <td>
                  <Badge bg={statusColor[log.result === "Abnormal" ? "abnormal" : "done"]}>
                    {log.result}
                  </Badge>
                </td>
                <td>{log.startDate ? format(new Date(log.startDate), "yyyy-MM-dd") : "-"}</td>
                <td>{log.endDate ? format(new Date(log.endDate), "yyyy-MM-dd") : "-"}</td>
                <td>{log.checklist || "-"}</td>
                <td>{log.part || "-"}</td>
                <td>{log.tools || "-"}</td>
                <td>{log.notes || "-"}</td>
                <td>{log.result || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
