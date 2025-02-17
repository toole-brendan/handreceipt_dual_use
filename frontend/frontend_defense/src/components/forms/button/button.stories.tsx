// We still need React in scope for JSX, but as a type-only import
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// Base variants
export const Default: Story = {
  args: {
    children: 'Default Button',
    variant: 'contained',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'contained',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'contained',
    color: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'text',
    color: 'inherit',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive Button',
    variant: 'contained',
    color: 'error',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outlined',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'text',
    color: 'primary',
  },
};

// Sizes
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

// States
export const Loading: Story = {
  args: {
    children: 'Loading Button',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Left Icon',
    iconLeft: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    ),
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Right Icon',
    iconRight: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    isIcon: true,
    'aria-label': 'Menu',
    children: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
};
