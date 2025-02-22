import { FC, useState } from 'react';
import {
  Box,
  Typography,
  InputBase,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Key as KeyIcon,
  SwapHoriz as TransferIcon,
  Assessment as ReportIcon,
  Download as DownloadIcon,
  PlayCircle as PlayCircleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ArmyLogo } from '@shared/components/common';

const darkTheme = {
  background: '#1a1a1a',
  paper: '#2a2a2a',
  paperDark: '#333333',
  text: {
    primary: '#ffffff',
    secondary: '#999999',
  },
  accent: '#00ff00',
  error: '#ff4444',
  border: '#404040',
  success: '#00cc00',
  hover: 'rgba(255, 255, 255, 0.1)',
};

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: darkTheme.paper,
  marginLeft: 0,
  width: '300px',
  border: `1px solid ${darkTheme.border}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: darkTheme.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: darkTheme.text.primary,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    '&::placeholder': {
      color: darkTheme.text.secondary,
      opacity: 1,
    },
  },
}));

const QuickLinkButton = styled(Button)(({ theme }) => ({
  backgroundColor: darkTheme.paper,
  color: darkTheme.text.primary,
  padding: theme.spacing(2),
  width: '100%',
  justifyContent: 'flex-start',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${darkTheme.border}`,
  '&:hover': {
    backgroundColor: darkTheme.hover,
    borderColor: darkTheme.accent,
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: darkTheme.accent,
  },
}));

const HelpPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ 
      p: 3,
      backgroundColor: darkTheme.background,
      minHeight: '100vh',
      color: darkTheme.text.primary
    }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <ArmyLogo sx={{ width: 50, height: 50, mr: 2, color: darkTheme.text.primary }} />
          <Box>
            <Typography variant="h4" sx={{ color: darkTheme.text.primary, fontWeight: 'bold' }}>
              Help
            </Typography>
            <Typography variant="subtitle1" sx={{ color: darkTheme.text.secondary }}>
              Captain John Doe, Company Commander, F CO - 2-506, 3BCT, 101st Airborne
            </Typography>
          </Box>
        </Box>
        
        <SearchBar>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchBar>
      </Box>

      {/* Quick Links Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <QuickLinkButton startIcon={<KeyIcon />}>
            Reset Password
          </QuickLinkButton>
        </Grid>
        <Grid item xs={12} sm={4}>
          <QuickLinkButton startIcon={<TransferIcon />}>
            Initiate Transfer
          </QuickLinkButton>
        </Grid>
        <Grid item xs={12} sm={4}>
          <QuickLinkButton startIcon={<ReportIcon />}>
            Generate Report
          </QuickLinkButton>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* FAQs Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: darkTheme.paper,
            borderRadius: 2,
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: darkTheme.text.primary }}>
              Frequently Asked Questions
            </Typography>
            
            {/* Account Management FAQs */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: darkTheme.accent, mb: 2 }}>
                Account Management
              </Typography>
              <Accordion 
                expanded={expandedFaq === 'faq1'} 
                onChange={handleFaqChange('faq1')}
                sx={{
                  backgroundColor: darkTheme.paperDark,
                  color: darkTheme.text.primary,
                  borderColor: darkTheme.border,
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    borderBottom: `1px solid ${darkTheme.border}`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: darkTheme.accent }} />}
                >
                  <Typography>How do I reset my password?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: darkTheme.text.secondary }}>
                    To reset your password, click on your profile icon in the top right corner and select "Reset Password". 
                    Follow the instructions sent to your military email address.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              {/* Add more Account Management FAQs */}
            </Box>

            {/* Property Transfers FAQs */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: darkTheme.accent, mb: 2 }}>
                Property Transfers
              </Typography>
              <Accordion 
                expanded={expandedFaq === 'faq2'} 
                onChange={handleFaqChange('faq2')}
                sx={{
                  backgroundColor: darkTheme.paperDark,
                  color: darkTheme.text.primary,
                  borderColor: darkTheme.border,
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    borderBottom: `1px solid ${darkTheme.border}`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: darkTheme.accent }} />}
                >
                  <Typography>How do I initiate a transfer?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: darkTheme.text.secondary }}>
                    Navigate to the Transfers page and click "New Transfer". Select the items to transfer,
                    choose the recipient, and follow the blockchain verification process.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              {/* Add more Property Transfers FAQs */}
            </Box>

            {/* Blockchain Technology FAQs */}
            <Box>
              <Typography variant="h6" sx={{ color: darkTheme.accent, mb: 2 }}>
                Blockchain Technology
              </Typography>
              <Accordion 
                expanded={expandedFaq === 'faq3'} 
                onChange={handleFaqChange('faq3')}
                sx={{
                  backgroundColor: darkTheme.paperDark,
                  color: darkTheme.text.primary,
                  borderColor: darkTheme.border,
                  '&:before': {
                    display: 'none',
                  },
                  '& .MuiAccordionSummary-root': {
                    borderBottom: `1px solid ${darkTheme.border}`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: darkTheme.accent }} />}
                >
                  <Typography>What does 'Blockchain Synced' mean?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: darkTheme.text.secondary }}>
                    'Blockchain Synced' indicates that your local data is up-to-date with the blockchain network,
                    ensuring all transactions and records are current and verified.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              {/* Add more Blockchain Technology FAQs */}
            </Box>
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Guides and Tutorials */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            backgroundColor: darkTheme.paper,
            borderRadius: 2,
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: darkTheme.text.primary }}>
              Guides and Tutorials
            </Typography>
            
            <Card sx={{ 
              mb: 2, 
              backgroundColor: darkTheme.paperDark,
              borderRadius: 2,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DownloadIcon sx={{ color: darkTheme.accent, mr: 1 }} />
                  <Typography variant="h6" sx={{ color: darkTheme.text.primary }}>
                    User Manual
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: darkTheme.text.secondary, mb: 2 }}>
                  Comprehensive guide to using the HandReceipt app
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{
                    color: darkTheme.accent,
                    borderColor: darkTheme.accent,
                    '&:hover': {
                      borderColor: darkTheme.success,
                      backgroundColor: `${darkTheme.accent}22`,
                    },
                  }}
                >
                  Download PDF
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ 
              backgroundColor: darkTheme.paperDark,
              borderRadius: 2,
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PlayCircleIcon sx={{ color: darkTheme.accent, mr: 1 }} />
                  <Typography variant="h6" sx={{ color: darkTheme.text.primary }}>
                    Video Tutorials
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: darkTheme.text.secondary, mb: 2 }}>
                  Step-by-step video guides for common tasks
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PlayCircleIcon />}
                  sx={{
                    color: darkTheme.accent,
                    borderColor: darkTheme.accent,
                    '&:hover': {
                      borderColor: darkTheme.success,
                      backgroundColor: `${darkTheme.accent}22`,
                    },
                  }}
                >
                  Watch Videos
                </Button>
              </CardContent>
            </Card>
          </Paper>

          {/* Contact Support */}
          <Paper sx={{ 
            p: 3, 
            backgroundColor: darkTheme.paper,
            borderRadius: 2,
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: darkTheme.text.primary }}>
              Contact Support
            </Typography>
            
            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: darkTheme.text.primary,
                  '& fieldset': {
                    borderColor: darkTheme.border,
                  },
                  '&:hover fieldset': {
                    borderColor: darkTheme.accent,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: darkTheme.accent,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkTheme.text.secondary,
                },
              }}
            />
            
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: darkTheme.text.primary,
                  '& fieldset': {
                    borderColor: darkTheme.border,
                  },
                  '&:hover fieldset': {
                    borderColor: darkTheme.accent,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: darkTheme.accent,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkTheme.text.secondary,
                },
              }}
            />
            
            <Button
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: darkTheme.accent,
                color: '#000000',
                '&:hover': {
                  backgroundColor: darkTheme.success,
                },
              }}
            >
              Send Message
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* App Information */}
      <Paper sx={{ 
        mt: 4, 
        p: 3, 
        backgroundColor: darkTheme.paper,
        borderRadius: 2,
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ color: darkTheme.text.secondary }}>
              App Version: 1.2.3
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" sx={{ color: darkTheme.text.secondary }}>
              Last Updated: 2024-02-10
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="text"
              sx={{
                color: darkTheme.accent,
                '&:hover': {
                  backgroundColor: `${darkTheme.accent}22`,
                },
              }}
            >
              View Changelog
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default HelpPage; 