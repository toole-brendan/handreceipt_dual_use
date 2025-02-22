import React from 'react';
import { Box, Stack } from '@mui/material';
import {
  Inventory as InventoryIcon,
  AccountBalanceWallet as WalletIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { SummaryCard } from './SummaryCard';

interface CivilianDashboardStatsBarProps {
  inventory: {
    totalItems: number;
    lowStockItems: number;
  };
  finance: {
    usdcBalance: number;
  };
  shipping: {
    recentShipments: number;
  };
}

const CivilianDashboardStatsBar: React.FC<CivilianDashboardStatsBarProps> = ({
  inventory,
  finance,
  shipping,
}) => {
  const lowStockRatio = inventory.lowStockItems / inventory.totalItems;
  const inventoryStatus = lowStockRatio > 0.15 ? 'warning' : 'success';

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            minWidth: 'min-content',
            px: 2,
          }}
        >
          <SummaryCard
            title="Inventory Status"
            icon={<InventoryIcon />}
            value={`${inventory.totalItems} / ${inventory.lowStockItems} Low Stock`}
            subtitle="Total Items / Low Stock"
            status={inventoryStatus}
          />
          <SummaryCard
            title="USDC Balance"
            icon={<WalletIcon />}
            value={`$ ${finance.usdcBalance.toLocaleString()}`}
            subtitle="Wallet Balance (USDC)"
            status="success"
          />
          <SummaryCard
            title="Recent Shipments"
            icon={<ShippingIcon />}
            value={`${shipping.recentShipments} Shipments`}
            subtitle="Last 24 Hours"
            status="success"
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default CivilianDashboardStatsBar;
