import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { Button } from '@/components/forms/button';
import { Settings } from 'lucide-react';

const meta = {
  title: 'UI/Layout/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <Typography variant="h6">Simple Card</Typography>
        <Typography variant="body2" color="text.secondary">A basic card example</Typography>
      </CardHeader>
      <CardContent>
        This is some sample content for the card. It can contain any React components or plain text.
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <Typography variant="h6">Card with Footer</Typography>
        <Typography variant="body2" color="text.secondary">A card with actions in the footer</Typography>
      </CardHeader>
      <CardContent>
        This card has a footer with action buttons.
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Button variant="outlined" color="inherit">Cancel</Button>
        <Button variant="contained" color="primary">Save</Button>
      </Box>
    </Card>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <Typography variant="h6">Settings Card</Typography>
        </div>
        <Typography variant="body2" color="text.secondary">Manage your preferences</Typography>
      </CardHeader>
      <CardContent>
        Configure your application settings here.
      </CardContent>
    </Card>
  ),
};
