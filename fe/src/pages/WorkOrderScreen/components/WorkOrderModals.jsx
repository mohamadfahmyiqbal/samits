import React from 'react';
import CreateEditModal from './WorkOrderModals/CreateEditModal.jsx';
import AssignTechnicianModal from './WorkOrderModals/AssignTechnicianModal.jsx';
import WorkOrderActionModal from './WorkOrderModals/WorkOrderActionModal.jsx';

const WorkOrderModals = ({
  showCreate,
  onCloseCreate,
  showEdit,
  editWorkOrder,
  onCloseEdit,
  onRefresh,
  technicians,
  assets,
  showAssign,
  onCloseAssign,
  selectedWorkOrder,
  showAction,
  actionMode,
  onCloseAction,
  onStartConfirm,
  onCompleteConfirm,
  onShowToast,
}) => (
  <>
    <CreateEditModal
      show={showCreate || showEdit}
      onClose={() => {
        onCloseCreate();
        onCloseEdit();
      }}
      showEdit={showEdit}
      editWorkOrder={editWorkOrder}
      onRefresh={onRefresh}
      onShowToast={onShowToast}
      assets={assets}
    />
    <AssignTechnicianModal
      show={showAssign}
      onClose={onCloseAssign}
      selectedWorkOrder={selectedWorkOrder}
      technicians={technicians}
      onShowToast={onShowToast}
      onRefresh={onRefresh}
    />
    <WorkOrderActionModal
      show={showAction}
      onClose={onCloseAction}
      selectedWorkOrder={selectedWorkOrder}
      assets={assets}
      onStartConfirm={onStartConfirm}
      onCompleteConfirm={onCompleteConfirm}
      showAction={showAction}
      actionMode={actionMode}
      onShowToast={onShowToast}
    />
  </>
);

export default WorkOrderModals;
