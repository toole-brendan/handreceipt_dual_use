import React from 'react';
import { Button } from '@mui/material';

interface TransferButtonProps {
  onTransfer: () => void;
  disabled?: boolean;
}

export const TransferButton: React.FC<TransferButtonProps> = ({
  onTransfer,
  disabled = false
}) => {
  return (
    <Button
      variant="outlined"
      onClick={onTransfer}
      disabled={disabled}
      startIcon={<span className="material-icons">swap_horiz</span>}
    >
      Transfer Items
    </Button>
  );
};
