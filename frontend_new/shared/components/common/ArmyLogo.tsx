import { FC } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const ArmyLogo: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 50 50">
      {/* Simplified U.S. Army Star Logo */}
      <path
        d="M25 2L32.66 17.34L49 25L32.66 32.66L25 48L17.34 32.66L1 25L17.34 17.34L25 2Z"
        fill="#4A5D23"
        stroke="#000"
        strokeWidth="1"
      />
      <circle cx="25" cy="25" r="8" fill="#FFF" />
    </SvgIcon>
  );
}; 