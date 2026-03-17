import React, { useEffect, useCallback } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { FaExpand, FaCompress, FaDownload } from 'react-icons/fa';
import { resolveDocumentUrl } from '../page/AssetFormModal';

const PdfPreviewModal = ({ show, onHide, document }) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [blobUrl, setBlobUrl] = React.useState(null);
  const iframeRef = React.useRef(null);

  const loadDocument = useCallback(async () => {
    if (!document?.file_url) {
      setError('Dokumen tidak valid');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const resolvedUrl = resolveDocumentUrl(document.file_url);
      const response = await fetch(resolvedUrl, { 
        credentials: 'include',
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (err) {
      console.error('PDF Load Error:', err);
      setError(`Gagal memuat dokumen: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [document]);

  useEffect(() => {
    if (show) {
      loadDocument();
    } else {
      // Cleanup blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
  }, [show, loadDocument, blobUrl]);

  const handleDownload = () => {
    if (document?.file_url) {
      const link = document.createElement('a');
      link.href = blobUrl || resolveDocumentUrl(document.file_url);
      link.download = document.original_name || document.file_name || 'document.pdf';
      link.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onHide();
    } else if (e.key === 'd' && e.ctrlKey) {
      e.preventDefault();
      handleDownload();
    }
  };

  if (!show || !document) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      centered 
      backdrop="static"
      keyboard={true}
      onKeyDown={handleKeyDown}
      aria-labelledby="pdf-preview-title"
    >
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title id="pdf-preview-title">
          {document.original_name || document.file_name}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0" style={{ height: '70vh' }}>
        {loading && (
          <div className="d-flex justify-content-center align-items-center h-100 bg-light">
            <Spinner animation="border" role="status" className="me-2" />
            <span>Memuat dokumen...</span>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className="m-3">
            <strong>Error: </strong>{error}
            <div className="mt-2">
              <Button variant="outline-danger" size="sm" onClick={loadDocument}>
                Coba lagi
              </Button>
            </div>
          </Alert>
        )}
        
        {!loading && !error && blobUrl && (
          <iframe 
            ref={iframeRef}
            src={blobUrl}
            title={document.original_name || 'PDF Preview'}
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              background: '#f8f9fa'
            }} 
            onLoad={() => setLoading(false)}
          />
        )}
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <div className="d-flex justify-content-between w-100">
          <Button variant="secondary" onClick={onHide}>
            Tutup (ESC)
          </Button>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={handleDownload}
              title="Ctrl+D untuk download"
            >
              <FaDownload /> Download
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PdfPreviewModal;

