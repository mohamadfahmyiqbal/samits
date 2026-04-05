import React from 'react';
import AssetTable from '../asset/tables/AssetTable';

export default function AssetTableWrapper(props) {
  try {
    return <AssetTable {...props} />;
  } catch (error) {
    console.error('AssetTableWrapper error:', error);
    return (
      <div className="alert alert-danger">
        <h4>Error loading Asset Table</h4>
        <p>{error.message}</p>
      </div>
    );
  }
}
