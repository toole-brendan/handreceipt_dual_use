import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/pages/maintenance/maintenance-form.css';

interface Item {
  id: string;
  name: string;
  serialNumber: string;
}

interface MaintenanceRequestForm {
  itemId: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  images: File[];
  notes?: string;
}

const NewMaintenanceRequest: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock items data - replace with actual API call
  const items: Item[] = [
    { id: '1', name: 'M4A1 Carbine', serialNumber: 'M4-2023-001' },
    { id: '2', name: 'ACOG Scope', serialNumber: 'ACOG-2023-123' },
    { id: '3', name: 'Plate Carrier', serialNumber: 'PC-2023-047' }
  ];

  const [formData, setFormData] = useState<MaintenanceRequestForm>({
    itemId: '',
    description: '',
    priority: 'Low',
    images: [],
    notes: ''
  });

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
      if (!isValid) {
        alert('Please only upload image files (PNG or JPG) up to 10MB in size.');
      }
      return isValid;
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => {
        const isValid = file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
        if (!isValid) {
          alert('Please only upload image files (PNG or JPG) up to 10MB in size.');
        }
        return isValid;
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    
    // Navigate back to maintenance page after submission
    navigate('/maintenance');
  };

  return (
    <div className="maintenance-form-page">
      <div className="form-header">
        <button 
          className="back-button"
          onClick={() => navigate('/maintenance')}
        >
          <i className="material-icons">chevron_left</i>
          Back
        </button>
        <h1>New Maintenance Request</h1>
      </div>

      <form onSubmit={handleSubmit} className="maintenance-form">
        <div className="form-group">
          <label htmlFor="itemId">Select Item *</label>
          <select
            id="itemId"
            value={formData.itemId}
            onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
            required
          >
            <option value="">Select an item</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.serialNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Issue Description *</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the issue in detail..."
            required
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority Level *</label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              priority: e.target.value as MaintenanceRequestForm['priority']
            }))}
            required
          >
            <option value="Low">Low - Routine maintenance/minor issues</option>
            <option value="Medium">Medium - Affecting performance but still works</option>
            <option value="High">High - Non-functional or safety concern</option>
          </select>
        </div>

        <div className="form-group">
          <label>Images</label>
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-instructions">
              <i className="material-icons">cloud_upload</i>
              <p>Drag and drop images here or click to browse</p>
              <span>Accepts PNG and JPG files up to 10MB each</span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="file-input"
            />
          </div>
          {formData.images.length > 0 && (
            <div className="image-preview">
              {formData.images.map((file, index) => (
                <div key={index} className="image-item">
                  <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    <i className="material-icons">close</i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMaintenanceRequest; 