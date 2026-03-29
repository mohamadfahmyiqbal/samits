import React, { useState, useEffect } from 'react';
import { Form, Card, Row, Col, Button, Tag, Space, message, Input, Select, Steps, Upload, Progress } from 'antd';
import { 
  UploadOutlined,
  ArrowLeftOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResultAbnormality.css';

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

export default function ResultAbnormality() {
  const navigate = useNavigate();
  const location = useLocation();
  const { request } = location.state || {};

  const [resultData, setResultData] = useState({
    job_request_id: '',
    job_request_code: '',
    work_description: '',
    findings: '',
    recommendations: '',
    work_status: 'in_progress',
    completion_percentage: 0,
    start_time: null,
    end_time: null,
    technician: '',
    parts_used: [],
    labor_hours: 0,
    next_maintenance_date: null,
    attachments: [],
    created_date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [partsList, setPartsList] = useState([]);
  const [currentPart, setCurrentPart] = useState({
    part_name: '',
    quantity: 0,
    unit_price: 0,
    total_price: 0
  });

  useEffect(() => {
    if (request) {
      setResultData(prev => ({
        ...prev,
        job_request_id: request.id,
        job_request_code: request.request_code,
        technician: 'Technical Team',
        start_time: new Date().toISOString().split('T')[0]
      }));
      form.setFieldsValue({
        job_request_code: request.request_code,
        title: request.title,
        requester: request.requester,
        asset_affected: request.asset_affected,
        location: request.location
      });
    }
  }, [request, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const finalResult = {
        ...resultData,
        ...values,
        parts_used: partsList,
        labor_hours: calculateLaborHours(),
        completion_percentage: resultData.work_status === 'completed' ? 100 : resultData.completion_percentage
      };

      // Navigate to approval4 with result data
      navigate('/approval4', { 
        state: { 
          request: request,
          result: finalResult 
        } 
      });
      
      message.success('Abnormality result berhasil disubmit');
    } catch (error) {
      message.error('Gagal submit result');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkStatusChange = (status) => {
    const completionPercentage = status === 'completed' ? 100 : 
                               status === 'in_progress' ? 50 : 0;
    
    setResultData(prev => ({
      ...prev,
      work_status: status,
      completion_percentage: completionPercentage
    }));
  };

  const calculateLaborHours = () => {
    if (resultData.start_time && resultData.end_time) {
      const start = new Date(`${resultData.start_time}`);
      const end = new Date(`${resultData.end_time}`);
      const diffHours = (end - start) / (1000 * 60 * 60);
      return Math.max(0, diffHours);
    }
    return 0;
  };

  const addPart = () => {
    if (currentPart.part_name && currentPart.quantity > 0) {
      const totalPrice = currentPart.quantity * currentPart.unit_price;
      const newPart = {
        ...currentPart,
        total_price: totalPrice,
        id: Date.now()
      };
      setPartsList(prev => [...prev, newPart]);
      setCurrentPart({
        part_name: '',
        quantity: 0,
        unit_price: 0,
        total_price: 0
      });
    }
  };

  const removePart = (partId) => {
    setPartsList(prev => prev.filter(part => part.id !== partId));
  };

  const handleUpload = (file) => {

    return false; // Prevent auto upload
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const currentStep = resultData.work_status === 'completed' ? 3 : 
                     resultData.work_status === 'in_progress' ? 2 : 1;

  const totalPartsCost = partsList.reduce((sum, part) => sum + part.total_price, 0);
  const laborCost = calculateLaborHours() * 50000; // Rp 50,000 per hour
  const totalCost = totalPartsCost + laborCost;

  return (
    <div className="result-abnormality">
      <div className="page-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          Back to Job Request
        </Button>
        <h1>Abnormality Work Result</h1>
        <p>Document hasil pekerjaan abnormality maintenance</p>
      </div>

      <Row gutter={[24, 16]}>
        <Col span={16}>
          <Card title="Work Result Documentation">
            <Steps current={currentStep} style={{ marginBottom: 24 }}>
              <Step title="Initial Assessment" icon={<ToolOutlined />} />
              <Step title="Work in Progress" icon={<ClockCircleOutlined />} />
              <Step title="Documentation" icon={<FileTextOutlined />} />
              <Step title="Completion" icon={<CheckCircleOutlined />} />
            </Steps>

            <Form as="form"
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Card size="small" title="Job Request Information" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Form as="form".Item controlId="job_request_code" label="Request Code">
                      <Input disabled />
                    </Form.Group>
                  </Col>
                  <Col span={8}>
                    <Form as="form".Item controlId="title" label="Title">
                      <Input disabled />
                    </Form.Group>
                  </Col>
                  <Col span={8}>
                    <Form as="form".Item controlId="requester" label="Requester">
                      <Input disabled />
                    </Form.Group>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form as="form".Item controlId="asset_affected" label="Asset Affected">
                      <Input disabled />
                    </Form.Group>
                  </Col>
                  <Col span={12}>
                    <Form as="form".Item controlId="location" label="Location">
                      <Input disabled />
                    </Form.Group>
                  </Col>
                </Row>
              </Card>

              <Form as="form".Item
                controlId="work_description"
                label="Work Description"
                rules={[{ required: true, message: 'Work description harus diisi!' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Deskripsikan pekerjaan yang telah dilakukan..."
                  onChange={(e) => setResultData(prev => ({ ...prev, work_description: e.target.value }))}
                />
              </Form.Group>

              <Form as="form".Item
                controlId="findings"
                label="Findings"
                rules={[{ required: true, message: 'Findings harus diisi!' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Temuan selama pekerjaan..."
                  onChange={(e) => setResultData(prev => ({ ...prev, findings: e.target.value }))}
                />
              </Form.Group>

              <Form as="form".Item
                controlId="recommendations"
                label="Recommendations"
                rules={[{ required: true, message: 'Recommendations harus diisi!' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Rekomendasi untuk maintenance selanjutnya..."
                  onChange={(e) => setResultData(prev => ({ ...prev, recommendations: e.target.value }))}
                />
              </Form.Group>

              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form as="form".Item
                    controlId="work_status"
                    label="Work Status"
                    rules={[{ required: true, message: 'Work status harus diisi!' }]}
                  >
                    <Select onChange={handleWorkStatusChange}>
                      <Option value="pending">Pending</Option>
                      <Option value="in_progress">In Progress</Option>
                      <Option value="completed">Completed</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </Select>
                  </Form.Group>
                </Col>
                <Col span={8}>
                  <Form as="form".Item
                    controlId="start_time"
                    label="Start Time"
                    rules={[{ required: true, message: 'Start time harus diisi!' }]}
                  >
                    <DatePicker 
                      showTime 
                      style={{ width: '100%' }}
                      onChange={(date, dateString) => setResultData(prev => ({ ...prev, start_time: dateString }))}
                    />
                  </Form.Group>
                </Col>
                <Col span={8}>
                  <Form as="form".Item
                    controlId="end_time"
                    label="End Time"
                    rules={[{ required: true, message: 'End time harus diisi!' }]}
                  >
                    <DatePicker 
                      showTime 
                      style={{ width: '100%' }}
                      onChange={(date, dateString) => setResultData(prev => ({ ...prev, end_time: dateString }))}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form as="form".Item label="Completion Progress">
                <Progress 
                  percent={resultData.completion_percentage} 
                  status={resultData.work_status === 'completed' ? 'success' : 'active'}
                />
              </Form.Group>

              <Card size="small" title="Parts Used" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Input
                      placeholder="Part name"
                      value={currentPart.part_name}
                      onChange={(e) => setCurrentPart(prev => ({ ...prev, part_name: e.target.value }))}
                    />
                  </Col>
                  <Col span={4}>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={currentPart.quantity}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        setCurrentPart(prev => ({ 
                          ...prev, 
                          quantity,
                          total_price: quantity * prev.unit_price
                        }));
                      }}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      type="number"
                      placeholder="Unit price"
                      value={currentPart.unit_price}
                      onChange={(e) => {
                        const unitPrice = parseInt(e.target.value) || 0;
                        setCurrentPart(prev => ({ 
                          ...prev, 
                          unit_price: unitPrice,
                          total_price: prev.quantity * unitPrice
                        }));
                      }}
                    />
                  </Col>
                  <Col span={4}>
                    <Input
                      value={currentPart.total_price}
                      placeholder="Total"
                      disabled
                    />
                  </Col>
                  <Col span={4}>
                    <Button type="primary" onClick={addPart}>
                      Add Part
                    </Button>
                  </Col>
                </Row>

                {partsList.length > 0 && (
                  <div className="parts-list">
                    {partsList.map(part => (
                      <div key={part.id} className="part-item">
                        <span>{part.part_name}</span>
                        <span>Qty: {part.quantity}</span>
                        <span>Rp {part.total_price.toLocaleString('id-ID')}</span>
                        <Button 
                          type="link" 
                          danger 
                          onClick={() => removePart(part.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <div className="parts-total">
                      <strong>Total Parts Cost: Rp {totalPartsCost.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                )}
              </Card>

              <Form as="form".Item
                controlId="next_maintenance_date"
                label="Next Maintenance Date"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  onChange={(date, dateString) => setResultData(prev => ({ ...prev, next_maintenance_date: dateString }))}
                />
              </Form.Group>

              <Form as="form".Item
                controlId="attachments"
                label="Attachments"
              >
                <Upload
                  multiple
                  beforeUpload={handleUpload}
                  showUploadList={{ showRemoveIcon: true }}
                >
                  <Button icon={<UploadOutlined />}>
                    Upload Photos & Documents
                  </Button>
                </Upload>
              </Form.Group>

              <Form as="form".Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Submit Result
                  </Button>
                  <Button onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Group>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Work Summary" style={{ marginBottom: 16 }}>
            <div className="work-summary">
              <div className="summary-item">
                <span className="label">Request Code:</span>
                <span className="value">{resultData.job_request_code}</span>
              </div>
              <div className="summary-item">
                <span className="label">Status:</span>
                <Tag color={getStatusColor(resultData.work_status)}>
                  {resultData.work_status.replace('_', ' ').toUpperCase()}
                </Tag>
              </div>
              <div className="summary-item">
                <span className="label">Progress:</span>
                <Progress 
                  percent={resultData.completion_percentage} 
                  size="small"
                  status={resultData.work_status === 'completed' ? 'success' : 'active'}
                />
              </div>
              <div className="summary-item">
                <span className="label">Labor Hours:</span>
                <span className="value">{calculateLaborHours().toFixed(2)} hours</span>
              </div>
              <div className="summary-item">
                <span className="label">Labor Cost:</span>
                <span className="value">Rp {laborCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="summary-item">
                <span className="label">Parts Cost:</span>
                <span className="value">Rp {totalPartsCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="summary-item total">
                <span className="label">Total Cost:</span>
                <span className="value">Rp {totalCost.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </Card>

          <Card title="Quick Tips">
            <div className="tips-content">
              <div className="tip-item">
                <div className="tip-icon">📝</div>
                <div className="tip-text">
                  <strong>Complete Documentation</strong> - Document all work performed and findings
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">📷</div>
                <div className="tip-text">
                  <strong>Upload Photos</strong> - Include before and after photos for evidence
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">🔧</div>
                <div className="tip-text">
                  <strong>Track Parts Used</strong> - Record all parts and materials used for the job
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">📅</div>
                <div className="tip-text">
                  <strong>Schedule Next Maintenance</strong> - Set date for follow-up maintenance if needed
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
