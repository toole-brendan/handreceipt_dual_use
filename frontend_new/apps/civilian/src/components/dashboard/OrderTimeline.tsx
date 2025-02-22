import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Avatar, Divider } from '@mui/material';
import { LocalShipping, Inventory, Payment, CheckCircle } from '@mui/icons-material';

interface OrderTimelineProps {
  orders: Array<{
    id: string;
    product: string;
    status: 'processing' | 'shipped' | 'delivered' | 'completed';
    startDate: string;
    estimatedDelivery: string;
    milestones: Array<{
      type: 'order' | 'shipping' | 'delivery' | 'payment';
      date: string;
      completed: boolean;
    }>;
  }>;
}

const getIcon = (type: 'order' | 'shipping' | 'delivery' | 'payment') => {
  switch (type) {
    case 'order':
      return <Inventory />;
    case 'shipping':
      return <LocalShipping />;
    case 'delivery':
      return <CheckCircle />;
    case 'payment':
      return <Payment />;
  }
};

const OrderTimeline: React.FC<OrderTimelineProps> = ({ orders }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Fulfillment Timeline
        </Typography>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {orders.map((order) => (
            <Box key={order.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order #{order.id} - {order.product}
              </Typography>
              <Stack spacing={2}>
                {order.milestones.map((milestone, index) => (
                  <Box key={index}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: milestone.completed ? 'success.main' : 'grey.500',
                          width: 40,
                          height: 40
                        }}
                      >
                        {getIcon(milestone.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(milestone.date).toLocaleDateString()}
                        </Typography>
                        <Typography>
                          {milestone.type.charAt(0).toUpperCase() + milestone.type.slice(1)}
                          {milestone.completed ? " - Completed" : " - Pending"}
                        </Typography>
                      </Box>
                    </Stack>
                    {index < order.milestones.length - 1 && (
                      <Box 
                        sx={{ 
                          height: 24, 
                          width: 2, 
                          bgcolor: 'grey.300',
                          ml: 2.5,
                          my: 0.5 
                        }} 
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
