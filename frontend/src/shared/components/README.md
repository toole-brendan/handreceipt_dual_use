# Hand Receipt UI Component Library

A modern, accessible, and type-safe UI component library for the Hand Receipt Management System, built on Material-UI.

## Component Categories

### Inputs
Components for user input and form handling:
- `Button` - Material-UI based buttons with variants (contained, outlined, text) and colors
- `Checkbox` - Form checkboxes with labels
- `Form` - Form handling with validation
- `Input` - Text input fields
- `Label` - Form labels with accessibility
- `Select` - Dropdown selection menus

### Feedback
Components for user feedback and notifications:
- `Alert` - System alerts and notifications
- `Badge` - Status indicators and counts
- `Skeleton` - Loading state placeholders
- `Toast` - Temporary notifications
- `Tooltip` - Contextual information

### Layout
Components for page and content structure:
- `Card` - Material-UI card components:
  - `CardContent` - Main content area
  - `CardHeader` - Title and subheader area
  - `Box` - Action area (footer)
  - `Typography` - Text elements
- `Sheet` - Modal and dialog containers
- `Table` - Data table layouts

### Navigation
Components for user navigation:
- `Breadcrumb` - Page navigation trails
- `Command` - Command palette interface

## Usage Guidelines

### Installation
All components are available through their respective imports:
```typescript
import { Button } from '@/components/forms/button';
import { Card, CardContent, CardHeader } from '@mui/material';
```

### Styling
Components use Material-UI's styling system:
- MUI theme customization
- Styled components
- CSS-in-JS with emotion
- System props for spacing and layout

### Accessibility
All components follow WCAG 2.1 guidelines:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

### Type Safety
Components are built with TypeScript:
- Strict prop typing
- Event handler types
- Style prop types
- Ref forwarding

## Component Documentation

Each component follows a consistent documentation structure:

### Props Interface
```typescript
interface ButtonProps extends Omit<MuiButtonProps, 'startIcon' | 'endIcon'> {
  // Additional props
  isLoading?: boolean;
  isIcon?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}
```

### Examples
```tsx
// Basic usage
<Button variant="contained">Click Me</Button>

// With variants and colors
<Button variant="text" color="inherit">Cancel</Button>
<Button variant="contained" color="primary">Submit</Button>

// With icons
<Button iconLeft={<Icon />}>
  With Icon
</Button>
```

### Best Practices
- When to use
- When not to use
- Accessibility considerations
- Performance considerations

## Development

### Adding New Components
1. Create component directory in appropriate category
2. Add component implementation
3. Add TypeScript types
4. Add documentation
5. Add to index exports
6. Create Storybook story

### Testing
- Unit tests with Jest
- Integration tests with Testing Library
- Visual regression tests with Storybook
- Accessibility tests with axe-core

### Contributing
- Follow TypeScript strict mode
- Follow accessibility guidelines
- Add proper documentation
- Add tests
- Update examples
