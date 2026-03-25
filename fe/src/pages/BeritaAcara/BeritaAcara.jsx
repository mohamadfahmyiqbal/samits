import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Input, DatePicker, Select, Row, Col, message, Modal, Alert, Tag, Upload, Divider, Typography } from 'antd';
import { 
  FileTextOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  PrinterOutlined, 
  DownloadOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import './BeritaAcara.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

export default function BeritaAcara() {
  const [form] = Form.useForm();
  const [beritaAcaraData, setBeritaAcaraData] = useState([]);
  const [selectedBeritaAcara, setSelectedBeritaAcara] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [assets, setAssets] = useState([]);

  const beritaAcaraColumns = [
    {
      title: 'Nomor',
      dataIndex: 'document_number',
      key: 'document_number',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Tanggal',
      dataIndex: 'document_date',
      key: 'document_date',
      render: (date) => new Date(date).toLocaleDateString('id-ID')
    },
    {
      title: 'Judul',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div style={{ fontWeight: 500 }}>{text}</div>
    },
    {
      title: 'Jenis',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colorMap = {
          'disposal': 'red',
          'handover': 'blue',
          'transfer': 'green',
          'inspection': 'orange'
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    {
      title: 'Jumlah Aset',
      dataIndex: 'asset_count',
      key: 'asset_count'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'draft': 'orange',
          'pending_approval': 'blue',
          'approved': 'green',
          'rejected': 'red',
          'completed': 'success'
        };
        const iconMap = {
          'draft': <ClockCircleOutlined />,
          'pending_approval': <ClockCircleOutlined />,
          'approved': <CheckCircleOutlined />,
          'rejected': <CheckCircleOutlined />,
          'completed': <CheckCircleOutlined />
        };
        return (
          <Tag color={colorMap[status]} icon={iconMap[status]}>
            {status.replace('_', ' ')}
          </Tag>
        );
      }
    },
    {
      title: 'Dibuat Oleh',
      dataIndex: 'created_by',
      key: 'created_by'
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
          <Button 
            size="small" 
            icon={<PrinterOutlined />}
            onClick={() => handlePreview(record)}
          >
            Preview
          </Button>
          {record.status === 'draft' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    // Mock berita acara data
    setBeritaAcaraData([
      {
        id: 1,
        document_number: 'BA-2024-001',
        document_date: '2024-03-25',
        title: 'Berita Acara Disposal Aset IT Tahun 2024',
        type: 'disposal',
        asset_count: 5,
        status: 'pending_approval',
        created_by: 'John Doe',
        description: 'Pemusnahan dan disposal aset IT yang sudah tidak layak pakai',
        location: 'Jakarta Office',
        witness1: 'Alice Johnson',
        witness2: 'Bob Wilson',
        assets: [
          { name: 'Laptop Dell XPS 15', asset_tag: 'LT-001', condition: 'Rusak Berat' },
          { name: 'Monitor LG 27 inch', asset_tag: 'MN-001', condition: 'Tidak Berfungsi' }
        ]
      },
      {
        id: 2,
        document_number: 'BA-2024-002',
        document_date: '2024-03-24',
        title: 'Berita Acara Serah Terima Aset Baru',
        type: 'handover',
        asset_count: 10,
        status: 'approved',
        created_by: 'Jane Smith',
        description: 'Serah terima aset baru dari vendor',
        location: 'Surabaya Office',
        witness1: 'Charlie Brown',
        witness2: 'Diana Prince',
        assets: [
          { name: 'Laptop HP EliteBook', asset_tag: 'LT-002', condition: 'Baik' },
          { name: 'Printer Canon', asset_tag: 'PRN-002', condition: 'Baik' }
        ]
      },
      {
        id: 3,
        document_number: 'BA-2024-003',
        document_date: '2024-03-23',
        title: 'Berita Acara Pemeriksaan Aset',
        type: 'inspection',
        asset_count: 8,
        status: 'completed',
        created_by: 'Mike Johnson',
        description: 'Pemeriksaan rutin aset kantor',
        location: 'Bandung Office',
        witness1: 'Eva Green',
        witness2: 'Frank Miller',
        assets: [
          { name: 'Server Dell PowerEdge', asset_tag: 'SRV-002', condition: 'Baik' },
          { name: 'Router Cisco', asset_tag: 'NET-001', condition: 'Baik' }
        ]
      }
    ]);

    // Mock assets data
    setAssets([
      { id: 1, name: 'Laptop Dell XPS 15', asset_tag: 'LT-001', condition: 'Rusak Berat' },
      { id: 2, name: 'Monitor LG 27 inch', asset_tag: 'MN-001', condition: 'Tidak Berfungsi' },
      { id: 3, name: 'Printer HP LaserJet', asset_tag: 'PRN-001', condition: 'Baik' },
      { id: 4, name: 'Server HP ProLiant', asset_tag: 'SRV-001', condition: 'Baik' }
    ]);
  }, []);

  const handleViewDetail = (beritaAcara) => {
    setSelectedBeritaAcara(beritaAcara);
    setShowDetailModal(true);
  };

  const handlePreview = (beritaAcara) => {
    setSelectedBeritaAcara(beritaAcara);
    setShowPreviewModal(true);
  };

  const handleEdit = (beritaAcara) => {
    setSelectedBeritaAcara(beritaAcara);
    setShowCreateModal(true);
    form.setFieldsValue({
      title: beritaAcara.title,
      type: beritaAcara.type,
      document_date: beritaAcara.document_date,
      location: beritaAcara.location,
      description: beritaAcara.description,
      witness1: beritaAcara.witness1,
      witness2: beritaAcara.witness2
    });
  };

  const handleSubmitBeritaAcara = async (values) => {
    try {
      setLoading(true);
      
      const beritaAcaraData = {
        document_number: selectedBeritaAcara?.document_number || `BA-${new Date().getFullYear()}-${String(beritaAcaraData.length + 1).padStart(3, '0')}`,
        ...values,
        assets: selectedBeritaAcara?.assets || [],
        created_by: 'current_user', // Replace with actual user
        status: 'draft'
      };

      // API call to save berita acara
      console.log('Saving berita acara:', beritaAcaraData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Berita acara berhasil disimpan!');
      setShowCreateModal(false);
      setSelectedBeritaAcara(null);
      form.resetFields();
      setFileList([]);
      
    } catch (error) {
      message.error('Gagal menyimpan berita acara');
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

  const renderBeritaAcaraPreview = () => {
    if (!selectedBeritaAcara) return null;

    return (
      <div className="berita-acara-preview">
        <div className="document-header">
          <div className="company-info">
            <h2>PT. SAMINDO</h2>
            <p>Jl. Contoh No. 123, Jakarta</p>
            <p>Telp: (021) 1234567</p>
          </div>
          <div className="document-title">
            <Title level={3}>BERITA ACARA</Title>
            <Title level={4}>{selectedBeritaAcara.title}</Title>
          </div>
        </div>

        <Divider />

        <div className="document-info">
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Nomor Dokumen:</strong> {selectedBeritaAcara.document_number}</p>
              <p><strong>Tanggal:</strong> {new Date(selectedBeritaAcara.document_date).toLocaleDateString('id-ID')}</p>
              <p><strong>Lokasi:</strong> {selectedBeritaAcara.location}</p>
            </Col>
            <Col span={12}>
              <p><strong>Jenis:</strong> {selectedBeritaAcara.type}</p>
              <p><strong>Status:</strong> <Tag>{selectedBeritaAcara.status}</Tag></p>
              <p><strong>Dibuat Oleh:</strong> {selectedBeritaAcara.created_by}</p>
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="document-content">
          <Title level={5}>Deskripsi</Title>
          <Paragraph>{selectedBeritaAcara.description}</Paragraph>

          <Title level={5}>Daftar Aset</Title>
          <table className="asset-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Aset</th>
                <th>Asset Tag</th>
                <th>Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {selectedBeritaAcara.assets.map((asset, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{asset.name}</td>
                  <td>{asset.asset_tag}</td>
                  <td>{asset.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Divider />

        <div className="document-witnesses">
          <Title level={5}>Saksi</Title>
          <Row gutter={32}>
            <Col span={12}>
              <p><strong>Saksi 1:</strong></p>
              <p>Nama: {selectedBeritaAcara.witness1}</p>
              <p>Tanda Tangan:</p>
              <div className="signature-box"></div>
            </Col>
            <Col span={12}>
              <p><strong>Saksi 2:</strong></p>
              <p>Nama: {selectedBeritaAcara.witness2}</p>
              <p>Tanda Tangan:</p>
              <div className="signature-box"></div>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  return (
    <div className="berita-acara">
      <div className="page-header">
        <h1>Berita Acara</h1>
        <p>Kelola dokumen berita acara untuk berbagai keperluan aset</p>
      </div>

      <Card>
        <div className="table-header">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Buat Berita Acara Baru
          </Button>
        </div>

        <Table
          columns={beritaAcaraColumns}
          dataSource={beritaAcaraData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedBeritaAcara ? "Edit Berita Acara" : "Buat Berita Acara Baru"}
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedBeritaAcara(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitBeritaAcara}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Judul Berita Acara"
                rules={[{ required: true, message: 'Masukkan judul!' }]}
              >
                <Input placeholder="Masukkan judul berita acara" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Jenis Berita Acara"
                rules={[{ required: true, message: 'Pilih jenis!' }]}
              >
                <Select placeholder="Pilih jenis">
                  <Option value="disposal">Disposal</Option>
                  <Option value="handover">Serah Terima</Option>
                  <Option value="transfer">Pemindahan</Option>
                  <Option value="inspection">Pemeriksaan</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="document_date"
                label="Tanggal Dokumen"
                rules={[{ required: true, message: 'Pilih tanggal!' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Pilih tanggal" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Lokasi"
                rules={[{ required: true, message: 'Masukkan lokasi!' }]}
              >
                <Input placeholder="Masukkan lokasi" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[{ required: true, message: 'Masukkan deskripsi!' }]}
          >
            <TextArea rows={4} placeholder="Deskripsi kegiatan berita acara" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="witness1"
                label="Saksi 1"
                rules={[{ required: true, message: 'Masukkan nama saksi 1!' }]}
              >
                <Input placeholder="Nama saksi pertama" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="witness2"
                label="Saksi 2"
                rules={[{ required: true, message: 'Masukkan nama saksi 2!' }]}
              >
                <Input placeholder="Nama saksi kedua" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="attachments"
            label="Lampiran"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Lampiran</Button>
            </Upload>
            <small>Format: PDF, DOC, DOCX, JPG, PNG (Max: 5MB)</small>
          </Form.Item>

          <Form.Item>
            <div className="form-actions">
              <Button onClick={() => setShowCreateModal(false)}>
                Batal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
              >
                Simpan
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detail Berita Acara"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        ]}
        width={800}
      >
        {selectedBeritaAcara && (
          <div className="berita-acara-detail">
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Nomor Dokumen:</strong> {selectedBeritaAcara.document_number}</p>
                <p><strong>Tanggal:</strong> {new Date(selectedBeritaAcara.document_date).toLocaleDateString('id-ID')}</p>
                <p><strong>Judul:</strong> {selectedBeritaAcara.title}</p>
                <p><strong>Jenis:</strong> <Tag color="blue">{selectedBeritaAcara.type}</Tag></p>
              </Col>
              <Col span={12}>
                <p><strong>Lokasi:</strong> {selectedBeritaAcara.location}</p>
                <p><strong>Status:</strong> <Tag color="green">{selectedBeritaAcara.status}</Tag></p>
                <p><strong>Dibuat Oleh:</strong> {selectedBeritaAcara.created_by}</p>
                <p><strong>Jumlah Aset:</strong> {selectedBeritaAcara.asset_count}</p>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <h4>Deskripsi</h4>
              <p>{selectedBeritaAcara.description}</p>
            </div>
            
            <div>
              <h4>Daftar Aset</h4>
              <table className="asset-table">
                <thead>
                  <tr>
                    <th>Nama Aset</th>
                    <th>Asset Tag</th>
                    <th>Kondisi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBeritaAcara.assets.map((asset, index) => (
                    <tr key={index}>
                      <td>{asset.name}</td>
                      <td>{asset.asset_tag}</td>
                      <td>{asset.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Saksi 1:</strong> {selectedBeritaAcara.witness1}</p>
              </Col>
              <Col span={12}>
                <p><strong>Saksi 2:</strong> {selectedBeritaAcara.witness2}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Preview Berita Acara"
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            Print
          </Button>,
          <Button key="download" icon={<DownloadOutlined />}>
            Download PDF
          </Button>,
          <Button key="close" onClick={() => setShowPreviewModal(false)}>
            Tutup
          </Button>
        ]}
        width={900}
      >
        {renderBeritaAcaraPreview()}
      </Modal>
    </div>
  );
}
