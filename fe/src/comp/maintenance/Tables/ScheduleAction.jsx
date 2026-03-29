import { Button } from "react-bootstrap";

export default function ScheduleActions({
  log,
  openMulaiModal,
  setSelectedLog,
  setModalEditMode,
  setShowSOPModal,
  isDue,
  onUpdate,
  onDelete,
}) {
  const due = isDue(log);

  const handleCreateWO = async () => {
    try {
      const woData = {
        title: `PM - ${log.itItemId}`,
        description: `Preventive Maintenance Schedule for ${log.itItemId}`,
        assetId: log.itItemId,
        priority: due ? 'medium' : 'low',
        category: 'preventive',
        scheduledDate: log.nextMaintenance,
        sop: log.sop || ''
      };

      onUpdate(log.itItemId, { ...log, workOrderId: 'TEMP-' + Date.now() });
      alert('✅ Work Order berhasil dibuat (TEMP): WO-TEMP-' + log.itItemId.slice(-6));
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  return (
    <>
      {/* Buat WorkOrder: pending + due */}
      {log.status === "pending" && due && (
        <Button
          size="sm"
          variant="primary" 
          className="me-1"
          onClick={handleCreateWO}
          title="Convert to Work Order"
        >
          <i className="bi bi-list-task"></i> WO
        </Button>
      )}
      
      {/* Mulai Maintenance: hanya pending atau done yang sudah waktunya */}
      {(log.status === "pending" || log.status === "done") && (
        <Button
          size="sm"
          variant="success"
          className="me-1"
          onClick={() => openMulaiModal(log)}
          disabled={!due}
          title={!due ? "Jadwal maintenance belum waktunya" : ""}
        >
          Mulai
        </Button>
      )}

      {/* Update Maintenance: hanya in_progress atau abnormal */}
      {(log.status === "in_progress" || log.status === "abnormal") && (
        <Button
          size="sm"
          variant="info"
          className="me-1"
          onClick={() => openMulaiModal(log)}
        >
          Update
        </Button>
      )}

      {/* Update SOP */}
      <Button
        size="sm"
        variant="warning"
        className="me-1"
        onClick={() => {
          setSelectedLog(log);
          setModalEditMode(true);
          setShowSOPModal(true);
        }}
      >
        SOP
      </Button>

      {/* DELETE - hanya pending */}
      {log.status === 'pending' && (
        <Button
          size="sm"
          variant="danger"
          onClick={async () => {
            if (window.confirm(`Hapus schedule ${log.itItemId} (${log.type})?`)) {
              try {
                await onDelete(log.id);
              } catch (err) {
                alert('❌ Gagal hapus: ' + err.message);
              }
            }
          }}
          title="Hapus Schedule (Pending only)"
        >
          <i className="bi bi-trash"></i>
        </Button>
      )}
    </>
  );
}
