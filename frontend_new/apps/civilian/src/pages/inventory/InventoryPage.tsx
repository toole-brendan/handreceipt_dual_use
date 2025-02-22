import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { ItemsTab } from './components/items';
import { ProductCatalogTab } from './components/catalog';
import { WarehouseTab } from './components/warehouse';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`inventory-tabpanel-${index}`}
    aria-labelledby={`inventory-tab-${index}`}
    sx={{
      flexGrow: 1,
      height: value === index ? '100%' : 0,
      overflow: 'auto',
    }}
  >
    {value === index && (
      <Box sx={{ height: '100%', p: 3 }}>
        {children}
      </Box>
    )}
  </Box>
);

const a11yProps = (index: number) => ({
  id: `inventory-tab-${index}`,
  'aria-controls': `inventory-tabpanel-${index}`,
});

export const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.default',
    }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          aria-label="inventory tabs"
          sx={{ px: 3 }}
        >
          <Tab label="Items" {...a11yProps(0)} />
          <Tab label="Product Catalog" {...a11yProps(1)} />
          <Tab label="Warehouse" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <ItemsTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ProductCatalogTab />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <WarehouseTab />
      </TabPanel>
    </Box>
  );
};
