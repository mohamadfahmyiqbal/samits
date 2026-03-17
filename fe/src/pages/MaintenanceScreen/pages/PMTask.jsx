import React, { useContext, useState, useMemo, useCallback } from "react";
import { Row, Col, Form, Button, Table, Badge, Card, Alert, Spinner, Modal, ProgressBar } from "react-bootstrap";
import { MaintenanceContext } from "../../../context/MaintenanceContext";

// Constants
const taskStatus = {
  pending: { label: "Pending", color: "secondary" },
  in_progress: { label: "Dalam Proses", color: "warning" },
  completed: { label: "Selesai", color: "success" },
  skipped: { label: "Skip", color: "info" }
};

// Custom Hook untuk Task Management
const usePMTaskFilter = (tasks) => {
  const [filter, setFilter] = useState({ status: "all", category: "All", assignedTo: "" });
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      (filter.status === "all" || task.status === filter.status) &&
      (filter.category === "All" || task.category === filter.category) &&
      (!filter.assignedTo || task.assignedTo?.includes(filter.assignedTo))
    ).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }, [tasks, filter]);

  return { filteredTasks, filter, setFilter };
};

// Task Detail Modal
const TaskDetailModal = ({ task, show, onHide }) => {
  if (!task) return null;

  const progress = task.completedSubtasks / task.totalSubtasks * 100 || 0;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{task.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <strong>Asset:</strong> {task.assetName || task.assetId}<br/>
            <strong>Kategori:</strong> 
            <Badge bg="info" className="ms-1">{task.category}</Badge><br/>
            <strong>Tanggal Jatuh Tempo:</strong> {task.dueDate}<br/>
            <strong>Dipilih:</strong> {task.assignedTo}<br/>
          </Col>
          <Col md={6}>
            <strong>Progress:</strong>
            <ProgressBar now={progress} className="mt-2" label={Math.round(progress) + "%"} />
            <div className="mt-2">
              <small className="text-muted">
                {task.completedSubtasks || 0}/{task.totalSubtasks || 0} subtasks selesai
              </small>
            </div>
          </Col>
        </Row>
        <hr />
        <h6>Checklist:</h6>
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {task.checklist?.map((item, idx) => (
            <div key={idx} className="form-check mb-1">
              <input 
                className="form-check-input" 
                type="checkbox" 
                checked={item.completed}
                readOnly 
              />
              <label className="form-check-label">
                {item.description} {item.completed && <i className="bi bi-check-circle text-success ms-1"></i>}
              </label>
            </div>
          )) || <p className="text-muted">Tidak ada checklist</p>}
        </div>
        {task.notes && (
          <>
            <hr />
            <strong>Notes:</strong> {task.notes}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

// Main PM Task Component
export default function PMTask() {
  const { pmtasks = [], loading, error } = useContext(MaintenanceContext) || {};
  const { filteredTasks, filter, setFilter } = usePMTaskFilter(pmtasks);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setShowModal(true);
  }, []);

  const categoryOptions = useMemo(() => {
    return ["All", ...new Set(pmtasks.map(t => t.category))];
  }, [pmtasks]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Memuat tasks...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Row className="mb-4">
        <Col md={8}>
          <div>
            <h2 className="fw-bold mb-1">
              <i className="bi bi-checklist me-2 text-success"></i>
              PM Task / Checklist
            </h2>
            <p className="text-muted">Kelola checklist Preventive Maintenance</p>
          </div>
        </Col>
        <Col md={4} className="text-end">
          <Badge bg="success" className="py-2 px-3 me-2">
            {filteredTasks.filter(t => t.status === "completed").length} Selesai
          </Badge>
          <Badge bg="warning" className="py-2 px-3">
            {filteredTasks.filter(t => t.status === "pending" || t.status === "in_progress").length} Pending
          </Badge>
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Kategori</Form.Label>
                <Form.Select 
                  value={filter.category} 
                  onChange={e => setFilter(p => ({ ...p, category: e.target.value }))}
                >
                  {categoryOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={filter.status} 
                  onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="all">Semua</option>
                  {Object.keys(taskStatus).map(s => (
                    <option key={s} value={s}>{taskStatus[s].label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Dipilih</Form.Label>
                <Form.Control 
                  placeholder="Cari nama teknisi..."
                  value={filter.assignedTo} 
                  onChange={e => setFilter(p => ({ ...p, assignedTo: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilter({ status: "all", category: "All", assignedTo: "" })}
                className="w-100"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tasks Table */}
      <Card className="shadow-sm" style={{ maxHeight: "75vh" }}>
        <Card.Body className="p-0">
          {error && (
            <Alert variant="danger" className="m-3">
              {error}
            </Alert>
          )}
          {filteredTasks.length === 0 ? (
            <div className="p-5 text-center">
              <i className="bi bi-clipboard-x fs-1 text-muted mb-3"></i>
              <h5>Tidak ada PM Tasks</h5>
              <p className="text-muted">Belum ada checklist maintenance yang dibuat.</p>
            </div>
          ) : (
            <div style={{ height: "70vh", overflowY: "auto" }}>
              <Table striped hover responsive className="mb-0">
                <thead className="table-dark sticky-top">
                  <tr>
                    <th>Task</th>
                    <th>Asset</th>
                    <th>Progress</th>
                    <th>Tgl Jatuh Tempo</th>
                    <th>Dipilih</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => {
                    const status = taskStatus[task.status] || taskStatus.pending;
                    const progress = Math.round((task.completedSubtasks / task.totalSubtasks || 0) * 100);
                    
                    return (
                      <tr 
                        key={task.id} 
                        className="cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                      >
                        <td>
                          <strong>{task.title}</strong>
                          {task.priority === "high" && (
                            <Badge bg="danger" className="ms-2">Prioritas</Badge>
                          )}
                        </td>
                        <td>{task.assetName || task.assetId}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1 me-2">
                              <small className="fw-bold">{progress}%</small>
                            </div>
                            <div className="flex-grow-1" style={{width: 100}}>
                              <div className="progress" style={{height: 6}}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar"
                                  style={{width: progress + "%"}}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={new Date(task.dueDate) < new Date() ? "danger" : "info"}>
                            {task.dueDate}
                          </Badge>
                        </td>
                        <td>{task.assignedTo}</td>
                        <td>
                          <Badge bg={status.color}>{status.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <TaskDetailModal 
        task={selectedTask} 
        show={showModal} 
        onHide={() => setShowModal(false)} 
      />
    </div>
  );
}

