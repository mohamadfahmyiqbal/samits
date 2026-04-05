import React from 'react';
import PropTypes from 'prop-types';

const Overlay = ({ onClose, className = '' }) => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  return (
    <button
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${className}`}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
      aria-label="Tutup sidebar"
    />
  );
};

Overlay.propTypes = {
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Overlay;

