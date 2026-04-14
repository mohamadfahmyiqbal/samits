import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, message, Space, Typography, Row, Col, Card, Statistic, Tag } from 'antd';
import { ReloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { inventoryService } from '../../services';
import StockMovementTable from './components/StockMovementTable';
import TransactionModal from './components/TransactionModal';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const { Title } = Typography;

const StockMovement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    dateRange: null,
    search: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({ totalIn: 0, totalOut: 0, totalValue: 0 });

  const loadTransactions = useCallback(async (newFilters = filters) => {
    setLoading(true);
    try {
      const response = await inventoryService.listTransactions(newFilters);
      setTransactions(response.data?.items || response.items || []);
      setPagination({
        current: response.data?.page || response.page || 1,
        pageSize: response.data?.limit || response.limit || 20,
        total: response.data?.total || response.total || 0,
      });

      // Update statistik dari response atau fallback hitung lokal
      if (response.data?.stats || response.stats) {
        setStats(response.data?.stats || response.stats);
      }
    } catch (error) {
      console.error('Gagal memuat transaksi:', error);
      message.error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadSummaryStats = useCallback(async () => {
    try {
      const response = await inventoryService.getTransactionsSummary(filters);
      setStats(response.data || { totalIn: 0, totalOut: 0, totalValue: 0 });
    } catch (error) {
      console.error('Gagal memuat statistik:', error);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
    loadSummaryStats();
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePaginationChange = useCallback((page, pageSize) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }));
  }, []);

  const handleRefresh = useCallback(() => {
    loadTransactions({ ...filters, page: 1 });
  }, [loadTransactions, filters]);

  const handleExport = useCallback(async () => {
    try {
      const blob = await inventoryService.exportTransactions(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `stock-movement-${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Ekspor berhasil diunduh');
    } catch (error) {
      message.error('Gagal mengekspor data');
    }
  }, [filters]);

  const handleViewDetail = useCallback((record) => {
    setSelectedTransaction(record);
    setModalVisible(true);
  }, []);

  // Columns configuration
  const columns = useMemo(() => [
    {
      title: 'ID Transaksi',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: 'Kode Part',
      dataIndex: 'part_code',
      key: 'part_code',
      ellipsis: true,
    },
    {
      title: 'Nama Part',
      dataIndex: 'part_name',
      key: 'part_name',
      ellipsis: true,
    },
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const colors = { in: 'green', out: 'red', adjustment: 'orange' };
        return <Tag color={colors[type] || 'default'}>{type?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Jumlah',
      key: 'quantity',
      width: 120,
      render: (_, record) => (
        <div>
          <strong style={{ color: record.type === 'out' ? '#ff4d4f' : '#52c41a' }}>
            {record.quantity} {record.unit}
          </strong>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.stock_before} → {record.stock_after}
          </div>
        </div>
      ),
    },
    {
      title: 'Nilai',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = { completed: 'green', pending: 'blue', cancelled: 'red' };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date) => {
        if (!date) return '-';
        const parsedDate = typeof date === 'string' ? parseISO(date) : date instanceof Date ? date : null;
        if (!parsedDate) return '-';
        return format(parsedDate, 'dd MMM yyyy, HH:mm', { locale: id });
      },
    },
    {
      title: 'Oleh',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      ellipsis: true,
    },
    {
      title: 'Lokasi',
      dataIndex: 'warehouse_id',
      key: 'warehouse_id',
      width: 100,
      render: (id) => `Gudang ${id || '01'}`,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
        </Space>
      ),
    },
  ], [handleViewDetail]);

  return (
    <div className="stock-movement">
      <div className="page-header">
        <Title level={2}>Pergerakan Stok</Title>
        <p>Pantau semua pergerakan stok part (masuk, keluar, penyesuaian, dan transfer).</p>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Stok Masuk"
              value={stats.totalIn || 0}
              styles={{ content: { color: '#52c41a' } }}
              prefix={<ReloadOutlined />}
            />

          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Stok Keluar"
              value={stats.totalOut || 0}
              styles={{ content: { color: '#ff4d4f' } }}
              prefix={<ReloadOutlined />}
            />

          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Nilai Transaksi"
              value={stats.totalValue || 0}
              precision={0}
              prefix="Rp"
              suffix=".-"
            />
          </Card>
        </Col>
      </Row>

      <StockMovementTable
        columns={columns}
        data={transactions}
        loading={loading}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        total={pagination.total}
      />

      <TransactionModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={() => {
          setModalVisible(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default StockMovement;

