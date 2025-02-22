import { defineConfig, mergeConfig, type ConfigEnv, type UserConfig } from 'vite';
import { resolve } from 'path';
import baseConfig from '../../config/vite.base';

// https://vitejs.dev/config/
export default (env: ConfigEnv): UserConfig => {
  const base = baseConfig(env);
  return defineConfig(mergeConfig(base, {
    root: __dirname,
    base: '/',
    
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@shared': resolve(__dirname, '../../shared'),
        '@assets': resolve(__dirname, './src/assets'),
        '@components': resolve(__dirname, './src/components'),
        '@features': resolve(__dirname, './src/features'),
        '@pages': resolve(__dirname, './src/pages'),
        '@services': resolve(__dirname, './src/services'),
        '@store': resolve(__dirname, './src/store'),
        '@utils': resolve(__dirname, './src/utils'),
      },
    },

      server: {
        port: 3002,
        host: true
      },

      preview: {
        port: 3002,
        host: true,
      },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },

    // App-specific environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __APP_NAME__: JSON.stringify('Hand Receipt - Defense'),
    },
  }));
};
