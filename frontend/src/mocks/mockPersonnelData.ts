import { Unit, Personnel, PersonnelStatus } from '@/types/personnel';
import { Property, PropertyStatus, PropertyTransfer } from '@/types/property';
import { HandReceipt, HandReceiptItem } from '@/types/handReceipt';

// Helper function to generate DOD IDs
const generateDodId = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

// Helper function to generate NSNs
const generateNsn = () => Math.floor(10000000000 + Math.random() * 90000000000).toString();

// Helper function to generate serial numbers
const generateSerialNumber = (category: string) => `${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

// Helper function to generate timestamps
const generateTimestamps = () => ({
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
});

// Mock property items data
const mockPropertyItems = {
  // ... (keeping all the mockPropertyItems content exactly the same)
  weaponry: [
    { name: 'M4 Carbine', nsn: generateNsn(), category: 'Weaponry', value: 1200 },
    { name: 'M16 Rifle', nsn: generateNsn(), category: 'Weaponry', value: 1000 },
    { name: 'M17 Pistol', nsn: generateNsn(), category: 'Weaponry', value: 800 },
    { name: 'M249 SAW', nsn: generateNsn(), category: 'Weaponry', value: 2500 },
    { name: 'M240B Machine Gun', nsn: generateNsn(), category: 'Weaponry', value: 5000 },
    { name: 'M2 .50 Caliber Machine Gun', nsn: generateNsn(), category: 'Weaponry', value: 10000 },
    { name: 'M203 Grenade Launcher', nsn: generateNsn(), category: 'Weaponry', value: 1500 },
    { name: 'Rifle Combat Optic (RCO)', nsn: generateNsn(), category: 'Weaponry Accessories', value: 900 },
    { name: 'Aimpoint CompM4', nsn: generateNsn(), category: 'Weaponry Accessories', value: 850 },
    { name: 'PVS-14 NOD', nsn: generateNsn(), category: 'Weaponry Accessories', value: 3000 },
    { name: 'Weapon Light', nsn: generateNsn(), category: 'Weaponry Accessories', value: 200 },
    { name: 'Weapon Sling', nsn: generateNsn(), category: 'Weaponry Accessories', value: 50 },
    { name: 'Weapon Cleaning Kit', nsn: generateNsn(), category: 'Weaponry Cleaning', value: 100 },
    { name: 'Ammunition Pouch', nsn: generateNsn(), category: 'Weaponry Accessories', value: 30 }
  ],
  ppe: [
    { name: 'Enhanced Combat Helmet (ECH)', nsn: generateNsn(), category: 'PPE', value: 400 },
    { name: 'Advanced Combat Helmet (ACH)', nsn: generateNsn(), category: 'PPE', value: 350 },
    { name: 'Improved Outer Tactical Vest (IOTV)', nsn: generateNsn(), category: 'PPE', value: 500 },
    { name: 'Modular Scalable Vest (MSV)', nsn: generateNsn(), category: 'PPE', value: 600 },
    { name: 'Ballistic Eyewear', nsn: generateNsn(), category: 'PPE', value: 100 },
    { name: 'Hearing Protection (Earplugs)', nsn: generateNsn(), category: 'PPE', value: 20 },
    { name: 'Combat Gloves', nsn: generateNsn(), category: 'PPE', value: 50 },
    { name: 'Knee Pads', nsn: generateNsn(), category: 'PPE', value: 40 },
    { name: 'Gas Mask', nsn: generateNsn(), category: 'PPE', value: 250 }
  ],
  communication: [
    { name: 'PRC-152 Radio', nsn: generateNsn(), category: 'Communication Equipment', value: 4000 },
    { name: 'PRC-148 MBITR Radio', nsn: generateNsn(), category: 'Communication Equipment', value: 3500 },
    { name: 'SINCGARS Radio', nsn: generateNsn(), category: 'Communication Equipment', value: 2500 },
    { name: 'Radio Headset', nsn: generateNsn(), category: 'Communication Equipment Accessories', value: 150 },
    { name: 'GPS Device (DAGR)', nsn: generateNsn(), category: 'Navigation Equipment', value: 500 },
    { name: 'SATCOM Device', nsn: generateNsn(), category: 'Communication Equipment', value: 6000 }
  ],
  optics: [
    { name: 'Binoculars (10x50)', nsn: generateNsn(), category: 'Optical and Observation Equipment', value: 300 },
    { name: 'Spotting Scope', nsn: generateNsn(), category: 'Optical and Observation Equipment', value: 700 },
    { name: 'PVS-7 NOD', nsn: generateNsn(), category: 'Optical and Observation Equipment', value: 2500 },
    { name: 'Thermal Imaging Device', nsn: generateNsn(), category: 'Optical and Observation Equipment', value: 5000 }
  ],
  navigation: [
    { name: 'Lensatic Compass', nsn: generateNsn(), category: 'Navigation Equipment', value: 80 },
    { name: 'Protractor', nsn: generateNsn(), category: 'Navigation Equipment', value: 10 },
    { name: 'Map Tool Set', nsn: generateNsn(), category: 'Navigation Equipment', value: 25 }
  ],
  fieldGear: [
    { name: 'MOLLE Rucksack', nsn: generateNsn(), category: 'Field Gear', value: 200 },
    { name: 'Assault Pack', nsn: generateNsn(), category: 'Field Gear', value: 100 },
    { name: 'Sleeping Bag', nsn: generateNsn(), category: 'Field Gear', value: 150 },
    { name: 'Sleeping Mat', nsn: generateNsn(), category: 'Field Gear', value: 50 },
    { name: 'Poncho', nsn: generateNsn(), category: 'Field Gear', value: 40 },
    { name: 'Wet Weather Gear Set', nsn: generateNsn(), category: 'Field Gear', value: 120 },
    { name: 'Entrenching Tool (E-Tool)', nsn: generateNsn(), category: 'Field Gear', value: 60 },
    { name: 'Canteen', nsn: generateNsn(), category: 'Field Gear', value: 15 },
    { name: 'Hydration System (CamelBak)', nsn: generateNsn(), category: 'Field Gear', value: 80 },
    { name: 'Mess Kit', nsn: generateNsn(), category: 'Field Gear', value: 30 },
    { name: 'Eating Utensils', nsn: generateNsn(), category: 'Field Gear', value: 10 },
    { name: 'Individual First Aid Kit (IFAK)', nsn: generateNsn(), category: 'Medical Equipment', value: 70 }
  ],
  specializedEquipment: [
    { name: 'Mine Detector', nsn: generateNsn(), category: 'Engineer Equipment', value: 2000 },
    { name: 'Medical Bag', nsn: generateNsn(), category: 'Medical Equipment', value: 300 },
    { name: 'Specialized Comm Antenna', nsn: generateNsn(), category: 'Communications Equipment', value: 1000 },
    { name: 'Vehicle Maintenance Toolkit', nsn: generateNsn(), category: 'Maintenance Tools', value: 500 },
    { name: 'Parachute', nsn: generateNsn(), category: 'Parachute Equipment', value: 3000 },
    { name: 'Scuba Gear Set', nsn: generateNsn(), category: 'Diving Equipment', value: 4000 }
  ],
  specializedUniforms: [
    { name: 'Cold Weather Uniform (ECWCS)', nsn: generateNsn(), category: 'Specialized Uniforms', value: 400 },
    { name: 'Flame Resistant Uniform (FRACU)', nsn: generateNsn(), category: 'Specialized Uniforms', value: 350 },
    { name: 'Flight Suit', nsn: generateNsn(), category: 'Specialized Uniforms', value: 500 },
    { name: 'Dive Suit', nsn: generateNsn(), category: 'Specialized Uniforms', value: 600 },
    { name: 'Combat Boots (Specialized)', nsn: generateNsn(), category: 'Specialized Uniforms', value: 200 }
  ],
  electronicDevices: [
    { name: 'Military Tablet', nsn: generateNsn(), category: 'Electronic Devices', value: 800 },
    { name: 'Ruggedized Laptop', nsn: generateNsn(), category: 'Electronic Devices', value: 1500 },
    { name: 'Military Camera', nsn: generateNsn(), category: 'Electronic Devices', value: 500 }
  ],
  ocieSets: [
    { name: 'OCIE Set (Basic)', nsn: generateNsn(), category: 'OCIE Sets', value: 500 },
    { name: 'Weapon Cleaning Kit Set', nsn: generateNsn(), category: 'OCIE Sets', value: 150 }
  ]
};

// Helper function to create a personnel record
const createPersonnel = (
  id: string,
  rank: string,
  firstName: string,
  lastName: string,
  unit: Unit,
  position: string,
  status: PersonnelStatus = 'ACTIVE'
): Personnel => {
  const assignedProperty: Property[] = [];
  const numItems = Math.floor(Math.random() * 5) + 3; // Assign 3-7 items

  // Randomly assign items from different categories - simplified for now
  const allItems = Object.values(mockPropertyItems).flat();
  for (let i = 0; i < numItems; i++) {
    const itemIndex = Math.floor(Math.random() * allItems.length);
    const item = allItems[itemIndex];
    assignedProperty.push({
      id: generateDodId(), // Using DOD ID for property ID for simplicity
      name: item.name,
      description: `Standard issue ${item.name.toLowerCase()}`,
      serialNumber: generateSerialNumber(item.category),
      nsn: item.nsn,
      category: item.category,
      status: 'SERVICEABLE' as PropertyStatus,
      value: item.value,
      isSensitive: item.category.toLowerCase().includes('weapon') || item.value > 2000,
      lastInventoryCheck: new Date().toISOString(),
      nextInventoryCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return {
    id,
    rank,
    firstName,
    lastName,
    dodId: generateDodId(),
    unit,
    position,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.mil@army.mil`,
    phone: `555-${Math.floor(1000 + Math.random() * 9000)}`,
    status,
    dutyStatus: 'ON_DUTY',
    clearance: 'SECRET',
    assignedProperty,  // Use the generated assignedProperty array
    ...generateTimestamps()
  };
};

