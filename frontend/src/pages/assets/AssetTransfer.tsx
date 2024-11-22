// frontend/src/pages/assets/AssetTransfer.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Asset, TransferRecord } from '../../types/asset';
import { transactionService, TransferRequest } from '../../services/transactions';
import '@/ui/styles/pages/assets/asset-transfer.css';

interface TransferFormData extends TransferRequest {
  digitalSignature: string;
  attachments?: File[];
}

const AssetTransfer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<TransferFormData>({
    toCustodian: '',
    handReceipt: '',
    digitalSignature: '',
    notes: '',
  });
  const [transferHistory, setTransferHistory] = useState<TransferRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      // Fetch asset details
      fetch(`/api/assets/${id}`)
        .then(res => res.json())
        .then(data => setAsset(data))
        .catch(console.error);

      // Fetch transfer history
      transactionService.getTransferHistory(id)
        .then(setTransferHistory)
        .catch(console.error);
    }
  }, [id]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !asset) return;

    setIsSubmitting(true);
    try {
      const transfer = await transactionService.initiateTransfer(id, {
        toCustodian: formData.toCustodian,
        handReceipt: formData.handReceipt,
        notes: formData.notes,
      });

      // Verify the transfer was recorded on the blockchain
      await transactionService.verifyTransfer(id, transfer.digitalSignature);

      alert('Asset transfer initiated and verified successfully');
      navigate(`/assets/${id}`);
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Failed to complete transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="asset-transfer">
      <div className="asset-transfer-header">
        <h2>Asset Transfer - Asset ID: {id}</h2>
      </div>
      
      <form onSubmit={handleTransfer} className="transfer-form">
        {/* Destination Selection */}
        <div className="form-group">
          <label htmlFor="destination">Select Destination Custodian*</label>
          <select
            id="destination"
            name="destination"
            className={`form-input ${validationErrors.destination ? 'error' : ''}`}
            value={formData.destination}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Custodian --</option>
            {custodians.map((custodian) => (
              <option key={custodian.id} value={custodian.id}>
                {custodian.name} - {custodian.department} (Clearance: {custodian.clearanceLevel})
              </option>
            ))}
          </select>
          {validationErrors.destination && (
            <span className="error-message">{validationErrors.destination}</span>
          )}
        </div>

        {/* ... other form fields with validation messages ... */}

        {/* File Attachments */}
        <div className="form-group">
          <label htmlFor="attachments">Supporting Documents</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            className="form-input"
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.png"
          />
          <small>Supported formats: PDF, DOC, DOCX, JPG, PNG</small>
        </div>

        {/* Additional Notes */}
        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            className="form-input"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional information about the transfer..."
          />
        </div>

        {/* Chain of Custody */}
        <div className="chain-of-custody">
          <h3>Chain of Custody</h3>
          <div className="custody-info">
            <p>
              <strong>Current Custodian:</strong> {currentCustodian || 'N/A'}
            </p>
            <p>
              <strong>Previous Custodian:</strong> {previousCustodian || 'N/A'}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate(`/assets/${id}`)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Initiate Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetTransfer;