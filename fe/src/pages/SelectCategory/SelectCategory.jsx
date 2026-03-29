import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
  Button,
  Select,
  Input,
  message,
  Steps,
  Space,
  DatePicker,
} from 'antd';
import {
  CalendarOutlined,
  RightOutlined,
  ToolOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './SelectCategory.css';

const { Option } = Select;
const { Step } = Steps;

export default function SelectCategory() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const categories = [
    {
      id: 1,
      name: 'Preventive Maintenance',
      description: 'Scheduled maintenance to prevent failures',
      icon: <CalendarOutlined />,
      subcategories: [
        { id: 11, name: 'Equipment Inspection', estimated_time: 2 },
        { id: 12, name: 'Lubrication', estimated_time: 1 },
        { id: 13, name: 'Calibration', estimated_time: 3 },
        { id: 14, name: 'Cleaning', estimated_time: 1 },
      ],
    },
    {
      id: 2,
      name: 'Corrective Maintenance',
      description: 'Unscheduled maintenance to fix failures',
      icon: <ToolOutlined />,
      subcategories: [
        { id: 21, name: 'Equipment Repair', estimated_time: 4 },
        { id: 22, name: 'Component Replacement', estimated_time: 2 },
        { id: 23, name: 'System Troubleshooting', estimated_time: 3 },
        { id: 24, name: 'Emergency Repair', estimated_time: 6 },
      ],
    },
    {
      id: 3,
      name: 'Predictive Maintenance',
      description: 'Condition-based maintenance using monitoring',
      icon: <CheckCircleOutlined />,
      subcategories: [
        { id: 31, name: 'Vibration Analysis', estimated_time: 2 },
        { id: 32, name: 'Thermal Analysis', estimated_time: 1 },
        { id: 33, name: 'Oil Analysis', estimated_time: 1 },
        { id: 34, name: 'Performance Monitoring', estimated_time: 2 },
      ],
    },
  ];

  useEffect(() => {
    // Initialize form with default values
    form.setFieldsValue({
      category: null,
      subcategory: null,
      priority: 'medium',
      description: '',
    });
  }, [form]);

  const handleCategoryChange = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    setSelectedCategory(category);
    form.setFieldsValue({
      subcategory: null,
      estimated_time: category ? category.subcategories[0]?.estimated_time || 2 : 2,
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call

      // Navigate to schedule selection with form data
      navigate('/select-schedule', {
        state: {
          categoryData: values,
          selectedCategory: selectedCategory,
        },
      });

      message.success('Category selected successfully');
    } catch (error) {
      message.error('Failed to select category');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = selectedCategory ? 1 : 0;

  return (
    <div className='select-category'>
      <div className='page-header'>
        <h1>Select Maintenance Category</h1>
        <p>Choose the appropriate maintenance category and subcategory</p>
      </div>

      <Row gutter={[24, 16]}>
        <Col span={16}>
          <Card title='Category Selection'>
            <Steps current={currentStep} style={{ marginBottom: 24 }}>
              <Step title='Select Category' icon={<CalendarOutlined />} />
              <Step title='Select Subcategory' icon={<ToolOutlined />} />
              <Step title='Review & Submit' icon={<CheckCircleOutlined />} />
            </Steps>

            <Form form={form} layout='vertical' onFinish={handleSubmit}>
              <Form.Item
                name='category'
                label='Maintenance Category'
                rules={[{ required: true, message: 'Please select a category!' }]}
              >
                <Select
                  placeholder='Select maintenance category'
                  onChange={handleCategoryChange}
                  size='large'
                >
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 8 }}>{category.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500 }}>{category.name}</div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {category.description}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedCategory && (
                <Form.Item
                  name='subcategory'
                  label='Subcategory'
                  rules={[{ required: true, message: 'Please select a subcategory!' }]}
                >
                  <Select placeholder='Select subcategory' size='large'>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <Option key={subcategory.id} value={subcategory.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{subcategory.name}</span>
                          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Est. {subcategory.estimated_time}h
                          </span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item
                    name='priority'
                    label='Priority'
                    rules={[{ required: true, message: 'Please select priority!' }]}
                  >
                    <Select placeholder='Select priority'>
                      <Option value='low'>Low</Option>
                      <Option value='medium'>Medium</Option>
                      <Option value='high'>High</Option>
                      <Option value='critical'>Critical</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name='estimated_time' label='Estimated Time (hours)'>
                    <Input type='number' placeholder='2' disabled />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name='target_date'
                    label='Target Date'
                    rules={[{ required: true, message: 'Please select target date!' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name='description'
                label='Description'
                rules={[{ required: true, message: 'Please provide description!' }]}
              >
                <Input.TextArea rows={4} placeholder='Describe the maintenance requirements...' />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type='primary'
                    htmlType='submit'
                    loading={loading}
                    icon={<RightOutlined />}
                    size='large'
                  >
                    Continue to Schedule Selection
                  </Button>
                  <Button size='large'>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title='Category Summary' style={{ marginBottom: 16 }}>
            {selectedCategory ? (
              <div className='category-summary'>
                <div className='category-icon' style={{ fontSize: 48, marginBottom: 16 }}>
                  {selectedCategory.icon}
                </div>
                <h3>{selectedCategory.name}</h3>
                <p style={{ color: '#8c8c8c', marginBottom: 16 }}>{selectedCategory.description}</p>
                <div className='subcategory-list'>
                  <h4>Available Subcategories:</h4>
                  {selectedCategory.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className='subcategory-item'>
                      <span>{subcategory.name}</span>
                      <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {subcategory.estimated_time}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className='no-category-selected'>
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }}>
                    <CalendarOutlined />
                  </div>
                  <p style={{ color: '#8c8c8c' }}>Select a category to view details</p>
                </div>
              </div>
            )}
          </Card>

          <Card title='Quick Tips'>
            <div className='tips-content'>
              <div className='tip-item'>
                <div className='tip-number'>1</div>
                <div className='tip-text'>
                  <strong>Preventive Maintenance</strong> - Regular scheduled maintenance to prevent
                  equipment failures
                </div>
              </div>
              <div className='tip-item'>
                <div className='tip-number'>2</div>
                <div className='tip-text'>
                  <strong>Corrective Maintenance</strong> - Reactive maintenance performed after
                  equipment failure
                </div>
              </div>
              <div className='tip-item'>
                <div className='tip-number'>3</div>
                <div className='tip-text'>
                  <strong>Predictive Maintenance</strong> - Condition-based maintenance using
                  monitoring data
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
