import React from 'react';

const ResponsiveTable = ({ children, className = '' }) => {
  return (
    <div className={`table-responsive-wrapper ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveTable;
