import { useState } from 'react';
import type { CommandItem, CommandContextType } from '../types/command';

export function useCommandPalette(): CommandContextType {
  const [open, setOpen] = useState(false);
  const [commands, setCommands] = useState<CommandItem[]>([]);

  // This will be enhanced later to handle command registration
  // from both civilian and defense frontends
  return {
    open,
    setOpen,
    commands
  };
}

// Export types for convenience
export type { CommandItem, CommandContextType };
