import React, { useMemo, useState } from 'react';
import { Table, Spinner, Alert, Button, Badge, InputGroup, FormControl } from 'react-bootstrap';

const truncate = (text, limit = 120) =>
  text && text.length > limit ? `${text.slice(0, limit)}...` : text || '-';

const formatResult = (value) =>
  value
    ? value
        .split('\n')
        .map((line, idx) => (
          <div key={`result-${idx}`} className="text-truncate">
            {line}
          </div>
        ))
    : '-';

const ChecksheetTemplateTable = ({
  checklists = [],
  loading,
  error = '',
  onEditChecklist,
  onDeleteChecklist,
  selectionReady,
}) => {
  const [search, setSearch] = useState('');
  const normalizedChecklists = Array.isArray(checklists) ? checklists : [];

  const filteredChecklists = useMemo(() => {
    const term = search?.trim().toLowerCase();
    if (!term) return normalizedChecklists;
    return normalizedChecklists.filter(
      (checklist) =>
        (checklist.template_label || '').toLowerCase().includes(term) ||
        (checklist.item_description || '').toLowerCase().includes(term) ||
        (checklist.item_range || '').toLowerCase().includes(term) ||
        (checklist.result || '').toLowerCase().includes(term),
    );
  }, [search, normalizedChecklists]);

  if (!selectionReady) {
    return (
      <div className="text-muted py-4 text-center">
        Pilih Main Type → Category → Sub Category untuk melihat daftar checklist.
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <InputGroup className="w-100 w-md-auto">
          <FormControl
            placeholder="Cari judul, uraian, atau hasil..."
            value={search}
            onChange={(evt) => setSearch(evt.target.value)}
          />
        </InputGroup>
        <Badge bg="light" text="dark" className="py-1 px-2">
          {filteredChecklists.length}/{normalizedChecklists.length} baris
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading checklist...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : !filteredChecklists.length ? (
        <div className="text-muted py-4 text-center">
          Tidak ada checklist untuk sub kategori ini.
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-3">
          <Table responsive bordered hover size="sm" className="checksheet-template-table mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Judul/Template</th>
                <th>Uraian</th>
                <th>Range</th>
                <th>Hasil</th>
                <th>Status</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecklists.map((checklist) => (
                <tr key={checklist.checklist_id || `${checklist.template_id}-${checklist.item_no}`}>
                  <td>{checklist.checklist_id}</td>
                  <td>
                    <div className="fw-semibold">{checklist.template_label || '-'}</div>
                    <Badge bg="secondary" pill>
                      {checklist.work_type}
                    </Badge>
                  </td>
                  <td>{checklist.item_description || '-'}</td>
                  <td>{checklist.item_range || '-'}</td>
                  <td>{formatResult(checklist.result)}</td>
                  <td>
                    <Badge bg={checklist.status === 'done' ? 'success' : checklist.status === 'pending' ? 'warning' : 'secondary'}>
                      {checklist.status || 'pending'}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => onEditChecklist?.(checklist)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => onDeleteChecklist?.(checklist)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  );
};

export default ChecksheetTemplateTable;
