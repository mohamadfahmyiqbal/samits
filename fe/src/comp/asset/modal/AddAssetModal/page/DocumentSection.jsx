import React from 'react';
import { Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import { FaPaperclip, FaFilePdf, FaEye, FaTrash } from 'react-icons/fa';
import { alertSuccess, alertError, alertWarning } from '../../../../Notification';

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
  alertWarningRef = alertWarning
}) => {
  return (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Body>
        <Row>
          <Col md={12}>
            <Form.Group controlId="attachments">
              <Form.Label>Lampiran PDF</Form.Label>
              <Form.Control 
                type="file" 
                accept="application/pdf" 
                multiple 
                onChange={(e) => handleFileChange(e, alertWarningRef)}
                className="mb-3" 
              />
              {/* New Attachments */}
              {attachments.length > 0 && (
                <div className="mb-3">
                  {attachments.map((file, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded">
                      <span className="text-success small text-truncate" title={file.name}>
                        <FaPaperclip className="me-2" />{file.name}
                      </span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-danger p-0" 
                        onClick={() => removeAttachment(i)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Existing Documents */}
              {existingDocuments.length > 0 && (
                <div className="mb-3">
                  <p className="text-muted small mb-2">Dokumen Tersimpan:</p>
                  {existingDocuments.map((doc) => (
                    <div key={doc.document_id} className="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded">
                      <span className="small text-truncate" title={doc.original_name || doc.file_name}>
                        <FaFilePdf className="text-danger me-2" />
                        {doc.original_name || doc.file_name}
                      </span>
                      <div>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-info p-0 me-2" 
                          onClick={() => handlePreviewDocument(doc)}
                        >
                          <FaEye />
                        </Button>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-danger p-0" 
                          onClick={() => handleDeleteDocument(doc)} 
                          disabled={deletingDocId === doc.document_id}
                        >
                          {deletingDocId === doc.document_id ? <Spinner size="sm" /> : <FaTrash />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DocumentSection;

