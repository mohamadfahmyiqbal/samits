import React from 'react';
import { Badge, Button, Stack, Spinner, Row, Col, Pagination } from 'react-bootstrap';
import { formatDate, priorityColors } from '../utils/workOrderUtils.js';
import { statusConfig, statusLabels } from '../constants/workOrderConstants.js';

const actionButton = ({ variant, icon, label, onClick, disabled }) => (
  <Button size='sm' variant={variant} className='d-flex align-items-center gap-1' onClick={onClick} disabled={disabled}>
    <i className={`bi bi-${icon}`}></i>
    {label}
  </Button>
);

const WorkOrderCard = ({ wo, onEdit, onAssign, onStart, onComplete, onDelete }) => (
  <div className='border rounded-3 p-3 mb-3 shadow-sm bg-white'>
    <Row className='align-items-center'>
      <Col md={8}>
        <Stack gap={1}>
          <div className='d-flex align-items-center gap-2'>
            <Badge bg='secondary' pill className='text-uppercase'>
              WO-{(wo.id || wo.wo_id || 'N/A').toString().slice(-6)}
            </Badge>
            <span className='text-muted small'>{formatDate(wo.createdAt)}</span>
          </div>
          <h5 className='mb-0'>{wo.title}</h5>
          <p className='text-muted mb-0'>{wo.assetName || wo.assetId || '-'}</p>
          <Stack direction='horizontal' gap={2} className='flex-wrap'>
            <Badge bg={priorityColors[wo.priority] || 'secondary'} pill>
              {wo.priority?.toUpperCase() || 'MEDIUM'}
            </Badge>
            <Badge bg={statusConfig[wo.status]?.bg || 'secondary'} text={statusConfig[wo.status]?.text} pill>
              {statusLabels[wo.status] || wo.status}
            </Badge>
            <Badge bg='light' text='dark' pill>
              {wo.assignedToName || 'Unassigned'}
            </Badge>
          </Stack>
          <small className='text-muted'>
            {wo.description?.substring(0, 120) || 'Tidak ada detail tambahan'}
          </small>
        </Stack>
      </Col>
      <Col md={4}>
        <Stack gap={2}>
          {actionButton({
            variant: 'outline-primary',
            icon: 'pencil',
            label: 'Edit',
            onClick: () => onEdit(wo),
          })}
          {wo.status === 'open' &&
            actionButton({
              variant: 'outline-warning',
              icon: 'person-plus',
              label: 'Assign',
              onClick: () => onAssign(wo),
            })}
          {wo.status === 'assigned' &&
            actionButton({
              variant: 'outline-success',
              icon: 'play-circle',
              label: 'Start',
              onClick: () => onStart(wo),
            })}
          {wo.status === 'in_progress' &&
            actionButton({
              variant: 'outline-danger',
              icon: 'check-circle',
              label: 'Complete',
              onClick: () => onComplete(wo),
            })}
          {actionButton({
            variant: 'outline-dark',
            icon: 'trash',
            label: 'Delete',
            onClick: () => onDelete(wo.id),
          })}
        </Stack>
      </Col>
    </Row>
  </div>
);

const WorkOrderTable = ({
  workOrders,
  loading,
  onEdit,
  onAssign,
  onStart,
  onComplete,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className='text-center py-5'>
        <Spinner animation='border' variant='primary' className='mb-3' />
        <h5>Loading work order...</h5>
      </div>
    );
  }

  if (!workOrders.length) {
    return (
      <div className='text-center py-5 text-muted'>
        <i className='bi bi-clipboard-x fs-1 mb-3 opacity-50'></i>
        <h5>Tidak ada work order</h5>
        <p>Gunakan tombol "+ WO Baru" untuk membuat entri pertama.</p>
      </div>
    );
  }

  return (
    <>
      {workOrders.map((wo) => (
        <WorkOrderCard
          key={wo.id}
          wo={wo}
          onEdit={onEdit}
          onAssign={onAssign}
          onStart={onStart}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}

      {totalPages > 1 && (
        <Pagination className='justify-content-center mt-4'>
          <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={currentPage === idx + 1}
              onClick={() => onPageChange(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </>
  );
};

export default WorkOrderTable;
