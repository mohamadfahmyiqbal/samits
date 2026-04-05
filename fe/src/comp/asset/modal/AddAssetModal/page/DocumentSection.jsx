import React from 'react';
import { Card, Button, Spinner, Row, Col, Form } from 'react-bootstrap';
import {
  FaPaperclip,
  FaFilePdf,
  FaEye,
  FaTrash,
  FaReceipt,
  FaShoppingCart,
  FaFileInvoice,
} from 'react-icons/fa';

const DocumentSection = ({
  attachments,
  existingDocuments,
  setExistingDocuments,
  handleFileChange,
  removeAttachment,
  handlePreviewDocument,
  handleDeleteDocument,
  deletingDocId,
  newAsset,
}) => {
  // Filter attachments by type
  const pvAttachments = attachments.filter((f) => f.documentType === 'pv');
  const poAttachments = attachments.filter((f) => f.documentType === 'po');
  const invoiceAttachments = attachments.filter((f) => f.documentType === 'invoice');

  // Filter existing documents by type (support legacy 'General' type)
  // Legacy documents with 'General' type will be distributed across slots
  const generalDocs = existingDocuments.filter((d) => d.document_type === 'General');
  const pvSpecificDocs = existingDocuments.filter(
    (d) => d.document_type === 'PV' || d.document_type === 'pv'
  );
  const poSpecificDocs = existingDocuments.filter(
    (d) => d.document_type === 'PO' || d.document_type === 'po'
  );
  const invoiceSpecificDocs = existingDocuments.filter(
    (d) => d.document_type === 'Invoice' || d.document_type === 'invoice'
  );

  // Combine specific docs with distributed general docs for legacy support
  const pvDocs = [
    ...pvSpecificDocs,
    ...(pvSpecificDocs.length === 0 ? [generalDocs[0]].filter(Boolean) : []),
  ];
  const poDocs = [
    ...poSpecificDocs,
    ...(poSpecificDocs.length === 0 && generalDocs.length > 1
      ? [generalDocs[1]].filter(Boolean)
      : []),
  ];
  const invoiceDocs = [
    ...invoiceSpecificDocs,
    ...(invoiceSpecificDocs.length === 0 && generalDocs.length > 2
      ? [generalDocs[2]].filter(Boolean)
      : []),
  ];

  // Remaining general docs that don't fit in the three slots
  const remainingGeneralDocs = generalDocs.slice(
    pvSpecificDocs.length === 0 ? 1 : 0,
    generalDocs.length
  );

  // Local alert function
  const alertWarning = (message) => {
    alert(message);
  };

  const handleSingleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alertWarning(`File ${file.name}: Hanya file PDF yang diperbolehkan`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alertWarning(`File ${file.name}: Ukuran file maksimal 10MB`);
      return;
    }

    // Add document type to file object
    const typedFile = Object.assign(file, { documentType: docType });

    // Remove existing attachment of same type
    const filtered = attachments.filter((f) => f.documentType !== docType);

    // Add new file
    const newAttachments = [...filtered, typedFile];

    // Call parent handler with modified event
    const modifiedEvent = { target: { files: newAttachments } };
    handleFileChange(modifiedEvent, alertWarning);
  };

  const renderDocUploader = (label, icon, docType, docs, currentAttachments) => (
    <Form.Group className='mb-3'>
      <Form.Label className='d-flex align-items-center'>
        {icon}
        <span className='ms-2'>
          {label} <span className='text-danger'>*</span>
        </span>
      </Form.Label>

      {/* Current attachment */}
      {currentAttachments.length > 0 ? (
        <div className='d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded'>
          <span className='text-success small text-truncate' title={currentAttachments[0].name}>
            <FaPaperclip className='me-2' />
            {currentAttachments[0].name}
          </span>
          <Button
            variant='link'
            size='sm'
            className='text-danger p-0'
            onClick={() =>
              removeAttachment(attachments.findIndex((f) => f.documentType === docType))
            }
          >
            <FaTrash />
          </Button>
        </div>
      ) : docs.length > 0 ? (
        <div className='d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded'>
          <span className='small text-truncate' title={docs[0].original_name || docs[0].file_name}>
            <FaFilePdf className='text-danger me-2' />
            {docs[0].original_name || docs[0].file_name}
          </span>
          <div>
            <Button
              variant='link'
              size='sm'
              className='text-info p-0 me-2'
              onClick={() => handlePreviewDocument(docs[0])}
            >
              <FaEye />
            </Button>
            <Button
              variant='link'
              size='sm'
              className='text-danger p-0'
              onClick={() => handleDeleteDocument(docs[0])}
              disabled={deletingDocId === docs[0].document_id}
            >
              {deletingDocId === docs[0].document_id ? <Spinner size='sm' /> : <FaTrash />}
            </Button>
          </div>
        </div>
      ) : (
        <Form.Control
          type='file'
          accept='application/pdf'
          onChange={(e) => handleSingleFileChange(e, docType)}
          className='mb-2'
        />
      )}
    </Form.Group>
  );

  return (
    <Card className='mb-3 border-0 shadow-sm'>
      <Card.Body>
        <h6 className='mb-3 text-muted'>Dokumen Wajib (PDF)</h6>
        <Row>
          <Col md={4}>
            {renderDocUploader(
              'Payment Voucher (PV)',
              <FaReceipt className='text-primary' />,
              'pv',
              pvDocs,
              pvAttachments
            )}
          </Col>
          <Col md={4}>
            {renderDocUploader(
              'Purchase Order (PO)',
              <FaShoppingCart className='text-success' />,
              'po',
              poDocs,
              poAttachments
            )}
          </Col>
          <Col md={4}>
            {renderDocUploader(
              'Invoice',
              <FaFileInvoice className='text-warning' />,
              'invoice',
              invoiceDocs,
              invoiceAttachments
            )}
          </Col>
        </Row>

        {/* Remaining General Documents (Legacy) */}
        {remainingGeneralDocs.length > 0 && (
          <>
            <hr />
            <p className='text-muted small mb-2'>Dokumen Lainnya (Legacy):</p>
            {remainingGeneralDocs.map((doc) => (
              <div
                key={doc.document_id}
                className='d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded'
              >
                <span className='small text-truncate' title={doc.original_name || doc.file_name}>
                  <FaFilePdf className='text-secondary me-2' />
                  {doc.original_name || doc.file_name}
                </span>
                <div>
                  <Button
                    variant='link'
                    size='sm'
                    className='text-info p-0 me-2'
                    onClick={() => handlePreviewDocument(doc)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    variant='link'
                    size='sm'
                    className='text-danger p-0'
                    onClick={() => handleDeleteDocument(doc)}
                    disabled={deletingDocId === doc.document_id}
                  >
                    {deletingDocId === doc.document_id ? <Spinner size='sm' /> : <FaTrash />}
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Other Attachments */}
        {attachments.filter((f) => !f.documentType).length > 0 && (
          <>
            <hr />
            <p className='text-muted small mb-2'>Lampiran Tambahan:</p>
            {attachments
              .filter((f) => !f.documentType)
              .map((file, i) => (
                <div
                  key={i}
                  className='d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded'
                >
                  <span className='text-success small text-truncate' title={file.name}>
                    <FaPaperclip className='me-2' />
                    {file.name}
                  </span>
                  <Button
                    variant='link'
                    size='sm'
                    className='text-danger p-0'
                    onClick={() => removeAttachment(attachments.indexOf(file))}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default DocumentSection;
