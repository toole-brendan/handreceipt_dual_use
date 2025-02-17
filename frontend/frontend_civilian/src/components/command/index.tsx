import React, { ReactNode } from 'react';

export interface CommandItem {
  id: string;
  title: string;
  section: string;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export interface CommandProps {
  className?: string;
  children: ReactNode;
}

export interface CommandInputProps {
  placeholder?: string;
}

export interface CommandListProps {
  children: ReactNode;
}

export interface CommandEmptyProps {
  children: ReactNode;
}

export interface CommandGroupProps {
  heading: string;
  children: ReactNode;
}

export interface CommandItemProps {
  onSelect: () => void;
  children: ReactNode;
}

export interface CommandShortcutProps {
  children: ReactNode;
}

export const Command: React.FC<CommandProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

export const CommandDialog: React.FC<CommandDialogProps> = ({ open, onOpenChange, children }) => {
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div role="dialog" aria-modal={open} onClick={handleBackdropClick}>
      <div>{children}</div>
    </div>
  );
};

export const CommandInput: React.FC<CommandInputProps> = ({ placeholder }) => {
  return <input type="text" placeholder={placeholder} />;
};

export const CommandList: React.FC<CommandListProps> = ({ children }) => {
  return <div role="listbox">{children}</div>;
};

export const CommandEmpty: React.FC<CommandEmptyProps> = ({ children }) => {
  return <div>{children}</div>;
};

export const CommandGroup: React.FC<CommandGroupProps> = ({ heading, children }) => {
  return (
    <div role="group" aria-label={heading}>
      <div>{heading}</div>
      {children}
    </div>
  );
};

export const CommandItem: React.FC<CommandItemProps> = ({ onSelect, children }) => {
  return (
    <div role="option" onClick={onSelect}>
      {children}
    </div>
  );
};

export const CommandShortcut: React.FC<CommandShortcutProps> = ({ children }) => {
  return <span>{children}</span>;
};
