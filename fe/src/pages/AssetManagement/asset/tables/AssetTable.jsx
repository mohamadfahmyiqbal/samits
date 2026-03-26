// src/comp/asset/tables/AssetTable.jsx
import React, { useState, useMemo } from "react";
import { Table, Badge } from "react-bootstrap";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import "../../../../styles/Tabel.css";
import AssetAction from "./AssetAction";
import TableSkeleton from "./TableSkeleton";
import TableToolbar from "./TableToolbar";
import TablePagination from "./TablePagination";
import "./AssetTable.css";

const assetTableColumns = [
 { header: "Aksi", accessor: "actions", sortable: false },
 { header: "No", accessor: "no", sortable: false },
 { header: "No.Asset", accessor: "noAsset", sortable: true },
 { header: "Type", accessor: "type", sortable: true },
 { header: "Dept", accessor: "dept", sortable: true },
 { header: "Nama", accessor: "nama", sortable: true },
 { header: "NIK", accessor: "nik", sortable: true },
 { header: "Tahun Pembelian", accessor: "tahunBeli", sortable: true },
 { header: "Tahun Depreciation", accessor: "tahunDepreciation", sortable: true },
 { header: "Hostname", accessor: "hostname", sortable: true },
 { header: "IP Address Main", accessor: "mainIpAdress", sortable: true },
 { header: "IP Address Backup", accessor: "backupIpAdress", sortable: true },
 { header: "Status", accessor: "status", sortable: true },
];


const SortIndicator = ({ column, sortField, sortAsc }) => {
 if (!column.sortable) return null;
 if (column.accessor !== sortField) return <FaSort className="ms-1" />;
 return sortAsc ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
};


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
 columns = assetTableColumns
}) {
 const [currentPage, setCurrentPage] = useState(1);
 const [searchTerm, setSearchTerm] = useState("");
 const itemsPerPage = 10;

 const sourceData = Array.isArray(data) ? data : [];

 const filteredData = useMemo(() => {
  if (!searchTerm) return sourceData;
  const lowercasedTerm = searchTerm.toLowerCase();
  return sourceData.filter(item =>
   Object.values(item).some(value =>
    String(value).toLowerCase().includes(lowercasedTerm)
   )
  );
 }, [sourceData, searchTerm]);

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
  const exportData = filteredData.map((item, idx) => ({
   No: idx + 1,
   "No.Asset": item.noAsset,
   Type: item.type,
   Dept: item.dept,
   Nama: item.nama,
   NIK: item.nik,
   Hostname: item.hostname,
   "Tahun Pembelian": item.tahunBeli,
   Category: item.category,
   Status: item.status,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Assets");
  XLSX.writeFile(wb, "AssetList.xlsx");
 };

 if (isLoading) {
  return <TableSkeleton columns={columns} />;
 }

 return (
  <div className="modern-table-container">
   <TableToolbar
    onSearch={handleSearch}
    onExport={handleExportExcel}
    exportDisabled={!filteredData.length}
    onAdd={onAdd}
   />

   <div className="table-wrapper">
    <Table hover className="table table-custom modern-table">
     <thead className="table-header">
      <tr>
       {columns.map((col) => (
        <th key={col.accessor} onClick={() => col.sortable && onSort(col.accessor)} className={col.sortable ? 'sortable' : ''}>
         {col.header}
         <SortIndicator column={col} sortField={sortField} sortAsc={sortAsc} />
        </th>
       ))}
      </tr>
     </thead>
     <tbody className="table-body">
      {paginatedData.length === 0 ? (
       <tr className="empty-row">
        <td colSpan={columns.length} className="text-center">
         <div className="empty-state">
          <span>Tidak ada data yang cocok dengan pencarian Anda.</span>
         </div>
        </td>
       </tr>
      ) : (
       paginatedData.map((item, idx) => (
        <tr key={item.id || `row-${idx}`} className="table-row">
         {columns.map(col => {
          const cellValue = item[col.accessor];
          switch (col.accessor) {
           case 'no':
            return <td key={col.accessor}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>;
           case 'status':
            return (
             <td key={col.accessor}>
              <Badge bg={cellValue === "Active" ? "success" : "secondary"} className="status-badge">
               {cellValue}
              </Badge>
             </td>
            );
           case 'actions':
            return (
             <td key={col.accessor} className="actions-cell">
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

