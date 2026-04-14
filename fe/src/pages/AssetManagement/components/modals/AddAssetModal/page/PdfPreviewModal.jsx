import React, { useMemo, useEffect } from 'react';
import { Modal } from 'react-bootstrap';

export const resolveDocumentUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (/^(https?:)?\/\//i.test(fileUrl) || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) return fileUrl;
  const API_ORIGIN = process.env.REACT_APP_API_BASE_URL?.replace(/\/api\/?$/, '').replace(/\/+$/, '') || 'https://localhost:5002';
  return `${API_ORIGIN}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};

const PdfPreviewModal = ({ show, onHide, document }) => {
  const fileUrl = useMemo(() => {
    if (!document?.file_url) return null;
    if (document.blobUrl && document.blobUrl.startsWith('blob:')) return document.blobUrl;
    return resolveDocumentUrl(document.file_url);
  }, [document?.file_url, document?.blobUrl]);
  useEffect(() => () => { if (document?.blobUrl && document.blobUrl.startsWith('blob:')) URL.revokeObjectURL(document.blobUrl); }, [document?.blobUrl]);
  if (!show || !document) return null;
  return <Modal show={show} onHide={onHide} size='xl' centered><Modal.Header closeButton className='bg-dark text-white'><Modal.Title>{document.original_name || document.file_name || 'PDF Preview'}</Modal.Title></Modal.Header><Modal.Body style={{ height: '80vh', padding: 0 }}>{fileUrl ? <iframe src={fileUrl} title={document.original_name || document.file_name || 'PDF Preview'} style={{ width: '100%', height: '100%', border: 'none' }} /> : <div className='d-flex justify-content-center align-items-center h-100'><p className='text-muted'>Tidak dapat memuat pratinjau dokumen.</p></div>}</Modal.Body></Modal>;
};
export default PdfPreviewModal;
