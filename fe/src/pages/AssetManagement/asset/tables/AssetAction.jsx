import React from 'react';
import { FaEye, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import '../../../../styles/AssetAction.css';

export default function AssetAction({ item, onUpdate, onDelete, onDetail, onHistory }) {
  return (
    <div className='asset-action'>
      {onHistory && (
        <FaHistory className='detail-icon' title='History' onClick={() => onHistory(item)} />
      )}
      {onDetail && <FaEye className='detail-icon' title='Detail' onClick={() => onDetail(item)} />}
      {onUpdate && <FaEdit className='update-icon' title='Update' onClick={() => onUpdate(item)} />}
      {onDelete && (
        <FaTrash className='delete-icon' title='Delete' onClick={() => onDelete(item)} />
      )}
    </div>
  );
}
