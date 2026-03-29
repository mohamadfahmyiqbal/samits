import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  message,
  Modal,
  Alert,
  Tag,
  Steps,
  Progress,
  Upload,
} from 'antd';
import {
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  WarningOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import './CorrectiveAction.css';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

export default function CorrectiveAction() {
  const [form] = Form.useForm();
  const [correctiveActionData, setCorrectiveActionData] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const correctiveActionColumns = [
    {
      title: 'Action ID',
      dataIndex: 'action_id',
      key: 'action_id',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: 'Job Request',
      dataIndex: 'job_request_id',
      key: 'job_request_id',
      render: (text) => <Tag color='green'>{text}</Tag>,
    },
    {
      title: 'Aset',
      dataIndex: 'asset_name',
      key: 'asset_name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.asset_tag}</div>
        </div>
      ),
    },
    {
      title: 'Tindakan',
      dataIndex: 'action_type',
      key: 'action_type',
      render: (type) => {
        const colorMap = {
          repair: 'blue',
          replace: 'orange',
          configure: 'green',
          troubleshoot: 'purple',
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Teknisi',
      dataIndex: 'technician_name',
      key: 'technician_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          planned: 'orange',
          in_progress: 'blue',
          completed: 'green',
          failed: 'red',
          cancelled: 'default',
        };
        const iconMap = {
          planned: <ClockCircleOutlined />,
          in_progress: <PlayCircleOutlined />,
          completed: <CheckCircleOutlined />,
          failed: <WarningOutlined />,
          cancelled: <StopOutlined />,
        };
        return (
          <Tag color={colorMap[status]} icon={iconMap[status]}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress
          percent={progress}
          size='small'
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_date',
      key: 'created_date',
      render: (date) => new Date(date).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <div className='action-buttons'>
          <Button size='small' icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Detail
          </Button>
          {record.status === 'in_progress' && (
            <Button
              type='primary'
              size='small'
              icon={<CheckCircleOutlined />}
              onClick={() => handleCompleteAction(record)}
            >
              Selesai
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    // Mock corrective action data
    setCorrectiveActionData([
      {
        id: 1,
        action_id: 'CA-001',
        job_request_id: 'JR-001',
        asset_name: 'Laptop Dell XPS 15',
        asset_tag: 'LT-001',
        action_type: 'repair',
        technician_name: 'Tech John',
        status: 'in_progress',
        progress: 75,
        created_date: '2024-03-25',
        estimated_completion: '2024-03-26',
        actual_completion: null,
        description: 'Perbaikan power supply laptop yang mati',
        steps: [
          {
            step: 'Diagnosis',
            status: 'completed',
            completed_date: '2024-03-25',
            notes: 'Power supply rusak',
          },
          {
            step: 'Replacement',
            status: 'in_progress',
            completed_date: null,
            notes: 'Sedang mengganti PSU',
          },
          {
            step: 'Testing',
            status: 'pending',
            completed_date: null,
            notes: 'Menunggu replacement selesai',
          },
        ],
        parts_used: [{ name: 'Power Supply Dell XPS', quantity: 1, cost: 1500000 }],
        labor_hours: 3,
      },
      {
        id: 2,
        action_id: 'CA-002',
        job_request_id: 'JR-002',
        asset_name: 'Server HP ProLiant',
        asset_tag: 'SRV-001',
        action_type: 'replace',
        technician_name: 'Tech Jane',
        status: 'completed',
        progress: 100,
        created_date: '2024-03-24',
        estimated_completion: '2024-03-25',
        actual_completion: '2024-03-25',
        description: 'Penggantian fan server yang overheating',
        steps: [
          {
            step: 'Diagnosis',
            status: 'completed',
            completed_date: '2024-03-24',
            notes: 'Fan rusak, penyebab overheating',
          },
          {
            step: 'Replacement',
            status: 'completed',
            completed_date: '2024-03-25',
            notes: 'Fan berhasil diganti',
          },
          {
            step: 'Testing',
            status: 'completed',
            completed_date: '2024-03-25',
            notes: 'Temperature normal',
          },
        ],
        parts_used: [{ name: 'Cooling Fan HP ProLiant', quantity: 2, cost: 2500000 }],
        labor_hours: 4,
      },
      {
        id: 3,
        action_id: 'CA-003',
        job_request_id: 'JR-003',
        asset_name: 'Monitor LG 27 inch',
        asset_tag: 'MN-001',
        action_type: 'troubleshoot',
        technician_name: 'Tech Mike',
        status: 'planned',
        progress: 25,
        created_date: '2024-03-23',
        estimated_completion: '2024-03-27',
        actual_completion: null,
        description: 'Troubleshooting monitor yang berkedip',
        steps: [
          {
            step: 'Diagnosis',
            status: 'completed',
            completed_date: '2024-03-23',
            notes: 'Kemungkinan kabel VGA loose',
          },
          {
            step: 'Cable Check',
            status: 'pending',
            completed_date: null,
            notes: 'Periksa kabel VGA',
          },
          {
            step: 'Testing',
            status: 'pending',
            completed_date: null,
            notes: 'Test dengan kabel baru',
          },
        ],
        parts_used: [],
        labor_hours: 2,
      },
    ]);
  }, []);

  const handleViewDetail = (action) => {
    setSelectedAction(action);
    setShowDetailModal(true);
  };

  const handleCompleteAction = (action) => {
    setSelectedAction(action);
    setShowResultModal(true);
    form.setFieldsValue({
      completion_notes: '',
      final_status: 'completed',
      parts_cost: action.parts_used.reduce((total, part) => total + part.cost * part.quantity, 0),
      actual_labor_hours: action.labor_hours,
    });
  };

  const handleSubmitAction = async (values) => {
    try {
      setLoading(true);

      const actionData = {
        action_id: `CA-${String(correctiveActionData.length + 1).padStart(3, '0')}`,
        ...values,
        created_date: new Date().toISOString().split('T')[0],
        created_by: 'current_user', // Replace with actual user
        status: 'planned',
        progress: 0,
      };

      // API call to save corrective action

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      message.success('Corrective action berhasil dibuat!');
      setShowCreateModal(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Gagal membuat corrective action');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (values) => {
    try {
      setLoading(true);

      const resultData = {
        action_id: selectedAction.action_id,
        ...values,
        actual_completion: new Date().toISOString().split('T')[0],
        completed_by: 'current_user', // Replace with actual user
        status: values.final_status,
        progress: 100,
      };

      // API call to complete corrective action

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update local state
      setCorrectiveActionData((prev) =>
        prev.map((item) =>
          item.id === selectedAction.id
            ? {
                ...item,
                status: values.final_status,
                progress: 100,
                actual_completion: resultData.actual_completion,
                completion_notes: values.completion_notes,
              }
            : item
        )
      );

      message.success('Corrective action berhasil diselesaikan!');
      setShowResultModal(false);
      setSelectedAction(null);
      form.resetFields();
    } catch (error) {
      message.error('Gagal menyelesaikan corrective action');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  const getActionSteps = (steps) => {
    return steps.map((step, index) => ({
      title: step.step,
      description: step.status === 'completed' ? step.completed_date : 'Pending',
      status:
        step.status === 'completed' ? 'finish' : step.status === 'in_progress' ? 'process' : 'wait',
      icon:
        step.status === 'completed' ? (
          <CheckCircleOutlined />
        ) : step.status === 'in_progress' ? (
          <PlayCircleOutlined />
        ) : (
          <ClockCircleOutlined />
        ),
    }));
  };

  const getActionStats = () => {
    const total = correctiveActionData.length;
    const inProgress = correctiveActionData.filter((a) => a.status === 'in_progress').length;
    const completed = correctiveActionData.filter((a) => a.status === 'completed').length;
    const planned = correctiveActionData.filter((a) => a.status === 'planned').length;

    return { total, inProgress, completed, planned };
  };

  const stats = getActionStats();

  return (
    <div className='corrective-action'>
      <div className='page-header'>
        <h1>Corrective Action Workflow</h1>
        <p>Kelola tindakan korektif untuk perbaikan aset</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <div className='stat-card'>
              <div className='stat-icon total'>
                <ToolOutlined />
              </div>
              <div className='stat-content'>
                <h3>{stats.total}</h3>
                <p>Total Actions</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='stat-card progress'>
              <PlayCircleOutlined />
              <div className='stat-content'>
                <h3>{stats.inProgress}</h3>
                <p>In Progress</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='stat-card completed'>
              <CheckCircleOutlined />
              <div className='stat-content'>
                <h3>{stats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className='stat-card planned'>
              <ClockCircleOutlined />
              <div className='stat-content'>
                <h3>{stats.planned}</h3>
                <p>Planned</p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div className='card-header'>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
            Buat Corrective Action
          </Button>
        </div>

        <Table
          columns={correctiveActionColumns}
          dataSource={correctiveActionData}
          rowKey='id'
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title='Buat Corrective Action'
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmitAction}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='job_request_id'
                label='Job Request ID'
                rules={[{ required: true, message: 'Masukkan Job Request ID!' }]}
              >
                <Input placeholder='Contoh: JR-001' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='action_type'
                label='Tipe Tindakan'
                rules={[{ required: true, message: 'Pilih tipe tindakan!' }]}
              >
                <Select placeholder='Pilih tipe'>
                  <Option value='repair'>Repair</Option>
                  <Option value='replace'>Replace</Option>
                  <Option value='configure'>Configure</Option>
                  <Option value='troubleshoot'>Troubleshoot</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='asset_name'
                label='Nama Aset'
                rules={[{ required: true, message: 'Masukkan nama aset!' }]}
              >
                <Input placeholder='Masukkan nama aset' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='technician_name'
                label='Teknisi'
                rules={[{ required: true, message: 'Masukkan nama teknisi!' }]}
              >
                <Input placeholder='Masukkan nama teknisi' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='description'
            label='Deskripsi Tindakan'
            rules={[{ required: true, message: 'Masukkan deskripsi!' }]}
          >
            <TextArea rows={4} placeholder='Deskripsikan tindakan yang akan dilakukan...' />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='estimated_completion'
                label='Estimasi Selesai'
                rules={[{ required: true, message: 'Pilih tanggal estimasi!' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder='Pilih tanggal' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='labor_hours'
                label='Estimasi Jam Kerja'
                rules={[{ required: true, message: 'Masukkan estimasi jam!' }]}
              >
                <Input type='number' placeholder='Contoh: 4' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='attachments' label='Lampiran (Opsional)'>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Lampiran</Button>
            </Upload>
            <small>Format: PDF, JPG, PNG (Max: 5MB)</small>
          </Form.Item>

          <Form.Item>
            <div className='form-actions'>
              <Button onClick={() => setShowCreateModal(false)}>Batal</Button>
              <Button type='primary' htmlType='submit' loading={loading}>
                Buat Action
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title='Detail Corrective Action'
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key='close' onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>,
        ]}
        width={900}
      >
        {selectedAction && (
          <div className='action-detail'>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Informasi Action</h4>
                <p>
                  <strong>Action ID:</strong> {selectedAction.action_id}
                </p>
                <p>
                  <strong>Job Request:</strong> {selectedAction.job_request_id}
                </p>
                <p>
                  <strong>Tipe:</strong> <Tag color='blue'>{selectedAction.action_type}</Tag>
                </p>
                <p>
                  <strong>Teknisi:</strong> {selectedAction.technician_name}
                </p>
                <p>
                  <strong>Status:</strong> <Tag color='green'>{selectedAction.status}</Tag>
                </p>
              </Col>
              <Col span={12}>
                <h4>Informasi Aset</h4>
                <p>
                  <strong>Nama Aset:</strong> {selectedAction.asset_name}
                </p>
                <p>
                  <strong>Asset Tag:</strong> {selectedAction.asset_tag}
                </p>
                <p>
                  <strong>Progress:</strong>
                </p>
                <Progress percent={selectedAction.progress} />
              </Col>
            </Row>

            <Divider />

            <div>
              <h4>Deskripsi</h4>
              <p>{selectedAction.description}</p>
            </div>

            <Divider />

            <div>
              <h4>Progress Steps</h4>
              <Steps
                current={selectedAction.steps.findIndex((s) => s.status === 'in_progress')}
                items={getActionSteps(selectedAction.steps)}
                size='small'
              />

              <div className='steps-timeline'>
                <Timeline>
                  {selectedAction.steps.map((step, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        step.status === 'completed'
                          ? 'green'
                          : step.status === 'in_progress'
                            ? 'blue'
                            : 'gray'
                      }
                      dot={
                        step.status === 'completed' ? (
                          <CheckCircleOutlined />
                        ) : step.status === 'in_progress' ? (
                          <PlayCircleOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                    >
                      <div className='timeline-content'>
                        <div className='timeline-header'>
                          <strong>{step.step}</strong>
                          <Tag
                            color={
                              step.status === 'completed'
                                ? 'green'
                                : step.status === 'in_progress'
                                  ? 'blue'
                                  : 'orange'
                            }
                          >
                            {step.status}
                          </Tag>
                        </div>
                        <p>{step.notes}</p>
                        {step.completed_date && (
                          <p>
                            <small>Tanggal: {step.completed_date}</small>
                          </p>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </div>

            {selectedAction.parts_used.length > 0 && (
              <>
                <Divider />
                <div>
                  <h4>Parts yang Digunakan</h4>
                  <table className='parts-table'>
                    <thead>
                      <tr>
                        <th>Nama Part</th>
                        <th>Quantity</th>
                        <th>Cost</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAction.parts_used.map((part, index) => (
                        <tr key={index}>
                          <td>{part.name}</td>
                          <td>{part.quantity}</td>
                          <td>Rp {part.cost.toLocaleString('id-ID')}</td>
                          <td>Rp {(part.cost * part.quantity).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Result Modal */}
      <Modal
        title='Selesaikan Corrective Action'
        open={showResultModal}
        onCancel={() => {
          setShowResultModal(false);
          setSelectedAction(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedAction && (
          <Form form={form} layout='vertical' onFinish={handleSubmitResult}>
            <Alert
              message={`Menyelesaikan: ${selectedAction.action_id}`}
              description={`${selectedAction.asset_name} - ${selectedAction.description}`}
              type='info'
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name='final_status'
              label='Status Akhir'
              rules={[{ required: true, message: 'Pilih status akhir!' }]}
            >
              <Select placeholder='Pilih status'>
                <Option value='completed'>Completed</Option>
                <Option value='failed'>Failed</Option>
                <Option value='cancelled'>Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name='completion_notes'
              label='Catatan Penyelesaian'
              rules={[{ required: true, message: 'Masukkan catatan!' }]}
            >
              <TextArea rows={4} placeholder='Deskripsikan hasil penyelesaian...' />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='actual_labor_hours'
                  label='Aktual Jam Kerja'
                  rules={[{ required: true, message: 'Masukkan aktual jam kerja!' }]}
                >
                  <Input type='number' placeholder='Contoh: 3.5' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='parts_cost' label='Total Cost Parts'>
                  <Input placeholder='Total cost parts' />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name='attachments' label='Lampiran Hasil'>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Lampiran</Button>
              </Upload>
              <small>Format: PDF, JPG, PNG (Max: 5MB)</small>
            </Form.Item>

            <Form.Item>
              <div className='form-actions'>
                <Button onClick={() => setShowResultModal(false)}>Batal</Button>
                <Button type='primary' htmlType='submit' loading={loading}>
                  Selesaikan
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
