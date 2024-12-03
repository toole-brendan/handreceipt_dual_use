import React from 'react';
import { SpecialPropertyAssignment } from '../../types/dashboard';

interface SpecialPropertyAssignmentsProps {
  assignments: SpecialPropertyAssignment[];
}

const SpecialPropertyAssignments: React.FC<SpecialPropertyAssignmentsProps> = ({ assignments }) => {
  return (
    <section className="dashboard-section">
      <h2>Special Property Assignments</h2>

      <div className="assignments-container">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <div className="assignment-header">
              <div className="soldier-info">
                <h4>{assignment.soldier.rank} {assignment.soldier.name}</h4>
                <span className={`qualification-badge status-${assignment.qualificationStatus.toLowerCase()}`}>
                  {assignment.qualificationStatus}
                </span>
              </div>
              <div className="assignment-meta">
                <span className="meta-item">
                  <i className="material-icons">event</i>
                  {new Date(assignment.dateAssigned).toLocaleDateString()}
                </span>
                <span className="meta-item">
                  <i className="material-icons">inventory_2</i>
                  {assignment.items.length} Items
                </span>
              </div>
            </div>

            <div className="assigned-items">
              <h5>Assigned Items</h5>
              <div className="items-list">
                {assignment.items.map((item) => (
                  <div key={item.id} className="item-row">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-serial">SN: {item.serialNumber}</span>
                    </div>
                    <span className={`maintenance-status status-${item.maintenanceStatus.toLowerCase()}`}>
                      {item.maintenanceStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="qualification-info">
              <div className="qualification-details">
                <span className="detail-label">Next Training:</span>
                <span className="detail-value">
                  {new Date(assignment.nextTrainingDate).toLocaleDateString()}
                </span>
              </div>
              {assignment.qualificationStatus === 'Expired' && (
                <div className="alert-message">
                  <i className="material-icons">warning</i>
                  Qualification renewal required
                </div>
              )}
            </div>

            <div className="assignment-actions">
              <button className="action-button">
                <i className="material-icons">description</i>
                View Hand Receipt
              </button>
              <button className="action-button">
                <i className="material-icons">edit</i>
                Update Assignment
              </button>
              <button className="action-button">
                <i className="material-icons">school</i>
                Training Records
              </button>
              {assignment.qualificationStatus === 'Pending' && (
                <button className="action-button primary">
                  <i className="material-icons">verified</i>
                  Verify Qualification
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="section-actions">
        <button className="action-button">
          <i className="material-icons">person_add</i>
          New Assignment
        </button>
        <button className="action-button">
          <i className="material-icons">assessment</i>
          Qualification Report
        </button>
      </div>
    </section>
  );
};

export default SpecialPropertyAssignments; 