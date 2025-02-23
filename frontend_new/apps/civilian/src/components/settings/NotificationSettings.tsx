import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Grid,
} from '@mui/material';

interface NotificationSettingsProps {
  onSave: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onSave }) => {
  const [notificationTypes, setNotificationTypes] = React.useState({
    orderUpdates: true,
    paymentConfirmations: true,
    inventoryAlerts: false,
    shipmentStatus: false,
    blockchainUpdates: false,
  });

  const handleNotificationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationTypes({
      ...notificationTypes,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Box>
      {/* Notification Types Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          <FormGroup>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationTypes.orderUpdates}
                      onChange={handleNotificationTypeChange}
                      name="orderUpdates"
                    />
                  }
                  label="Order Updates"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationTypes.paymentConfirmations}
                      onChange={handleNotificationTypeChange}
                      name="paymentConfirmations"
                    />
                  }
                  label="Payment Confirmations"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationTypes.inventoryAlerts}
                      onChange={handleNotificationTypeChange}
                      name="inventoryAlerts"
                    />
                  }
                  label="Inventory Alerts"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationTypes.shipmentStatus}
                      onChange={handleNotificationTypeChange}
                      name="shipmentStatus"
                    />
                  }
                  label="Shipment Status Changes"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationTypes.blockchainUpdates}
                      onChange={handleNotificationTypeChange}
                      name="blockchainUpdates"
                    />
                  }
                  label="Blockchain Transaction Updates"
                />
              </Grid>
            </Grid>
          </FormGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Select the types of notifications you want to receive.
          </Typography>
        </CardContent>
      </Card>

      {/* Notification Methods Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Notification Methods
          </Typography>
          <RadioGroup defaultValue="email">
            <FormControlLabel
              value="email"
              control={<Radio />}
              label="Email"
            />
            <FormControlLabel
              value="sms"
              control={<Radio />}
              label="SMS"
            />
            <FormControlLabel
              value="inApp"
              control={<Radio />}
              label="In-App Notifications"
            />
          </RadioGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Choose how you want to receive notifications.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            You can select multiple methods.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationSettings; 