export const mockUnits: Unit[] = [
  // Alpha Company
  {
    id: 'ACO',
    name: 'Alpha Company, 1-23 Infantry',
    shortName: 'A Co',
    type: 'company',
    echelon: 'CO',
    commander: {
      id: 'CPT-001',
      firstName: 'James',
      lastName: 'Anderson',
      rank: 'CPT',
      dodId: generateDodId(),
      unit: {} as Unit, // Will be set after unit creation
      email: 'james.anderson.mil@army.mil',
      phone: '555-0101',
      status: 'ACTIVE' as PersonnelStatus,
      dutyStatus: 'ON_DUTY',
      clearance: 'SECRET',
      assignedProperty: [],
      ...generateTimestamps()
    },
    personnel: [],
    property: [],
    ...generateTimestamps(),
    stats: {
      personnelCount: 155,
      equipmentCount: 850,
      sensitiveItemCount: 120,
      pendingTransfers: 8,
      overdueInventories: 2
    },
    lastInventory: '2024-01-15',
    nextInventoryDue: '2024-02-15',
    subUnits: [
      // Company HQ
      {
        id: 'ACO-HQ',
        name: 'HQ, Alpha Company',
        shortName: 'HQ',
        type: 'hq',
        echelon: 'CO-HQ',
        commander: {
          id: '1SG-001',
          firstName: 'Robert',
          lastName: 'Martinez',
          rank: '1SG',
          dodId: generateDodId(),
          unit: {} as Unit,
          email: 'robert.martinez.mil@army.mil',
          phone: '555-0102',
          status: 'ACTIVE' as PersonnelStatus,
          dutyStatus: 'ON_DUTY',
          clearance: 'SECRET',
          assignedProperty: [],
          ...generateTimestamps()
        },
        personnel: [],
        property: [],
        ...generateTimestamps(),
        stats: {
          personnelCount: 10,
          equipmentCount: 50,
          sensitiveItemCount: 15,
          pendingTransfers: 1,
          overdueInventories: 0
        }
      },
      // 1st Platoon
      {
        id: '1PLT',
        name: '1st Platoon, A Co',
        shortName: '1PLT',
        type: 'platoon',
        echelon: 'PLT',
        commander: {
          id: '1LT-001',
          firstName: 'Sarah',
          lastName: 'Wilson',
          rank: '1LT',
          dodId: generateDodId(),
          unit: {} as Unit,
          email: 'sarah.wilson.mil@army.mil',
          phone: '555-0103',
          status: 'ACTIVE' as PersonnelStatus,
          dutyStatus: 'ON_DUTY',
          clearance: 'SECRET',
          assignedProperty: [],
          ...generateTimestamps()
        },
        personnel: [],
        property: [],
        ...generateTimestamps(),
        stats: {
          personnelCount: 48,
          equipmentCount: 280,
          sensitiveItemCount: 35,
          pendingTransfers: 2,
          overdueInventories: 1
        },
        subUnits: [
          {
            id: '1PLT-1SQD',
            name: '1st Squad, 1st Platoon',
            shortName: '1/1',
            type: 'squad',
            echelon: 'SQD',
            commander: {
              id: 'SSG-001',
              firstName: 'Michael',
              lastName: 'Johnson',
              rank: 'SSG',
              dodId: generateDodId(),
              unit: {} as Unit,
              email: 'michael.johnson.mil@army.mil',
              phone: '555-0104',
              status: 'ACTIVE' as PersonnelStatus,
              dutyStatus: 'ON_DUTY',
              clearance: 'SECRET',
              assignedProperty: [],
              ...generateTimestamps()
            },
            personnel: [],
            property: [],
            ...generateTimestamps()
          }
        ]
      },
      // 2nd Platoon
      {
        id: '2PLT',
        name: '2nd Platoon, A Co',
        shortName: '2PLT',
        type: 'platoon',
        echelon: 'PLT',
        commander: {
          id: '1LT-002',
          firstName: 'Christopher',
          lastName: 'Brown',
          rank: '1LT',
          dodId: generateDodId(),
          unit: {} as Unit,
          email: 'christopher.brown.mil@army.mil',
          phone: '555-0105',
          status: 'ACTIVE' as PersonnelStatus,
          dutyStatus: 'ON_DUTY',
          clearance: 'SECRET',
          assignedProperty: [],
          ...generateTimestamps()
        },
        personnel: [],
        property: [],
        ...generateTimestamps(),
        stats: {
          personnelCount: 45,
          equipmentCount: 260,
          sensitiveItemCount: 32,
          pendingTransfers: 3,
          overdueInventories: 0
        }
      },
      // 3rd Platoon
      {
        id: '3PLT',
        name: '3rd Platoon, A Co',
        shortName: '3PLT',
        type: 'platoon',
        echelon: 'PLT',
        commander: {
          id: '1LT-003',
          firstName: 'Jennifer',
          lastName: 'Lee',
          rank: '1LT',
          dodId: generateDodId(),
          unit: {} as Unit,
          email: 'jennifer.lee.mil@army.mil',
          phone: '555-0106',
          status: 'ACTIVE' as PersonnelStatus,
          dutyStatus: 'ON_DUTY',
          clearance: 'SECRET',
          assignedProperty: [],
          ...generateTimestamps()
        },
        personnel: [],
        property: [],
        ...generateTimestamps(),
        stats: {
          personnelCount: 42,
          equipmentCount: 240,
          sensitiveItemCount: 30,
          pendingTransfers: 2,
          overdueInventories: 1
        }
      }
    ]
  }
];

