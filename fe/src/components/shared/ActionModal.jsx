import React from 'react';
import { Modal, Button } from 'antd';
import {
  SaveOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

const ActionModal = ({
  title,
  visible,
  onCancel,
  onSubmit,
  loading = false,
  children,
  okText = 'Save',
  cancelText = 'Cancel',
  width = 800,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      destroyOnClose
      maskClosable={!loading}
      width={width}
      footer={[
        <Button
          key="cancel"
          icon={<CloseCircleOutlined />}
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          icon={<SaveOutlined />}
          onClick={onSubmit}
        >
          {okText}
        </Button>,
      ]}
    >
      {children}
    </Modal>
  );
};

export default React.memo(ActionModal);