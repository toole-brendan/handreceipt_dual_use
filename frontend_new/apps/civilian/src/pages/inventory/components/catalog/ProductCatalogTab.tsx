import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

// Mock data - replace with actual data fetching
const mockCatalogData = {
  id: 'root',
  name: 'Product Catalog',
  children: [
    {
      id: 'coffee',
      name: 'Coffee',
      children: [
        {
          id: 'green-coffee',
          name: 'Green Coffee',
          children: [
            {
              id: 'ethiopian',
              name: 'Ethiopian',
              children: [
                { id: 'yirgacheffe', name: 'Yirgacheffe' },
                { id: 'sidamo', name: 'Sidamo' },
              ],
            },
            {
              id: 'colombian',
              name: 'Colombian',
              children: [
                { id: 'supremo', name: 'Supremo' },
                { id: 'excelso', name: 'Excelso' },
              ],
            },
          ],
        },
        {
          id: 'roasted-coffee',
          name: 'Roasted Coffee',
          children: [
            { id: 'light-roast', name: 'Light Roast' },
            { id: 'medium-roast', name: 'Medium Roast' },
            { id: 'dark-roast', name: 'Dark Roast' },
          ],
        },
      ],
    },
  ],
};

interface CatalogNode {
  id: string;
  name: string;
  children?: CatalogNode[];
}

const renderTree = (node: CatalogNode) => (
  <TreeItem key={node.id} nodeId={node.id} label={node.name}>
    {Array.isArray(node.children)
      ? node.children.map((child) => renderTree(child))
      : null}
  </TreeItem>
);

export const ProductCatalogTab: React.FC = () => {
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);

  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    setSelectedNode(nodeId);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      {/* Catalog Tree */}
      <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Categories
        </Typography>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          onNodeSelect={handleNodeSelect}
          sx={{ 
            height: '100%',
            flexGrow: 1,
            maxWidth: 400,
            overflowY: 'auto',
          }}
        >
          {renderTree(mockCatalogData)}
        </TreeView>
      </Paper>

      {/* Template Editor */}
      <Paper sx={{ flexGrow: 1, p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            Template Editor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a category to edit its template
          </Typography>
          {/* Template editor form will go here */}
        </Stack>
      </Paper>

      {/* Preview Panel */}
      <Paper sx={{ width: 300, p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            Preview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live preview of the template will appear here
          </Typography>
          {/* Preview content will go here */}
        </Stack>
      </Paper>
    </Box>
  );
};
