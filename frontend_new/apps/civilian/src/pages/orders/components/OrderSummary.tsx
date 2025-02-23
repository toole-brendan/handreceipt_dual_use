import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { OrderSummary as OrderSummaryType } from '../types';

interface OrderSummaryProps {
  summary: OrderSummaryType;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ summary }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Open Purchase Orders
            </Typography>
            <Typography variant="h4">
              {summary.openPurchaseOrders}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Open Sales Orders
            </Typography>
            <Typography variant="h4">
              {summary.openSalesOrders}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Total Value of Open Orders
            </Typography>
            <Typography variant="h4">
              ${summary.totalValueOfOpenOrders.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Orders Awaiting Shipment
            </Typography>
            <Typography variant="h4">
              {summary.ordersAwaitingShipment}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}; 