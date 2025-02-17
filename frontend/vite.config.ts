import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@shared': path.resolve(__dirname, 'shared/src'),
      '@frontend_defense': path.resolve(__dirname, './frontend_defense/src'),
      '@frontend_civilian': path.resolve(__dirname, './frontend_civilian/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        defense: path.resolve(__dirname, 'frontend_defense/src/app/App.tsx'),
        civilian: path.resolve(__dirname, 'frontend_civilian/src/app/App.tsx'),
      },
    },
  },
});
