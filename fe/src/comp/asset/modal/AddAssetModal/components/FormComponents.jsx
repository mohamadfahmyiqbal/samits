import React from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { customSelectStyles } from '../constants/assetConstants';

// Section Header Component
export const SectionHeader = ({ icon: Icon, title }) => (
  <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
    <Icon className="text-primary" />
    <h6 className="mb-0 fw-semibold">{title}</h6>
  </div>
);

// Optimized Select Component
export const OptimizedSelect = ({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  placeholder, 
  isLoading = false, 
  isDisabled, 
  isSearchable = false, 
  required = false, 
  error 
}) => {
  // Loose matching dengan type coercion untuk fix Main Type issue
  const findOption = (opts, val) => {
    if (!val) return null;
    const stringValue = String(val);
    return opts.find(o => String(o.value) === stringValue) || null;
  };

  const selectedOption = findOption(options, value);

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      <Select
        options={options}
        value={selectedOption}
        onChange={(opt) => onChange(opt?.value)}
        placeholder={placeholder || (options.length === 0 ? 'Memuat...' : 'Pilih...')}
        isLoading={isLoading || options.length === 0}
        isDisabled={isDisabled}
        isSearchable={isSearchable}
        noOptionsMessage={() => options.length === 0 ? 'Data sedang dimuat...' : 'Tidak ada opsi'}
        styles={{
          ...customSelectStyles,
          control: (base, state) => ({
            ...customSelectStyles.control(base, state),
            borderColor: error ? '#dc3545' : state.isFocused ? '#0b6bcb' : '#dcdcdc',
            minHeight: '36px',
            height: '36px',
            opacity: isLoading ? 0.7 : 1,
          }),
          valueContainer: (base) => ({
            ...base,
            padding: '0px 8px',
            height: '34px',
          }),
          input: (base) => ({
            ...base,
            margin: 0,
          }),
          singleValue: (base) => ({
            ...base,
            lineHeight: '34px',
          }),
        }}
        aria-label={`${label} - ${selectedOption?.label || value || placeholder}`}
      />
      {error && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {error}
        </Form.Control.Feedback>
      )}
      {options.length === 0 && !isLoading && (
        <Form.Text className="text-muted small">
          Tidak ada data tersedia
        </Form.Text>
      )}
    </Form.Group>
  );
};

// File Attachment List Component
export const AttachmentList = ({ attachments, onRemove }) => (
  <>
    {attachments.length > 0 && (
      <div className="mt-2">
        {attachments.map((file, index) => (
          <div 
            key={index} 
            className="d-flex align-items-center justify-content-between p-2 mb-2 bg-light rounded"
          >
            <span className="text-success d-flex align-items-center gap-2">
              <i className="fa fa-paperclip" />
              <span className="text-truncate" style={{ maxWidth: '300px' }} title={file.name}>
                {file.name}
              </span>
              <span className="text-muted small">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </span>
            <button
              type="button"
              className="btn btn-link text-danger p-0 ms-2"
              onClick={() => onRemove(index)}
              aria-label={`Hapus lampiran ${file.name}`}
              style={{ textDecoration: 'none' }}
            >
              <i className="fa fa-times" />
            </button>
          </div>
        ))}
      </div>
    )}
  </>
);

