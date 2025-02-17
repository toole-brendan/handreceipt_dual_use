import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandItem } from '../components/command';

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Define common commands
  const commands: CommandItem[] = [
    {
      id: 'home',
      title: 'Go to Home',
      section: 'Navigation',
      shortcut: 'g h',
      onSelect: () => navigate('/'),
    },
    {
      id: 'transfers',
      title: 'View Transfers',
      section: 'Navigation',
      shortcut: 'g t',
      onSelect: () => navigate('/transfer'),
    },
    {
      id: 'property',
      title: 'View Property',
      section: 'Navigation',
      shortcut: 'g p',
      onSelect: () => navigate('/property'),
    },
    {
      id: 'profile',
      title: 'View Profile',
      section: 'Navigation',
      shortcut: 'g u',
      onSelect: () => navigate('/profile'),
    },
    {
      id: 'new-transfer',
      title: 'Create New Transfer',
      section: 'Actions',
      shortcut: 'n t',
      onSelect: () => navigate('/transfer/new'),
    },
    {
      id: 'search',
      title: 'Search Property',
      section: 'Actions',
      shortcut: 's',
      onSelect: () => navigate('/property/search'),
    },
  ];

  return {
    open,
    setOpen,
    commands,
  };
}
