import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  description?: string;
  size?: number;
  onDownload?: () => void;
  onShare?: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  title = 'QR Code',
  description,
  size = 200,
  onDownload,
  onShare,
}) => {
  const qrRef = React.useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    const canvas = qrRef.current;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 3,
            bgcolor: 'white',
            borderRadius: 1,
            display: 'inline-flex',
          }}
        >
          <QRCode
            ref={qrRef}
            value={value}
            size={size}
            level="H"
            includeMargin
            renderAs="canvas"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Download QR Code">
            <IconButton onClick={handleDownload} size="small">
              <Download size={20} />
            </IconButton>
          </Tooltip>
          {onShare && (
            <Tooltip title="Share QR Code">
              <IconButton onClick={onShare} size="small">
                <Share2 size={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            maxWidth: size,
            wordBreak: 'break-all',
            textAlign: 'center',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default QRCodeDisplay;
