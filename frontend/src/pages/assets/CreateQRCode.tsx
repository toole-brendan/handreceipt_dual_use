import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ReportClassificationBadge } from '@/ui/components/reports/ReportClassificationBadge';
import '@/ui/styles/assets/create-qr-code.css';

interface AssetFormData {
  name: string;
  serialNumber: string;
  description: string;
  category: string;
  subCategory: string;
  manufacturer: string;
  model: string;
  classification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  location: string;
  notes: string;
}

const EQUIPMENT_CATEGORIES = {
  'COMMUNICATIONS': ['Radios', 'Satellites', 'Phones', 'Network Equipment'],
  'WEAPONS': ['Small Arms', 'Artillery', 'Ammunition', 'Accessories'],
  'VEHICLES': ['Ground Vehicles', 'Aircraft', 'Watercraft', 'Support Equipment'],
  'ELECTRONICS': ['Computers', 'Sensors', 'Surveillance', 'Testing Equipment'],
  'MEDICAL': ['First Aid', 'Field Equipment', 'Supplies', 'Diagnostic Tools'],
  'PROTECTIVE': ['Body Armor', 'Helmets', 'NBC Equipment', 'Safety Gear'],
  'LOGISTICS': ['Tools', 'Containers', 'Material Handling', 'Storage'],
  'OTHER': ['Miscellaneous', 'Office Equipment', 'Training Materials']
};

const CreateQRCode: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    serialNumber: '',
    description: '',
    category: '',
    subCategory: '',
    manufacturer: '',
    model: '',
    classification: 'UNCLASSIFIED',
    condition: 'NEW',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setQrCode(data.data.qrCode);
      } else {
        setError(data.message || 'Failed to create asset');
      }
    } catch (error) {
      setError('Error creating QR code. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qr-code-generator">
      <div className="qr-header">
        <h2>Create QR Code for Asset</h2>
        <ReportClassificationBadge level={formData.classification} />
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="qr-form-container">
        <form onSubmit={handleSubmit}>
          <div className="qr-form-grid">
            {/* Left Column */}
            <div>
              <div className="form-group">
                <label>Asset Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Serial Number*</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category*</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    category: e.target.value,
                    subCategory: ''
                  }))}
                  required
                >
                  <option value="">Select Category</option>
                  {Object.keys(EQUIPMENT_CATEGORIES).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {formData.category && (
                <div className="form-group">
                  <label>Sub-Category</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                  >
                    <option value="">Select Sub-Category</option>
                    {EQUIPMENT_CATEGORIES[formData.category as keyof typeof EQUIPMENT_CATEGORIES].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div>
              <div className="form-group">
                <label>Classification*</label>
                <select
                  value={formData.classification}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    classification: e.target.value as AssetFormData['classification']
                  }))}
                  required
                >
                  <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="SECRET">SECRET</option>
                  <option value="TOP_SECRET">TOP SECRET</option>
                </select>
              </div>

              <div className="form-group">
                <label>Condition*</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    condition: e.target.value as AssetFormData['condition']
                  }))}
                  required
                >
                  <option value="NEW">NEW</option>
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="FAIR">FAIR</option>
                  <option value="POOR">POOR</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </form>
      </div>

      {qrCode && (
        <div className="qr-preview">
          <div className="qr-code-container">
            <QRCodeSVG
              value={qrCode}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="qr-details">
              <p className="asset-name">{formData.name}</p>
              <p className="serial-number">SN: {formData.serialNumber}</p>
              <p className="category">{formData.category} - {formData.subCategory}</p>
              <ReportClassificationBadge level={formData.classification} />
            </div>
          </div>
          
          <div className="qr-actions">
            <button onClick={handlePrint} className="btn-secondary">
              Print QR Code
            </button>
            <button onClick={() => setQrCode(null)} className="btn-secondary">
              Generate New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQRCode;
