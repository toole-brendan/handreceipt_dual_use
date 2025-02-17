export interface CommandItem {
  id: string;
  title: string;
  section: string;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  commands: CommandItem[];
}
