# Button Component

A Material-UI based button component that supports various styles, sizes, and states.

## Usage

```tsx
import { Button } from '@/components/forms/button';

// Basic usage
<Button>Click Me</Button>

// With variants
<Button variant="contained" color="primary">Submit</Button>
<Button variant="contained" color="secondary">Cancel</Button>
<Button variant="contained" color="error">Delete</Button>

// With sizes
<Button size="small">Small</Button>
<Button size="large">Large</Button>

// With icons
<Button startIcon={<Icon />}>
  With Icon
</Button>

// Disabled state
<Button disabled>Disabled</Button>

// Loading state
<Button isLoading>Loading</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'outlined' \| 'contained'` | `'contained'` | The visual style of the button |
| `color` | `'inherit' \| 'primary' \| 'secondary' \| 'error' \| 'info' \| 'success' \| 'warning'` | `'primary'` | The color of the button |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | The size of the button |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `isLoading` | `boolean` | `false` | Whether to show a loading spinner |
| `isIcon` | `boolean` | `false` | Whether this is an icon-only button |
| `iconLeft` | `ReactNode` | - | Icon to show before the button text |
| `iconRight` | `ReactNode` | - | Icon to show after the button text |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | - | The content of the button |
| `onClick` | `(event: MouseEvent) => void` | - | Click handler |

## Styling

The button uses Material-UI's styling system with support for:
- Variant styles through the `variant` prop
- Color variations through the `color` prop
- Size variations through the `size` prop
- Disabled states
- Focus and hover states
- Loading states with spinner
- Icon support (left or right)

## Accessibility

The button component:
- Uses Material-UI's accessible button base
- Supports keyboard navigation
- Maintains proper focus states
- Includes ARIA attributes when needed
- Disables interaction when `disabled` or `isLoading` is true

## Best Practices

### Do
- Use clear, action-oriented text
- Use appropriate variants and colors for different actions
- Include loading states for async actions
- Add icons to enhance visual meaning
- Use consistent sizing within contexts

### Don't
- Use for navigation (use `Link` instead)
- Nest buttons within buttons
- Use disabled state for temporary conditions
- Mix different sizes in the same group
- Overuse error/warning colors

## Examples

### Form Submit Button
```tsx
<Button variant="contained" color="primary" type="submit">
  Save Changes
</Button>
```

### Delete Button
```tsx
<Button variant="contained" color="error" onClick={handleDelete}>
  Delete Item
</Button>
```

### Loading Button
```tsx
<Button isLoading disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

### Button with Icon
```tsx
<Button iconLeft={<PlusIcon />}>
  Add Item
</Button>
```

### Ghost Button
```tsx
<Button variant="text" color="inherit">
  Cancel
</Button>
```

### Outlined Button
```tsx
<Button variant="outlined" color="primary">
  View Details
</Button>
