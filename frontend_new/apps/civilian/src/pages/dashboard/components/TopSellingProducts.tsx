import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
} from '@mui/material';
import { TopSellingProduct } from '../types';

interface TopSellingProductsProps {
  products: TopSellingProduct[];
  onViewAll: () => void;
}

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({
  products,
  onViewAll,
}) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Top-Selling Products</Typography>
          <Button
            color="primary"
            onClick={onViewAll}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Quantity Sold</TableCell>
                <TableCell align="right">Total Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">
                    {product.quantitySold} {product.unit}
                  </TableCell>
                  <TableCell align="right">
                    ${product.totalRevenue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}; 