// src/comp/asset/tables/TablePagination.jsx

import React from 'react';
import { Pagination, Row, Col, Form } from 'react-bootstrap';

const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalData,
  itemsPerPage,
}) => {
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
    <Row className="mt-3 align-items-center">
      <Col md={6}>
        <span className="text-muted">
          Halaman {currentPage} dari {totalPages} | Total Data: {totalData}
        </span>
      </Col>
      <Col md={6} className="d-flex justify-content-end">
        <Pagination>
          <Pagination.First onClick={() => handlePageClick(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1} />
          {renderPageItems()}
          <Pagination.Next onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => handlePageClick(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </Col>
    </Row>
  );
};

export default TablePagination;
