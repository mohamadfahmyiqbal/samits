import React from 'react';
import PropTypes from 'prop-types';

const Overlay = ({
  onClose,
  className = '',
}) => {
  const handleEscape =
    React.useCallback(
      (e) => {
        if (
          e.key === 'Escape'
        ) {
          onClose();
        }
      },
      [onClose]
    );

  const handleKeyDown =
    React.useCallback(
      (e) => {
        if (
          e.key === 'Enter' ||
          e.key === ' '
        ) {
          e.preventDefault();
          onClose();
        }
      },
      [onClose]
    );

  React.useEffect(() => {
    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () =>
      document.removeEventListener(
        'keydown',
        handleEscape
      );
  }, [handleEscape]);

  return (
    <button
      type="button"
      className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden ${className}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      aria-label="Tutup sidebar"
    />
  );
};

Overlay.propTypes = {
  onClose:
    PropTypes.func.isRequired,
  className:
    PropTypes.string,
};

export default Overlay;