// Fix circular references
mockUnits[0].commander!.unit = mockUnits[0];
mockUnits[0].subUnits!.forEach(subUnit => {
  subUnit.commander!.unit = subUnit;
  if (subUnit.subUnits) {
    subUnit.subUnits.forEach(squad => {
      squad.commander!.unit = squad;
    });
  }
});

// Generate a large list of personnel for testing pagination
export const mockPersonnel: Personnel[] = [
  // Company Leadership
  createPersonnel('CPT-001', 'CPT', 'James', 'Anderson', mockUnits[0], 'Company Commander'),
  createPersonnel('1SG-001', '1SG', 'Robert', 'Martinez', mockUnits[0].subUnits![0], 'First Sergeant'),

  // HQ Staff
  createPersonnel('SFC-001', 'SFC', 'David', 'Clark', mockUnits[0].subUnits![0], 'Operations NCO'),
  createPersonnel('SSG-002', 'SSG', 'Lisa', 'Thompson', mockUnits[0].subUnits![0], 'Supply Sergeant'),
  createPersonnel('SGT-001', 'SGT', 'Mark', 'Davis', mockUnits[0].subUnits![0], 'Training NCO'),
  createPersonnel('SPC-001', 'SPC', 'John', 'Wilson', mockUnits[0].subUnits![0], 'Company Clerk', 'TDY' as PersonnelStatus),
  createPersonnel('PFC-001', 'PFC', 'Emily', 'Brown', mockUnits[0].subUnits![0], 'Supply Clerk'),

  // 1st Platoon
  createPersonnel('1LT-001', '1LT', 'Sarah', 'Wilson', mockUnits[0].subUnits![1], 'Platoon Leader'),
  createPersonnel('SFC-002', 'SFC', 'Michael', 'Taylor', mockUnits[0].subUnits![1], 'Platoon Sergeant'),
  createPersonnel('SSG-003', 'SSG', 'James', 'Anderson', mockUnits[0].subUnits![1], 'Squad Leader'),
  createPersonnel('SGT-002', 'SGT', 'William', 'Moore', mockUnits[0].subUnits![1], 'Team Leader'),
  createPersonnel('CPL-001', 'CPL', 'Joseph', 'White', mockUnits[0].subUnits![1], 'Team Leader', 'LEAVE' as PersonnelStatus),
  createPersonnel('SPC-002', 'SPC', 'Ryan', 'Miller', mockUnits[0].subUnits![1], 'Rifleman'),
  createPersonnel('PFC-002', 'PFC', 'Daniel', 'Jones', mockUnits[0].subUnits![1], 'Rifleman'),
  createPersonnel('PVT-001', 'PVT', 'Thomas', 'Smith', mockUnits[0].subUnits![1], 'Rifleman'),

  // 2nd Platoon
  createPersonnel('1LT-002', '1LT', 'Christopher', 'Brown', mockUnits[0].subUnits![2], 'Platoon Leader'),
  createPersonnel('SFC-003', 'SFC', 'Daniel', 'Miller', mockUnits[0].subUnits![2], 'Platoon Sergeant'),
  createPersonnel('SSG-004', 'SSG', 'Richard', 'Davis', mockUnits[0].subUnits![2], 'Squad Leader'),
  createPersonnel('SGT-003', 'SGT', 'Thomas', 'Garcia', mockUnits[0].subUnits![2], 'Team Leader'),
  createPersonnel('CPL-002', 'CPL', 'Kevin', 'Martinez', mockUnits[0].subUnits![2], 'Team Leader'),
  createPersonnel('SPC-003', 'SPC', 'Andrew', 'Robinson', mockUnits[0].subUnits![2], 'Rifleman'),
  createPersonnel('PFC-003', 'PFC', 'Justin', 'Clark', mockUnits[0].subUnits![2], 'Rifleman'),
  createPersonnel('PVT-002', 'PVT', 'Brandon', 'Lee', mockUnits[0].subUnits![2], 'Rifleman'),

  // 3rd Platoon
  createPersonnel('1LT-003', '1LT', 'Jennifer', 'Lee', mockUnits[0].subUnits![3], 'Platoon Leader'),
  createPersonnel('SFC-004', 'SFC', 'Robert', 'Wilson', mockUnits[0].subUnits![3], 'Platoon Sergeant', 'DEPLOYED' as PersonnelStatus),
  createPersonnel('SSG-005', 'SSG', 'Charles', 'Anderson', mockUnits[0].subUnits![3], 'Squad Leader'),
  createPersonnel('SGT-004', 'SGT', 'Steven', 'Taylor', mockUnits[0].subUnits![3], 'Team Leader'),
  createPersonnel('CPL-003', 'CPL', 'Brian', 'Thomas', mockUnits[0].subUnits![3], 'Team Leader'),
  createPersonnel('SPC-004', 'SPC', 'Eric', 'Walker', mockUnits[0].subUnits![3], 'Rifleman'),
  createPersonnel('PFC-004', 'PFC', 'Matthew', 'Hall', mockUnits[0].subUnits![3], 'Rifleman'),
  createPersonnel('PVT-003', 'PVT', 'Joshua', 'Young', mockUnits[0].subUnits![3], 'Rifleman')
];

