import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Form, message, Space, Tag } from 'antd';
import { inventoryService, partCategoryService } from '../../services';
import StockStats from './components/StockStats';
import StockTable from './components/StockTable';
import AddStockModal from './components/AddStockModal';
import UpdateStockModal from './components/UpdateStockModal';

const AddStock = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [addForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const loadStockData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryService.listParts({ limit: 200 });
      const parts = response.data || [];
      setStockData(parts);
      setFilteredData(parts);
    } catch (error) {
      console.error('Gagal memuat data stok:', error);
      message.error('Gagal memuat data stok dari server');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await partCategoryService.list();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Gagal memuat kategori:', error);
    }
  }, []);

  useEffect(() => {
    loadStockData();
    loadCategories();
  }, [loadStockData, loadCategories]);

  useEffect(() => {
    const text = searchText.toLowerCase();
    const filtered = stockData.filter((item) => {
      const searchable = `${item.part_name ?? ''} ${item.part_code ?? ''} ${item.category ?? ''}`.toLowerCase();
      const matchesSearch = searchable.includes(text);
      const matchesCategory = selectedCategory === 'all' || (item.category ?? 'Uncategorized') === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredData(filtered);
  }, [searchText, selectedCategory, stockData]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(stockData.map((item) => item.category || 'Uncategorized').filter(Boolean)),
    );
    return [
      { value: 'all', label: 'All Categories' },
      ...categories.map((value) => ({ value, label: value })),
    ];
  }, [stockData]);

  const getStockStatus = (current, minimum, maximum) => {
    if (minimum === null || minimum === undefined) return { status: 'unknown', color: 'default' };
    if (current <= minimum / 2) return { status: 'critical', color: 'red' };
    if (current <= minimum) return { status: 'low', color: 'orange' };
    if (maximum && current >= maximum) return { status: 'overstock', color: 'purple' };
    return { status: 'normal', color: 'green' };
  };

  const stats = useMemo(() => {
    const result = { total: stockData.length, low: 0, normal: 0, overstock: 0 };
    stockData.forEach((item) => {
      const status = getStockStatus(item.current_stock ?? 0, item.minimum_stock ?? 0, item.maximum_stock ?? 0);
      if (status.status === 'low') result.low += 1;
      if (status.status === 'normal') result.normal += 1;
      if (status.status === 'overstock') result.overstock += 1;
    });
    return result;
  }, [stockData]);

  const openAddModal = () => {
    addForm.resetFields();
    addForm.setFieldsValue({
      current_stock: 0,
      minimum_stock: 0,
      unit: 'pasang',
      status: 'normal',
      purchase_period: 'monthly',
    });
    setAddModalVisible(true);
  };

  const handleAddCancel = () => {
    addForm.resetFields();
    setAddModalVisible(false);
  };

  const handleAddSubmit = async (values) => {
    setLoading(true);
    try {
      await inventoryService.createTransaction({
        stock_id: values.stock_id,
        type: 'in',
        quantity: Number(values.add_quantity),
        notes: values.notes || 'Penambahan stok via UI',
        part_code: values.part_code,
        category: values.category,
        part_name: values.part_name,
        unit: values.unit,
        status: values.status,
        purchase_period: values.purchase_period,
        minimum_stock: Number(values.minimum_stock ?? 0),
      });
      message.success('Part baru berhasil ditambahkan');
      handleAddCancel();
      loadStockData();
    } catch (error) {
      console.error('Gagal menambah stock:', error);
      message.error('Gagal menyimpan part baru');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (record, transactionType = 'in') => {
    setUpdateTarget(record);
    updateForm.resetFields();
    updateForm.setFieldsValue({
      stock_id: record.id,
      transaction_type: transactionType,
      quantity: undefined,
      notes: '',
    });
    setUpdateModalVisible(true);
  };

  const handleUpdateCancel = () => {
    updateForm.resetFields();
    setUpdateModalVisible(false);
    setUpdateTarget(null);
  };

  const handleUpdateSubmit = async (values) => {
    if (!updateTarget) return;
    setLoading(true);
    try {
      await inventoryService.createTransaction({
        stock_id: updateTarget.id,
        type: values.transaction_type,
        quantity: Number(values.quantity),
        notes: values.notes || 'Update stok via UI',
        part_code: updateTarget.part_code,
        category: updateTarget.category,
        part_name: updateTarget.part_name,
        unit: updateTarget.unit,
        status: updateTarget.status,
        purchase_period: updateTarget.purchase_period,
        minimum_stock: updateTarget.minimum_stock,
      });
      message.success('Perubahan stok berhasil disimpan');
      handleUpdateCancel();
      loadStockData();
    } catch (error) {
      console.error('Gagal update stock:', error);
      message.error('Gagal update stok');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStockData();
  };

  const columns = [
    {
      title: 'Part Code',
      dataIndex: 'part_code',
      key: 'part_code',
      render: (_, record) => <strong>{record.part_code || `#${record.part_id}`}</strong>,
    },
    {
      title: 'Part Name',
      dataIndex: 'part_name',
      key: 'part_name',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color='blue'>{category || 'Uncategorized'}</Tag>,
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock, record) => (
        <div>
          <strong>
            {stock ?? 0} {record.unit || 'unit'}
          </strong>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            Min: {record.minimum_stock ?? '-'} | Max: {record.maximum_stock ?? '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const stockInfo = getStockStatus(
          record.current_stock ?? 0,
          record.minimum_stock ?? 0,
          record.maximum_stock ?? 0,
        );
        return <Tag color={stockInfo.color}>{stockInfo.status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `Rp ${Number(price || 0).toLocaleString('id-ID')}`,
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => `Gudang ${record.warehouse_id ?? '-'}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type='default'
            size='small'
            onClick={() => openUpdateModal(record, 'in')}
          >
            Update Stock
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className='add-stock'>
      <div className='page-header'>
        <h1>Add Stock</h1>
        <p>Tambah stock parts dan management inventory</p>
      </div>

      <StockStats stats={stats} />
      <StockTable
        columns={columns}
        data={filteredData}
        loading={loading}
        categoryOptions={categoryOptions}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchText}
        onRefresh={handleRefresh}
        onAdd={openAddModal}
      />

      <AddStockModal
        visible={addModalVisible}
        loading={loading}
        form={addForm}
        categories={categories}
        onSubmit={handleAddSubmit}
        onCancel={handleAddCancel}
      />
      <UpdateStockModal
        visible={updateModalVisible}
        loading={loading}
        form={updateForm}
        record={updateTarget}
        onSubmit={handleUpdateSubmit}
        onCancel={handleUpdateCancel}
      />
    </div>
  );
};

export default AddStock;
