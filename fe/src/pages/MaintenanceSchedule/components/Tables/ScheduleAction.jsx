import { Button } from 'react-bootstrap';

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
      onUpdate(log.itItemId, { ...log, workOrderId: 'TEMP-' + Date.now() });
      alert('✅ Work Order berhasil dibuat (TEMP): WO-TEMP-' + log.itItemId.slice(-6));
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };
  return (
    <>
      {log.status === 'pending' && due && (
        <Button size='sm' variant='primary' className='me-1' onClick={handleCreateWO}>
          <i className='bi bi-list-task'></i> WO
        </Button>
      )}
      {(log.status === 'pending' || log.status === 'done') && (
        <Button size='sm' variant='success' className='me-1' onClick={() => openMulaiModal(log)} disabled={!due}>
          Mulai
        </Button>
      )}
      {(log.status === 'in_progress' || log.status === 'abnormal') && (
        <Button size='sm' variant='info' className='me-1' onClick={() => openMulaiModal(log)}>
          Update
        </Button>
      )}
      <Button
        size='sm'
        variant='warning'
        className='me-1'
        onClick={() => {
          setSelectedLog(log);
          setModalEditMode(true);
          setShowSOPModal(true);
        }}
      >
        SOP
      </Button>
      {log.status === 'pending' && (
        <Button
          size='sm'
          variant='danger'
          onClick={async () => {
            if (window.confirm(`Hapus schedule ${log.itItemId} (${log.type})?`)) {
              try {
                await onDelete(log.id);
              } catch (err) {
                alert('❌ Gagal hapus: ' + err.message);
              }
            }
          }}
        >
          <i className='bi bi-trash'></i>
        </Button>
      )}
    </>
  );
}