export const mockHandReceipts: HandReceipt[] = [
  {
    id: 'HR-001',
    holder: mockPersonnel[2], // 1LT Wilson
    primaryHolder: mockPersonnel[0], // CPT Anderson
    issueDate: '2024-01-15',
    lastUpdated: '2024-01-15',
    items: [], // Would be populated with actual items
    status: 'active',
    type: 'primary',
    signatures: {
      issuer: 'CPT James Anderson',
      receiver: '1LT Sarah Wilson',
      witness: '1SG Robert Martinez'
    },
    ...generateTimestamps()
  }
];

export const mockHandReceiptItems: HandReceiptItem[] = [
  {
    id: 'ITEM-001',
    nsn: '1005-01-545-1477',
    name: 'M4 Carbine',
    serialNumber: 'M4-2024-001',
    model: 'M4A1',
    value: 1200,
    quantity: 1,
    condition: 'SERVICEABLE',
    isSensitive: true,
    location: 'Arms Room',
    lastInventoried: '2024-01-15',
    ...generateTimestamps()
  }
];

export const mockPropertyTransfers: PropertyTransfer[] = [
  {
    id: 'TRANS-001',
    propertyId: mockHandReceiptItems[0].id, // M4 transfer
    fromPersonId: mockPersonnel[0].id, // CPT Anderson
    toPersonId: mockPersonnel[7].id, // 1LT Wilson (1st Platoon Leader)
    status: 'PENDING',
    reason: 'Transfer to support upcoming training',
    notes: 'Transfer to support upcoming training',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
    approvedBy: undefined,
    approvedAt: undefined
  }
];
