import React, { useMemo, useState } from "react";
import { Table, Badge, Button, Pagination } from "react-bootstrap";

export default function StokTable({
  stokData,
  search,
  filterCategory,
  openEditModal,
  deleteItem,
  itemsPerPage = 5 // default 5 item per halaman
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // ======================
  // Filtered Data
  // ======================
  const filteredData = useMemo(() => {
    return (stokData || []).filter((item) => {
      const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "All" || item.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [stokData, search, filterCategory]);

  // ======================
  // Pagination logic
  // ======================
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getBadgeVariant = (category) => {
    switch (category) {
      case "Part":
        return "primary";
      case "Consumable":
        return "warning";
      case "Tools":
        return "success";
      default:
        return "secondary";
    }
  };

  // ======================
  // Render pagination items
  // ======================
  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  return (
    <>
      <Table bordered hover responsive>
        <thead className="table-primary">
          <tr>
            <th style={{ width: "50px", textAlign: "center" }}>No</th>
            <th>Nama</th>
            <th style={{ width: "120px" }}>Kategori</th>
            <th style={{ width: "80px", textAlign: "center" }}>Qty</th>
            <th>Lokasi</th>
            <th style={{ width: "150px", textAlign: "center" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item, idx) => (
              <tr key={item.id || idx}>
                <td style={{ textAlign: "center" }}>{startIndex + idx + 1}</td>
                <td>{item.name}</td>
                <td>
                  <Badge bg={getBadgeVariant(item.category)}>{item.category}</Badge>
                </td>
                <td style={{ textAlign: "center" }}>{item.qty}</td>
                <td>{item.location}</td>
                <td style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteItem(item.id)}
                  >
                    Hapus
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalPages > 1 && renderPagination()}
    </>
  );
}
