import React from 'react';
import type { SensitiveItem } from '@/types/property';
import '@/styles/components/sensitive-items/sensitive-table.css';

interface SensitiveItemsTableProps {
  items: SensitiveItem[];
  onVerify: (id: string) => void;
  onViewDetails: (id: string) => void;
  onReportIssue: (id: string) => void;
}

export const SensitiveItemsTable: React.FC<SensitiveItemsTableProps> = ({
  items,
  onVerify,
  onViewDetails,
  onReportIssue,
}) => {
  return (
    <div className="sensitive-table-container">
      <table className="table sensitive-table">
        <thead>
          <tr>
            <th style={{ minWidth: '180px' }}>ITEM</th>
            <th style={{ minWidth: '100px' }}>SERIAL #</th>
            <th style={{ minWidth: '80px' }}>TYPE</th>
            <th style={{ minWidth: '100px' }}>LAST CHECK</th>
            <th style={{ minWidth: '100px' }}>NEXT CHECK</th>
            <th style={{ minWidth: '100px' }}>LOCATION</th>
            <th style={{ minWidth: '90px' }}>STATUS</th>
            <th style={{ minWidth: '320px' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="item-cell">
                  <span className="sensitive-icon">⚠️</span>
                  <span>{item.name}</span>
                </div>
              </td>
              <td>
                <span className="serial-number table-cell-monospace">{item.serialNumber}</span>
              </td>
              <td>{item.category}</td>
              <td>{new Date(item.verificationSchedule.lastVerification).toLocaleDateString()}</td>
              <td>{new Date(item.verificationSchedule.nextVerification).toLocaleDateString()}</td>
              <td>{item.location || 'N/A'}</td>
              <td>
                <span className={`sensitive-status sensitive-status--${item.verificationStatus?.toLowerCase()}`}>
                  {item.verificationStatus}
                </span>
              </td>
              <td>
                <div className="sensitive-actions">
                  <button
                    onClick={() => onVerify(item.id)}
                    className="verify-button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Verify Now
                  </button>
                  <button
                    onClick={() => onViewDetails(item.id)}
                    className="details-button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-default)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onReportIssue(item.id)}
                    className="report-button"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: 'var(--status-error)',
                      border: '1px solid var(--status-error)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Report Issue
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SensitiveItemsTable;
