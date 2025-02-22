import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Help as HelpIcon,
  LiveHelp as LiveHelpIcon,
  School as AcademyIcon,
  Book as GuideIcon,
  Forum as ForumIcon,
  VideoCall as VideoIcon,
  Chat as ChatIcon,
  Warning as AlertIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  QrCode as QrCodeIcon,
  PlayCircle as PlayIcon,
  Article as ArticleIcon,
  Assessment as MetricsIcon,
  CloudUpload as UploadIcon,
  Sensors as SensorIcon,
  AccountBalanceWallet as WalletIcon,
  VerifiedUser as CertificationIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../components/common/CivilianChip';

// Mock data for help/support content
const mockSupportData = {
  systemStatus: {
    blockchain: { status: 'operational', message: 'All systems normal' },
    iot: { status: 'degraded', message: 'Minor delays in sensor data' },
    payments: { status: 'operational', message: 'USDC transfers processing normally' },
  },
  quickActions: [
    {
      title: 'Fix Payment Dispute',
      icon: <WalletIcon />,
      description: 'Resolve smart contract payment issues',
    },
    {
      title: 'Calibrate Sensors',
      icon: <SensorIcon />,
      description: 'Troubleshoot IoT device problems',
    },
    {
      title: 'Certification Help',
      icon: <CertificationIcon />,
      description: 'Get help with sustainability certifications',
    },
  ],
  tutorials: [
    {
      title: 'Blockchain for Coffee',
      duration: '5 min',
      views: 1200,
      thumbnail: '/blockchain-tutorial.jpg',
    },
    {
      title: 'IoT Sensor Setup',
      duration: '8 min',
      views: 850,
      thumbnail: '/iot-tutorial.jpg',
    },
    {
      title: 'Smart Contract Basics',
      duration: '12 min',
      views: 950,
      thumbnail: '/smart-contract-tutorial.jpg',
    },
  ],
  faqCategories: [
    {
      name: 'Blockchain & Payments',
      icon: <WalletIcon />,
      articles: [
        { title: 'Understanding Transaction IDs', views: 450 },
        { title: 'Smart Contract Verification', views: 320 },
        { title: 'USDC Payment Process', views: 280 },
      ],
    },
    {
      name: 'IoT & Logistics',
      icon: <SensorIcon />,
      articles: [
        { title: 'Temperature Sensor Setup', views: 380 },
        { title: 'Geo-fencing Alerts', views: 290 },
        { title: 'Sensor Data Export', views: 210 },
      ],
    },
    {
      name: 'Certifications',
      icon: <CertificationIcon />,
      articles: [
        { title: 'Fair Trade Certification', views: 420 },
        { title: 'Organic Certification', views: 380 },
        { title: 'Rainforest Alliance', views: 340 },
      ],
    },
  ],
  openTickets: [
    {
      id: 'TKT001',
      title: 'Payment Dispute Resolution',
      status: 'in_progress',
      priority: 'high',
      updated: '2024-02-22T10:00:00Z',
    },
    {
      id: 'TKT002',
      title: 'Sensor Calibration Issue',
      status: 'pending',
      priority: 'medium',
      updated: '2024-02-22T09:30:00Z',
    },
  ],
  communityPosts: [
    {
      id: 'POST001',
      title: 'Best practices for Ethiopian beans storage',
      author: 'Maria R.',
      role: 'Q Grader',
      replies: 12,
      views: 340,
    },
    {
      id: 'POST002',
      title: 'Smart contract template for direct trade',
      author: 'John S.',
      role: 'Verified Farmer',
      replies: 8,
      views: 280,
    },
  ],
};

const SupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Search & Status Bar */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search for help articles, tutorials, or type your question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">Blockchain</Typography>
                  <CivilianChip
                    label={mockSupportData.systemStatus.blockchain.status}
                    color="success"
                    size="small"
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" color="text.secondary">IoT Services</Typography>
                  <CivilianChip
                    label={mockSupportData.systemStatus.iot.status}
                    color="warning"
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {mockSupportData.quickActions.map((action) => (
          <Grid item xs={12} md={4} key={action.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {action.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{action.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Learning Resources */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            {/* Video Tutorials */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Coffee Supply Chain Academy
                </Typography>
                <Stack spacing={2}>
                  {mockSupportData.tutorials.map((tutorial) => (
                    <Box
                      key={tutorial.title}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 },
                      }}
                    >
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          right: 8,
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        }}
                      >
                        <Typography variant="subtitle2">{tutorial.title}</Typography>
                        <Typography variant="caption">
                          {tutorial.duration} • {tutorial.views} views
                        </Typography>
                      </Box>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                        }}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Open Tickets */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Your Support Tickets</Typography>
                <Stack spacing={2}>
                  {mockSupportData.openTickets.map((ticket) => (
                    <Paper
                      key={ticket.id}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">{ticket.title}</Typography>
                        <Stack direction="row" spacing={1}>
                          <CivilianChip
                            label={ticket.status}
                            color={ticket.status === 'in_progress' ? 'info' : 'warning'}
                            size="small"
                          />
                          <CivilianChip
                            label={ticket.priority}
                            color={ticket.priority === 'high' ? 'error' : 'warning'}
                            size="small"
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Updated: {new Date(ticket.updated).toLocaleString()}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<HelpIcon />}
                    fullWidth
                  >
                    Create New Ticket
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Center Column - Help Categories */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            {mockSupportData.faqCategories.map((category) => (
              <Card key={category.name}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {category.icon}
                      <Typography variant="h6">{category.name}</Typography>
                    </Stack>
                    <List>
                      {category.articles.map((article) => (
                        <ListItem
                          key={article.title}
                          button
                          sx={{
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <ListItemIcon>
                            <ArticleIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={article.title}
                            secondary={`${article.views} views`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant="text"
                      endIcon={<HelpIcon />}
                    >
                      View All Articles
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Right Column - Community & Live Help */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            {/* Live Support Options */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Get Live Help</Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<ChatIcon />}
                    fullWidth
                    onClick={() => setChatOpen(true)}
                  >
                    Start Live Chat
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<VideoIcon />}
                    fullWidth
                  >
                    Schedule Video Call
                  </Button>
                  <Typography variant="caption" color="text.secondary" align="center">
                    24/7 support for urgent issues
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Community Forum */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Community Forum</Typography>
                <Stack spacing={2}>
                  {mockSupportData.communityPosts.map((post) => (
                    <Paper
                      key={post.id}
                      variant="outlined"
                      sx={{ p: 2 }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">{post.title}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {post.author[0]}
                          </Avatar>
                          <Typography variant="caption">
                            {post.author}
                          </Typography>
                          <CivilianChip
                            label={post.role}
                            color="info"
                            size="small"
                          />
                        </Stack>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="text.secondary">
                            {post.replies} replies
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {post.views} views
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<ForumIcon />}
                    fullWidth
                  >
                    View All Discussions
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Live Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Live Support Chat</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">Chat interface would go here</Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Tooltip title="Scan QR Code for AR Support">
          <IconButton
            color="primary"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <QrCodeIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default SupportPage; 