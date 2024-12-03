import React, { useEffect } from 'react';
import { InventoryCheck } from '../../types/dashboard';
import '@/styles/components/dashboard/roles/officer.css';

interface InventoryCalendarProps {
  inventoryChecks: InventoryCheck[];
}

const InventoryCalendar: React.FC<InventoryCalendarProps> = ({ inventoryChecks }) => {
  useEffect(() => {
    console.log('Raw Inventory Checks:', inventoryChecks);
  }, [inventoryChecks]);

  const nextSixChecks = inventoryChecks
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  useEffect(() => {
    console.log('Filtered Checks:', nextSixChecks);
  }, [nextSixChecks]);

  if (!inventoryChecks || inventoryChecks.length === 0) {
    return (
      <section className="dashboard-section inventory-section" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Cyclic/SI Inventory Calendar</h2>
        <div style={{ color: '#ffffff' }}>No inventory checks available</div>
        <pre style={{ color: '#ffffff', fontSize: '12px' }}>
          {JSON.stringify({ inventoryChecks }, null, 2)}
        </pre>
      </section>
    );
  }

  return (
    <section className="dashboard-section inventory-section" style={{ 
      background: '#1e1e1e', 
      padding: '12px',
      borderRadius: '8px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h2 style={{ 
        color: '#ffffff', 
        marginBottom: '12px',
        fontSize: '16px',
        fontWeight: 500
      }}>Cyclic/SI Inventory Calendar</h2>
      
      <div className="inventory-actions" style={{ 
        marginBottom: '12px', 
        display: 'flex', 
        gap: '8px'
      }}>
        <button className="action-button" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          padding: '6px 12px',
          background: '#2d2d2d',
          border: 'none',
          borderRadius: '4px',
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: '13px'
        }}>
          <span className="material-icons" style={{ fontSize: '16px' }}>calendar_today</span>
          View Full Calendar
        </button>
        <button className="action-button" style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          padding: '6px 12px',
          background: '#2d2d2d',
          border: 'none',
          borderRadius: '4px',
          color: '#ffffff',
          cursor: 'pointer',
          fontSize: '13px'
        }}>
          <span className="material-icons" style={{ fontSize: '16px' }}>history</span>
          View Past Reports
        </button>
      </div>

      <div style={{ 
        color: '#666', 
        fontSize: '11px', 
        marginBottom: '8px' 
      }}>
        Total checks: {inventoryChecks.length}, Filtered: {nextSixChecks.length}
      </div>

      <div className="inventory-timeline" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px'
      }}>
        {nextSixChecks.map((check) => (
          <div 
            key={check.id} 
            className={`inventory-card ${check.type.toLowerCase() === 'cyclic' ? 'cyclic' : 'sensitive'}`}
            style={{
              background: '#2d2d2d',
              borderRadius: '6px',
              padding: '10px',
              borderLeft: `2px solid ${check.type === 'Cyclic' ? '#1a73e8' : '#f29900'}`,
              fontSize: '13px'
            }}
          >
            <div className="inventory-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '8px'
            }}>
              <div className={`check-type ${check.type.toLowerCase()}`} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                color: check.type === 'Cyclic' ? '#1a73e8' : '#f29900',
                fontSize: '13px'
              }}>
                <span className="material-icons" style={{ fontSize: '16px' }}>
                  {check.type === 'Cyclic' ? 'repeat' : 'security'}
                </span>
                {check.type}
              </div>
              <span className={`status-badge status-${check.lastCheckStatus.toLowerCase()}`} style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 500,
                background: check.lastCheckStatus === 'Completed' ? '#1e8e3e33' : '#f2990033',
                color: check.lastCheckStatus === 'Completed' ? '#1e8e3e' : '#f29900'
              }}>
                {check.lastCheckStatus}
              </span>
            </div>

            <div className="inventory-details" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'auto 1fr', 
              gap: '4px 12px',
              margin: '8px 0',
              color: '#ffffff',
              fontSize: '12px'
            }}>
              <span className="detail-label" style={{ color: '#9aa0a6' }}>Date:</span>
              <span className="detail-value">
                {new Date(check.date).toLocaleDateString()}
              </span>
              
              <span className="detail-label" style={{ color: '#9aa0a6' }}>Time:</span>
              <span className="detail-value">{check.time}</span>
              
              <span className="detail-label" style={{ color: '#9aa0a6' }}>Location:</span>
              <span className="detail-value">{check.location}</span>
              
              <span className="detail-label" style={{ color: '#9aa0a6' }}>Officer:</span>
              <span className="detail-value">{check.assignedOfficer}</span>
            </div>

            <div className="inventory-actions-group" style={{ 
              display: 'flex', 
              gap: '6px', 
              marginTop: '8px'
            }}>
              {check.lastCheckStatus === 'Completed' ? (
                <button 
                  className="action-button"
                  onClick={() => check.reportUrl && window.open(check.reportUrl)}
                  style={{
                    padding: '4px 10px',
                    background: '#1a73e8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '14px' }}>description</span>
                  View Report
                </button>
              ) : (
                <>
                  <button className="action-button primary" style={{
                    padding: '4px 10px',
                    background: '#1a73e8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>playlist_add_check</span>
                    Start Check
                  </button>
                  <button className="action-button" style={{
                    padding: '4px 10px',
                    background: '#2d2d2d',
                    color: '#ffffff',
                    border: '1px solid #5f6368',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}>
                    <span className="material-icons" style={{ fontSize: '14px' }}>edit_calendar</span>
                    Reschedule
                  </button>
                </>
              )}
            </div>

            {check.lastCheckStatus === 'Pending' && (
              <div className="check-reminder" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#f29900',
                fontSize: '11px',
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #5f6368'
              }}>
                <span className="material-icons" style={{ fontSize: '14px' }}>schedule</span>
                {Math.ceil((new Date(check.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days until due
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default InventoryCalendar; 