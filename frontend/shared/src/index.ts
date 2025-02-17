// Export components
export { CommandPaletteProvider } from './components/CommandPaletteProvider';
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem as CommandItemComponent,
  CommandList,
  CommandShortcut,
} from './components/command';
export { Login } from './features/auth/components';

// Export hooks
export { useCommandPalette } from './hooks/useCommandPalette';

// Export types
export type { 
  CommandItem,
  CommandContextType 
} from './types/command';

export type {
  User,
  LoginProps
} from './types/auth';

export type {
  CustomTheme,
  CustomThemeColors
} from './types/theme';

// Export theme
export { default as theme } from './styles/theme';
export { components } from './styles/theme/components';
export { palette, customColors } from './styles/theme/palette';
export { typography } from './styles/theme/typography';
