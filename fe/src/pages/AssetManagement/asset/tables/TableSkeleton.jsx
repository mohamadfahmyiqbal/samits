// src/comp/asset/tables/TableSkeleton.jsx

import React from "react";
import { Table, Placeholder } from "react-bootstrap";
import "../../../../styles/Tabel.css";

const TableSkeleton = ({ columns, rows = 10 }) => {
  return (
    <Table bordered hover className="table-custom">
      <thead className="table-primary">
        <tr>
          {columns.map((_, index) => (
            <th key={index}>
              <Placeholder animation="glow">
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
                <Placeholder animation="glow">
                  <Placeholder xs={12} />
                </Placeholder>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TableSkeleton;
