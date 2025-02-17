import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Chip, Paper, Divider, useTheme } from '@mui/material';
import { ArrowLeft, Package, MapPin } from 'lucide-react';
import DashboardCard from '@/components/common/DashboardCard';
import BlockchainBadge from '@/components/common/BlockchainBadge';
import BarcodeDisplay from '@/components/common/BarcodeDisplay';
import ProvenanceTimeline, { ProvenanceEvent } from '@/components/common/ProvenanceTimeline';
import BlockchainDiagram, { BlockchainDiagramWithDescription } from '@/components/common/BlockchainDiagram';
import { getProductById, PharmaceuticalProduct } from '@/mocks/api/pharmaceuticals-products.mock';
import { mockProvenanceData } from '@/mocks/mockData';
import { ROUTES } from '@/constants/routes';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<PharmaceuticalProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [provenanceEvents, setProvenanceEvents] = useState<ProvenanceEvent[]>([]);
  const theme = useTheme();

  const handleEventClick = (event: ProvenanceEvent) => {
    console.log('Event clicked:', event);
  };

  const handleLocationClick = (location: ProvenanceEvent['location']) => {
    console.log('Location clicked:', location);
  };

  const handleDocumentClick = (document: NonNullable<ProvenanceEvent['documents']>[number]) => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        // Load product data
        const foundProduct = getProductById(id);
        setProduct(foundProduct || null);

        // Load provenance events
        const productEvents = mockProvenanceData.find(p => p.productId === id)?.provenanceEvents || [];
        setProvenanceEvents(productEvents);
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3, minHeight: 400 }}>
        <CenteredLoadingSpinner size={32} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">Product not found</Typography>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate(ROUTES.PRODUCTS.CATALOG)}
          sx={{ mt: 2 }}
        >
          Back to Catalog
        </Button>
      </Box>
    );
  }

  const getStatusColor = (status: PharmaceuticalProduct['status']) => {
    switch (status) {
      case 'In Stock':
        return 'success';
      case 'Low Stock':
        return 'warning';
      case 'Quarantined':
      case 'Rejected':
      case 'Recalled':
        return 'error';
      case 'Expired':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate(ROUTES.PRODUCTS.CATALOG)}
          >
            Back to Catalog
          </Button>
          <Typography variant="h4">{product.name}</Typography>
          <BlockchainBadge
            transactionHash={product.blockchainData.transactionHash}
            timestamp={product.blockchainData.timestamp}
            status={product.blockchainData.verified ? "Blockchain Verified" : "Unverified"}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Product Information */}
        <Grid item xs={12} md={8}>
          <DashboardCard title="Product Information">
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">SKU</Typography>
                  <Typography variant="body1">{product.sku}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{product.category}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{product.description}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Manufacturer</Typography>
                  <Typography variant="body1">{product.manufacturer}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Storage Conditions</Typography>
                  <Typography variant="body1">{product.storageConditions}</Typography>
                </Grid>
                {product.batchNumber && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Batch Number</Typography>
                    <Typography variant="body1">{product.batchNumber}</Typography>
                  </Grid>
                )}
                {product.expiryDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DashboardCard>
        </Grid>

        {/* Status and Inventory */}
        <Grid item xs={12} md={4}>
          <DashboardCard title="Status & Inventory">
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={product.status}
                  color={getStatusColor(product.status)}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                <Typography variant="h4">
                  {product.quantity.toLocaleString()} {product.unitOfMeasure}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography variant="body1">{product.location}</Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Grid>

        {/* Blockchain Information */}
        <Grid item xs={12}>
          <DashboardCard title="Blockchain Information">
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Transaction Hash</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {product.blockchainData.transactionHash}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
                  <Typography variant="body1">
                    {new Date(product.blockchainData.timestamp).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DashboardCard>
        </Grid>

        {/* Product Identifiers */}
        <Grid item xs={12}>
          <DashboardCard title="Product Identifiers">
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Barcode</Typography>
                    <BarcodeDisplay
                      value={product.sku}
                      type="code128"
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>QR Code</Typography>
                    <BarcodeDisplay
                      value={`${window.location.origin}/products/${product.id}`}
                      type="qr"
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </DashboardCard>
        </Grid>
        {/* Provenance Timeline */}
        <Grid item xs={12}>
          <DashboardCard 
            title="Product Journey"
            subtitle="Track this product's journey through the supply chain"
          >
            <Box sx={{ p: 2 }}>
              <ProvenanceTimeline
                events={provenanceEvents}
                onEventClick={handleEventClick}
                onLocationClick={handleLocationClick}
                onDocumentClick={handleDocumentClick}
              />
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetails;
