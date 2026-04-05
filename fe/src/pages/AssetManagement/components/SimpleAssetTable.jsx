import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';

export default function SimpleAssetTable({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped hover>
        <thead>
          <tr>
            <th>No</th>
            <th>No.Asset</th>
            <th>Type</th>
            <th>Dept</th>
            <th>Nama</th>
            <th>NIK</th>
            <th>Hostname</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index}>
                <td>{index + 1}</td>
                <td>{item.noAsset || '-'}</td>
                <td>{item.type || '-'}</td>
                <td>{item.dept || '-'}</td>
                <td>{item.nama || '-'}</td>
                <td>{item.nik || '-'}</td>
                <td>{item.hostname || '-'}</td>
                <td>
                  <Badge bg={item.status === 'Active' ? 'success' : 'secondary'}>
                    {item.status || 'Unknown'}
                  </Badge>
                </td>
                <td>
                  <Button size="sm" variant="outline-primary">
                    <i className="bi bi-eye"></i>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
