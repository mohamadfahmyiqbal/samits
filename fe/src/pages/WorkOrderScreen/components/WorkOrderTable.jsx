import React from 'react';
import { Table, Button, Dropdown, Badge } from 'react-bootstrap';
import { formatDate, priorityColors } from '../utils/workOrderUtils.js';
import { statusConfig, statusLabels } from '../constants/workOrderConstants.js';

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
        <div className='spinner-border text-primary mb-3' style={{ width: '3rem', height: '3rem' }}>
          <span className='visually-hidden'>Loading...</span>
        </div>
        <h5>Loading Work Orders...</h5>
      </div>
    );
  }

  if (!workOrders || workOrders.length === 0) {
    return (
      <div className='text-center py-5 text-muted'>
        <i className='bi bi-clipboard-x fs-1 mb-3 opacity-50'></i>
        <h5>Tidak ada Work Order</h5>
        <p className='text-muted'>Buat Work Order pertama Anda</p>
      </div>
    );
  }

  return (
    <div>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h6 className='mb-0'>
          <i className='bi bi-list-task me-2'></i>
          {workOrders.length} Work Order
        </h6>
        {totalPages > 1 && (
          <div className='btn-group'>
            <Button
              size='sm'
              variant='outline-secondary'
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              size='sm'
              variant='outline-secondary'
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Table responsive hover className='workorder-table shadow-sm'>
        <thead className='table-dark'>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Asset</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Technician</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((wo) => (
            <tr key={wo.id} className={wo.priority === 'high' ? 'table-warning' : ''}>
              <td>
                <strong>WO-{(wo.id || wo.wo_id || 'N/A').toString().slice(-6)}</strong>
              </td>
              <td>{wo.title}</td>
              <td>{wo.assetId || wo.assetName}</td>
              <td>
                <Badge bg={priorityColors[wo.priority] || 'secondary'}>
                  {wo.priority?.toUpperCase()}
                </Badge>
              </td>
              <td>
                <Badge bg={statusConfig[wo.status]?.bg || 'secondary'} className='px-2 py-2'>
                  {statusLabels[wo.status] || wo.status}
                </Badge>
              </td>
              <td>{wo.assignedToName || '-'}</td>
              <td>{formatDate(wo.createdAt)}</td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant='light' size='sm' className='shadow-none border'>
                    <i className='bi bi-three-dots-vertical'></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => onEdit(wo)}>
                      <i className='bi bi-pencil me-2'></i>Edit
                    </Dropdown.Item>
                    {wo.status === 'open' && (
                      <Dropdown.Item onClick={() => onAssign(wo)}>
                        <i className='bi bi-person-plus me-2'></i>Assign
                      </Dropdown.Item>
                    )}
                    {wo.status === 'assigned' && (
                      <Dropdown.Item onClick={() => onStart(wo)}>
                        <i className='bi bi-play-circle me-2'></i>Start
                      </Dropdown.Item>
                    )}
                    {wo.status === 'in_progress' && (
                      <Dropdown.Item onClick={() => onComplete(wo)}>
                        <i className='bi bi-check-circle me-2'></i>Complete
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => onDelete(wo.id)} className='text-danger'>
                      <i className='bi bi-trash me-2'></i>Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default WorkOrderTable;
