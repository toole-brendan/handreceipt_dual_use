import React from 'react';
import { FiEdit2, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { Asset } from '../../../types/asset';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { AuthState, UserRole } from '../../../types/auth';

interface AssetActionsProps {
  asset: Asset;
}

export const AssetActions: React.FC<AssetActionsProps> = ({ asset }) => {
  const { role } = useSelector<RootState, AuthState>((state) => state.auth);

  const handleEdit = () => {
    console.log('Edit asset:', asset.id);
  };

  const handleVerify = () => {
    console.log('Verify asset:', asset.id);
  };

  const handleDelete = () => {
    console.log('Delete asset:', asset.id);
  };

  if (!asset) return null;

  return (
    <div className="action-buttons">
      {(role === 'Admin' || role === 'Command') && (
        <button 
          className="btn-icon" 
          title="Edit" 
          onClick={handleEdit}
          type="button"
        >
          <FiEdit2 />
        </button>
      )}
      <button 
        className="btn-icon" 
        title="Verify" 
        onClick={handleVerify}
        type="button"
      >
        <FiCheckCircle />
      </button>
      {role === 'Admin' && (
        <button 
          className="btn-icon" 
          title="Delete" 
          onClick={handleDelete}
          type="button"
        >
          <FiTrash2 />
        </button>
      )}
    </div>
  );
}; 