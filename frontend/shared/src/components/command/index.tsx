import * as React from 'react';

// Base Command component
export function Command({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`command-root ${className}`}>
      {children}
    </div>
  );
}

// Dialog wrapper
export function CommandDialog({ 
  children,
  open,
  onOpenChange 
}: { 
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div 
      className={`command-dialog ${open ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
    >
      {open && children}
    </div>
  );
}

// Input component
export function CommandInput({ 
  placeholder 
}: { 
  placeholder?: string;
}) {
  return (
    <input
      className="command-input"
      placeholder={placeholder}
      type="text"
      role="combobox"
    />
  );
}

// List container
export function CommandList({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <div className="command-list" role="listbox">
      {children}
    </div>
  );
}

// Empty state
export function CommandEmpty({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <div className="command-empty" role="presentation">
      {children}
    </div>
  );
}

// Group component
export function CommandGroup({ 
  heading,
  children 
}: { 
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="command-group" role="group" aria-labelledby={`heading-${heading}`}>
      <div className="command-group-heading" id={`heading-${heading}`}>
        {heading}
      </div>
      {children}
    </div>
  );
}

// Item component
export function CommandItem({ 
  children,
  onSelect 
}: { 
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <div 
      className="command-item"
      role="option"
      onClick={onSelect}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

// Shortcut component
export function CommandShortcut({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <span className="command-shortcut">
      {children}
    </span>
  );
}
