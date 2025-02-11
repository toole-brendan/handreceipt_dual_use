import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/forms/button';
import { ChevronRight } from 'lucide-react';

const meta = {
  title: 'UI/Inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'contained',
    children: 'Primary Button',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'With Icon',
    iconRight: <ChevronRight className="w-4 h-4" />,
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};
