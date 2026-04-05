// src/comp/asset/tables/AssetTable.jsx
import React, { useState, useMemo } from 'react';
import { Table, Badge, Pagination, Row, Col, Form, Button, Placeholder } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown, FaEye, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';

// Inline small components to reduce file fragmentation

const TableToolbar = ({ onSearch, onExport, exportDisabled, onAdd }) => (
  <Row className='mb-3 align-items-center'>
    <Col md={4}>
      <Form.Control
        type='text'
        placeholder='Cari data...'
        onChange={(e) => onSearch(e.target.value)}
        className='me-2'
      />
    </Col>
    <Col md={8} className='d-flex justify-content-end'>
      {onAdd && (
        <Button variant='success' onClick={onAdd} className='me-2'>
          Tambah Aset
        </Button>
      )}
      <Button variant='primary' onClick={onExport} disabled={exportDisabled}>
        Export Excel
      </Button>
    </Col>
  </Row>
);

const TablePagination = ({ currentPage, totalPages, onPageChange, totalData, itemsPerPage }) => {
  const handlePageClick = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const renderPageItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxPagesToShow / 2);
        endPage = currentPage + Math.floor(maxPagesToShow / 2);
      }
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageClick(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return items;
  };

  if (totalPages <= 1) return null;

  return (
    <Row className='mt-3 align-items-center'>
      <Col md={6}>
        <span className='text-muted'>
          Halaman {currentPage} dari {totalPages} | Total Data: {totalData}
        </span>
      </Col>
      <Col md={6} className='d-flex justify-content-end'>
        <Pagination>
          <Pagination.First onClick={() => handlePageClick(1)} disabled={currentPage === 1} />
          <Pagination.Prev
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {renderPageItems()}
          <Pagination.Next
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </Col>
    </Row>
  );
};

const AssetAction = ({ item, onUpdate, onDelete, onDetail, onHistory }) => (
  <div className='asset-action'>
    {onHistory && (
      <FaHistory className='detail-icon' title='History' onClick={() => onHistory(item)} />
    )}
    {onDetail && <FaEye className='detail-icon' title='Detail' onClick={() => onDetail(item)} />}
    {onUpdate && <FaEdit className='update-icon' title='Update' onClick={() => onUpdate(item)} />}
    {onDelete && <FaTrash className='delete-icon' title='Delete' onClick={() => onDelete(item)} />}
  </div>
);

const TableSkeleton = ({ columns, rows = 10 }) => (
  <Table bordered hover className='table-custom'>
    <thead className='table-primary'>
      <tr>
        {columns.map((_, index) => (
          <th key={index}>
            <Placeholder animation='glow'>
              <Placeholder xs={12} />
            </Placeholder>
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((_, colIndex) => (
            <td key={colIndex}>
              <Placeholder animation='glow'>
                <Placeholder xs={12} />
              </Placeholder>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </Table>
);

const SortIndicator = ({ column, sortField, sortAsc }) => {
  if (!column.sortable) return null;
  if (column.accessor !== sortField) return <FaSort className='ms-1' />;
  return sortAsc ? <FaSortUp className='ms-1' /> : <FaSortDown className='ms-1' />;
};

const assetTableColumns = [
  { header: 'Aksi', accessor: 'actions', sortable: false },
  { header: 'No', accessor: 'no', sortable: false },
  { header: 'No.Asset', accessor: 'noAsset', sortable: true },
  { header: 'Type', accessor: 'type', sortable: true },
  { header: 'Dept', accessor: 'dept', sortable: true },
  { header: 'Nama', accessor: 'nama', sortable: true },
  { header: 'NIK', accessor: 'nik', sortable: true },
  { header: 'Tahun Pembelian', accessor: 'tahunBeli', sortable: true },
  { header: 'Tahun Depreciation', accessor: 'tahunDepreciation', sortable: true },
  { header: 'Hostname', accessor: 'hostname', sortable: true },
  { header: 'IP Address Main', accessor: 'mainIpAdress', sortable: true },
  { header: 'IP Address Backup', accessor: 'backupIpAdress', sortable: true },
  { header: 'Status', accessor: 'status', sortable: true },
];

export default function AssetTable({
  data,
  onSort,
  sortField,
  sortAsc,
  onUpdate,
  onDelete,
  onDetail,
  onHistory,
  isLoading,
  onAdd,
  columns = assetTableColumns,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    const sourceData = Array.isArray(data) ? data : [];
    if (!searchTerm) return sourceData;
    const lowercasedTerm = searchTerm.toLowerCase();
    return sourceData.filter((item) =>
      Object.values(item).some((value) => String(value).toLowerCase().includes(lowercasedTerm))
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const paginatedData = useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, totalPages]);

  // Handler untuk search - reset ke halaman pertama saat mengetik
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    if (!filteredData.length) return;
    filteredData.map((item, idx) => ({
      No: idx + 1,
      'No.Asset': item.noAsset,
      Type: item.type,
      Dept: item.dept,
      Nama: item.nama,
      NIK: item.nik,
      Hostname: item.hostname,
      'Tahun Pembelian': item.tahunBeli,
      Category: item.category,
      Status: item.status,
    }));

    // Excel export disabled due to security concerns
    alert('Excel export temporarily disabled for security reasons');
    // TODO: Implement safer export alternative
    /*
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');
    XLSX.writeFile(wb, 'AssetList.xlsx');
    */
  };

  if (isLoading) {
    return <TableSkeleton columns={columns} />;
  }

  return (
    <div className='modern-table-container'>
      <TableToolbar
        onSearch={handleSearch}
        onExport={handleExportExcel}
        exportDisabled={!filteredData.length}
        onAdd={onAdd}
      />

      <div className='table-wrapper'>
        <Table hover className='table table-custom modern-table'>
          <thead className='table-header'>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  onClick={() => col.sortable && onSort(col.accessor)}
                  className={col.sortable ? 'sortable' : ''}
                >
                  {col.header}
                  <SortIndicator column={col} sortField={sortField} sortAsc={sortAsc} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='table-body'>
            {paginatedData.length === 0 ? (
              <tr className='empty-row'>
                <td colSpan={columns.length} className='text-center'>
                  <div className='empty-state'>
                    <span>Tidak ada data yang cocok dengan pencarian Anda.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={item.id || `row-${idx}`} className='table-row'>
                  {columns.map((col) => {
                    const cellValue = item[col.accessor];
                    switch (col.accessor) {
                      case 'no':
                        return (
                          <td key={col.accessor}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        );
                      case 'status':
                        return (
                          <td key={col.accessor}>
                            <Badge
                              bg={cellValue === 'Active' ? 'success' : 'secondary'}
                              className='status-badge'
                            >
                              {cellValue}
                            </Badge>
                          </td>
                        );
                      case 'actions':
                        return (
                          <td key={col.accessor} className='actions-cell'>
                            <AssetAction
                              item={item}
                              onUpdate={onUpdate}
                              onDelete={onDelete}
                              onDetail={onDetail}
                              onHistory={onHistory}
                            />
                          </td>
                        );
                      default:
                        return <td key={col.accessor}>{cellValue}</td>;
                    }
                  })}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalData={filteredData.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
