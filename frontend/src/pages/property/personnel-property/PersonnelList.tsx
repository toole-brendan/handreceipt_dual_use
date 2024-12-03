// frontend/src/pages/property/personnel-property/PersonnelList.tsx
import React from 'react';
import { Personnel } from '@/types/personnel';

interface PersonnelListProps {
  unitId: string;
  onPersonSelect: (personnelId: string) => void;
  selectedPerson: string | null;
  showSensitiveItems: boolean;
}

const mockPersonnel: Personnel[] = [
  {
    id: 'P001',
    rank: 'SSG',
    firstName: 'John',
    lastName: 'Smith',
    dodId: '1234567890',
    unitId: '1PLT',
    platoon: '1st Platoon',
    squad: '1st Squad',
    position: 'Squad Leader',
    isCommander: false,
    isPrimaryHandReceipt: true,
    propertyAccess: {
      canSignFor: true,
      canTransfer: true,
      canInventory: true,
      sensitiveItems: true
    },
    propertyStats: {
      propertyCount: 25,
      sensitiveItemCount: 5,
      totalValue: 50000,
      pendingTransfers: 0
    },
    inventoryStatus: {
      lastInventory: '2023-11-15T08:00:00Z',
      nextInventoryDue: '2023-12-15T08:00:00Z',
      overdueCount: 0,
      cycleComplete: true
    },
    contact: {
      email: 'john.smith@army.mil'
    },
    status: 'present',
    clearance: 'SECRET'
  }
];

export const PersonnelList: React.FC<PersonnelListProps> = ({ 
  unitId, 
  onPersonSelect, 
  selectedPerson,
  showSensitiveItems
}) => {
  // Filter personnel by unit
  const personnel = mockPersonnel.filter(p => p.unitId === unitId);

  // Group personnel by platoon
  const groupedPersonnel = personnel.reduce((acc: Record<string, Personnel[]>, person) => {
    const platoon = person.platoon || 'Unassigned';
    if (!acc[platoon]) {
      acc[platoon] = [];
    }
    acc[platoon].push(person);
    return acc;
  }, {});

  return (
    <div className="personnel-list">
      <h3>Unit Personnel</h3>
      {Object.entries(groupedPersonnel).map(([platoon, platoonPersonnel]) => (
        <div key={platoon} className="platoon-section">
          <h4 className="platoon-header">{platoon}</h4>
          <div className="personnel-grid">
            {platoonPersonnel.map((person: Personnel) => (
              <div 
                key={person.id}
                className={`personnel-card ${selectedPerson === person.id ? 'selected' : ''}`}
                onClick={() => onPersonSelect(person.id)}
              >
                <div className="personnel-header">
                  <span className="rank-badge">{person.rank}</span>
                  {person.dutyPosition && (
                    <span className="duty-badge">{person.dutyPosition}</span>
                  )}
                </div>
                <h3>{person.lastName}, {person.firstName}</h3>
                <div className="personnel-details">
                  <p className="position">{person.position}</p>
                  <p className="section">{person.section}</p>
                </div>
                <div className="property-stats">
                  <div className="stat">
                    <span className="stat-value">{person.propertyStats.propertyCount || 0}</span>
                    <span className="stat-label">Items</span>
                  </div>
                  {showSensitiveItems && (
                    <div className="stat sensitive">
                      <span className="stat-value">{person.propertyStats.sensitiveItemCount || 0}</span>
                      <span className="stat-label">Sensitive</span>
                    </div>
                  )}
                  {person.propertyStats.pendingTransfers > 0 && (
                    <div className="stat pending">
                      <span className="stat-value">{person.propertyStats.pendingTransfers}</span>
                      <span className="stat-label">Pending</span>
                    </div>
                  )}
                </div>
                {person.inventoryStatus.lastInventory && (
                  <div className="inventory-status">
                    Last Inventory: {new Date(person.inventoryStatus.lastInventory).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonnelList;