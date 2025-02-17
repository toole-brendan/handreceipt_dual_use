import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, TextField, MenuItem, IconButton, Tooltip } from '@mui/material';
import { Plus, Download, Upload, Archive, Trash2 } from 'lucide-react';
import DashboardCard from '@/components/common/DashboardCard';
import ProductTable from '@/components/products/ProductTable';
import BlockchainBadge from '@/components/common/BlockchainBadge';
import { CenteredLoadingSpinner } from '@/components/common/LoadingSpinner';
import { mockPharmaceuticalProducts as initialProducts, PharmaceuticalProduct } from '@/mocks/api/pharmaceuticals-products.mock';
import { ROUTES } from '@/constants/routes';

const CATEGORIES = ['All', 'API', 'Excipient', 'Raw Material', 'Finished Drug', 'Packaging Material'];
const STATUSES = ['All', 'In Stock', 'Low Stock', 'Quarantined', 'Approved', 'Rejected', 'Expired', 'Recalled', 'Archived'];

// Extract unique locations from products
const getUniqueLocations = (products: PharmaceuticalProduct[]): string[] => {
  const locations = products.map(p => p.location);
  return ['All', ...Array.from(new Set(locations))];
};

const ProductCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PharmaceuticalProduct[]>(initialProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const uniqueLocations = useMemo(() => getUniqueLocations(products), [products]);

  // Filter products based on selected filters and search query
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || product.status === statusFilter;
      const matchesLocation = locationFilter === 'All' || product.location === locationFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.manufacturer.toLowerCase().includes(searchLower) ||
        (product.batchNumber?.toLowerCase().includes(searchLower) ?? false);
      
      return matchesCategory && matchesStatus && matchesLocation && matchesSearch;
    });
  }, [products, categoryFilter, statusFilter, locationFilter, searchQuery]);

  // Bulk action handlers
  const handleBulkArchive = () => {
    // Update the status of selected products to "Archived"
    const updatedProducts = products.map(product => 
      selectedProducts.includes(product.id)
        ? { ...product, status: 'Archived' as PharmaceuticalProduct['status'] }
        : product
    );
    
    setProducts(updatedProducts);
    setSelectedProducts([]);
  };

  const handleBulkDelete = () => {
    // Remove selected products from the array
    const updatedProducts = products.filter(product => 
      !selectedProducts.includes(product.id)
    );
    
    setProducts(updatedProducts);
    setSelectedProducts([]);
  };

  const bulkActions = [
    {
      icon: <Archive size={20} />,
      label: 'Archive Selected',
      onClick: handleBulkArchive,
      disabled: selectedProducts.length === 0
    },
    {
      icon: <Trash2 size={20} />,
      label: 'Delete Selected',
      onClick: handleBulkDelete,
      disabled: selectedProducts.length === 0
    }
  ];

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRowClick = (product: PharmaceuticalProduct) => {
    navigate(ROUTES.PRODUCTS.DETAILS.replace(':id', product.id));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Add Button and Import/Export */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            Product Catalog
          </Typography>
          <BlockchainBadge
            status="Blockchain Connected"
            showTooltip={true}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Import Products">
            <IconButton
              color="primary"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const csvData = event.target?.result as string;
                        const lines = csvData.split('\n');
                        const headers = lines[0].split(',');
                        
                        // Validate headers
                        const requiredHeaders = [
                          'Name', 'SKU', 'Category', 'Description', 'Unit of Measure',
                          'Batch Number', 'Expiry Date', 'Manufacturer', 'Storage Conditions',
                          'Status', 'Quantity', 'Location'
                        ];
                        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
                        if (missingHeaders.length > 0) {
                          throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
                        }

                        // Parse rows
                        const newProducts: PharmaceuticalProduct[] = lines.slice(1).map((line, index) => {
                          const values = line.split(',');
                          const rowData: Record<string, string> = {};
                          headers.forEach((header, i) => {
                            rowData[header] = values[i]?.trim() || '';
                          });

                          // Validate category
                          if (!CATEGORIES.includes(rowData.Category)) {
                            throw new Error(`Invalid category "${rowData.Category}" in row ${index + 2}`);
                          }

                          // Validate status
                          if (!STATUSES.includes(rowData.Status)) {
                            throw new Error(`Invalid status "${rowData.Status}" in row ${index + 2}`);
                          }

                          // Validate quantity
                          const quantity = parseInt(rowData.Quantity);
                          if (isNaN(quantity) || quantity < 0) {
                            throw new Error(`Invalid quantity "${rowData.Quantity}" in row ${index + 2}`);
                          }

                          // Validate expiry date
                          if (rowData['Expiry Date'] && !/^\d{4}-\d{2}-\d{2}$/.test(rowData['Expiry Date'])) {
                            throw new Error(`Invalid expiry date "${rowData['Expiry Date']}" in row ${index + 2}. Expected format: YYYY-MM-DD`);
                          }

                          return {
                            id: `IMP-${Date.now()}-${index}`,
                            name: rowData.Name,
                            sku: rowData.SKU,
                            category: rowData.Category as PharmaceuticalProduct['category'],
                            description: rowData.Description,
                            unitOfMeasure: rowData['Unit of Measure'],
                            batchNumber: rowData['Batch Number'] || undefined,
                            expiryDate: rowData['Expiry Date'] || undefined,
                            manufacturer: rowData.Manufacturer,
                            storageConditions: rowData['Storage Conditions'],
                            status: rowData.Status as PharmaceuticalProduct['status'],
                            quantity: quantity,
                            location: rowData.Location,
                            blockchainData: {
                              transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                              timestamp: new Date().toISOString(),
                              verified: true
                            }
                          };
                        });

                        // Update products state
                        setProducts(prevProducts => [...prevProducts, ...newProducts]);
                      } catch (error) {
                        alert(`Error importing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
            >
              <Upload size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Products">
            <IconButton
              color="primary"
              onClick={() => {
                // Create CSV content
                const headers = [
                  'ID', 'Name', 'SKU', 'Category', 'Description', 'Unit of Measure',
                  'Batch Number', 'Expiry Date', 'Manufacturer', 'Storage Conditions',
                  'Status', 'Quantity', 'Location'
                ];
                const rows = products.map(p => [
                  p.id,
                  p.name,
                  p.sku,
                  p.category,
                  p.description,
                  p.unitOfMeasure,
                  p.batchNumber || '',
                  p.expiryDate || '',
                  p.manufacturer,
                  p.storageConditions,
                  p.status,
                  p.quantity,
                  p.location
                ]);
                const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
              }}
            >
              <Download size={20} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={() => navigate(ROUTES.PRODUCTS.ADD)}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, batch number..."
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                {uniqueLocations.map((location: string) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Product Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Total Products">
            <Box sx={{ p: 2 }}>
              <Typography variant="h3" gutterBottom>
                {products.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </Box>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Categories">
            <Box sx={{ p: 2 }}>
              <Typography variant="h3" gutterBottom>
                {new Set(products.map(p => p.category)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Product Categories
              </Typography>
            </Box>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Total Inventory">
            <Box sx={{ p: 2 }}>
              <Typography variant="h3" gutterBottom>
                {products.reduce((sum, p) => sum + p.quantity, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Units
              </Typography>
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Product Table */}
      <DashboardCard title="Product List">
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onRowClick={handleRowClick}
          bulkActions={bulkActions}
          selectable={true}
          onSelectionChange={setSelectedProducts}
        />
      </DashboardCard>
    </Box>
  );
};

export default ProductCatalog;
