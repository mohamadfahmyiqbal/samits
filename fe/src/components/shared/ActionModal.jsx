import React, { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const ActionModal = ({ 
  title, 
  visible, 
  onCancel, 
  onSubmit, 
  loading, 
  children,
  okText = "Save",
  cancelText = "Cancel",
  width = 800
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" icon={<CloseCircleOutlined />} onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          icon={<SaveOutlined />}
          onClick={onSubmit}
        >
          {okText}
        </Button>
      ]}
      width={width}
    >
      {children}
    </Modal>
  );
};

export default ActionModal;
