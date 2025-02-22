import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { ChevronRight } from 'lucide-react';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const meta = {
  title: 'Components/Forms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
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

export const Secondary: Story = {
  args: {
    variant: 'outlined',
    children: 'Secondary Button',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    children: 'Text Button',
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'With Left Icon',
    iconLeft: <ChevronRight />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'With Right Icon',
    iconRight: <ChevronRight />,
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

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
};
