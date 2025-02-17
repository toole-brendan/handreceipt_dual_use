import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, alpha } from '@mui/material';
import { Share2 } from 'lucide-react';
import { colors } from '../../styles/theme/colors';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

interface BarcodeDisplayProps {
  value: string;
  type: 'qr' | 'code128';
  title?: string;
  description?: string;
  onShare?: () => void;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  type,
  title,
  description,
  onShare
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: alpha(colors.background.paper, 0.5),
        border: `1px solid ${alpha(colors.primary, 0.1)}`,
        borderRadius: 1
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          {title && (
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {onShare && (
          <Tooltip title="Share">
            <IconButton
              size="small"
              onClick={onShare}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              <Share2 size={16} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          bgcolor: '#fff',
          borderRadius: 1,
          minHeight: type === 'qr' ? 200 : 100
        }}
      >
        {type === 'qr' ? (
          <QRCodeSVG
            value={value}
            size={200}
            level="H"
            includeMargin
            imageSettings={{
              src: '/logo.png',
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        ) : (
          <Barcode
            value={value}
            format="CODE128"
            width={2}
            height={100}
            displayValue
            font="monospace"
            textAlign="center"
            textPosition="bottom"
            textMargin={6}
            fontSize={14}
            background="#ffffff"
            lineColor="#000000"
            margin={10}
          />
        )}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textAlign: 'center',
          mt: 2,
          fontFamily: 'monospace'
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
};

export default BarcodeDisplay;
