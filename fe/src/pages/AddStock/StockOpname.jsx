import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, message, Row, Col, Card, Statistic, Button, Space, Alert } from 'antd';
import { ReloadOutlined, PlayCircleOutlined, CheckCircleOutlined, BarcodeOutlined, FileExcelOutlined } from '@ant-design/icons';
import { inventoryService } from '../../services';
import StockOpnameTable from './components/StockOpnameTable';
import ScanModal from './components/ScanModal';

const { Title } = Typography;

const StockOpname = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', varianceStatus: null });
  const [opnameStatus, setOpnameStatus] = useState('draft'); // draft, active, completed
  const [scanVisible, setScanVisible] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);
  const [stats, setStats] = useState({
    totalParts: 0,
    counted: 0,
    discrepancies: 0,
    totalVarianceValue: 0,
  });

  const loadOpnameData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryService.listParts({ limit: 200 });
      const items = response.data || [];
      
      // Mock opname data structure
      const opnameData = items.map(item => ({
        id: item.id,
        part_code: item.part_code,
        part_name: item.part_name,
        system_stock: item.current_stock,
        physical_count: undefined, // Will be filled during counting
        unit_price: item.price || 0,
        category: item.category,
      }));
      
      setData(opnameData);
      
      // Stats
      setStats({
        totalParts: opnameData.length,
        counted: 0,
        discrepancies: 0,
      });
    } catch (error) {
      console.error('Gagal load opname data:', error);
      message.error('Gagal memuat data stok');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadOpnameData();
  }, [loadOpnameData]);

  const handleScan = useCallback((partId, qty) => {
    // Update local state
    setData(prev => prev.map(item => 
      item.id === partId 
        ? { ...item, physical_count: qty }
        : item
    ));
    
    message.success(`Updated count: ${qty}`);
    
    // Simulate save to server
    inventoryService.updateOpname(partId, { physical_count: qty }).catch(console.error);
  }, []);

  const handleSaveAdjustment = useCallback((record) => {
    const variance = (record.physical_count || 0) - (record.system_stock || 0);
    if (variance === 0) {
      message.success('No adjustment needed');
      return;
    }

    inventoryService.createAdjustment({
      part_id: record.id,
      variance,
      physical_count: record.physical_count,
      notes: 'Stock opname adjustment',
    }).then(() => {
      message.success('Penyesuaian tersimpan');
      loadOpnameData();
    }).catch(() => message.error('Gagal menyimpan penyesuaian'));
  }, [loadOpnameData]);

  const handleStartOpname = useCallback(() => {
    setOpnameStatus('active');
    message.success('Stock Opname dimulai');
  }, []);

  const handleCompleteOpname = useCallback(() => {
    inventoryService.completeOpname().then(() => {
      setOpnameStatus('completed');
      message.success('Stock Opname selesai dan disimpan');
    }).catch(() => message.error('Gagal menyelesaikan stok opname'));
  }, []);

  const handleExportReport = useCallback(() => {
    inventoryService.exportOpname(filters).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `stock-opname-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Report diunduh');
    }).catch(() => message.error('Gagal mengekspor data'));
  }, [filters]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.search && !item.part_code?.toLowerCase().includes(filters.search.toLowerCase()) && 
          !item.part_name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.varianceStatus) {
        const variance = (item.physical_count || 0) - (item.system_stock || 0);
        if (filters.varianceStatus === 'match' && variance !== 0) return false;
        if (filters.varianceStatus === 'surplus' && variance <= 0) return false;
        if (filters.varianceStatus === 'shortage' && variance >= 0) return false;
      }
      return true;
    });
  }, [data, filters]);

  const totalDiscrepancies = filteredData.filter(item => {
    const variance = (item.physical_count || 0) - (item.system_stock || 0);
    return variance !== 0;
  }).length;

  return (
    <div className="stock-opname">
      <div className="page-header">
        <Title level={2}>
          <BarcodeOutlined /> Stock Opname
        </Title>
        <p>Hitung stok fisik dengan pemindai barcode dan kelola selisih dengan lebih mudah.</p>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Parts"
              value={stats.totalParts}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Counted"
              value={stats.counted}
              styles={{ content: { color: '#52c41a' } }}
              suffix={`/${stats.totalParts}`}
            />

          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Discrepancies"
              value={totalDiscrepancies}
              styles={{ content: { color: '#ff4d4f' } }}
            />

          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Status" value={opnameStatus.toUpperCase()} />
          </Card>
        </Col>
      </Row>

      {opnameStatus === 'completed' && (
        <Alert
          message="Stock Opname selesai"
          description="Semua data sudah disimpan dan adjustment dibuat. Buat opname baru untuk cycle berikutnya."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <StockOpnameTable
        data={filteredData}
        loading={loading}
        onScan={handleScan}
        onSaveAdjustment={handleSaveAdjustment}
        onStartOpname={handleStartOpname}
        onCompleteOpname={handleCompleteOpname}
        onRefresh={loadOpnameData}
        filters={filters}
        onFiltersChange={setFilters}
        opnameStatus={opnameStatus}
        totalDiscrepancies={totalDiscrepancies}
      />

      <ScanModal
        visible={scanVisible}
        currentPart={currentPart}
        onScanSuccess={handleScan}
        onCancel={() => {
          setScanVisible(false);
          setCurrentPart(null);
        }}
      />

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
            <Button icon={<FileExcelOutlined />} onClick={handleExportReport}>
            Ekspor Laporan
          </Button>
          {opnameStatus === 'draft' && (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartOpname}>
              Mulai Stock Opname
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default StockOpname;

