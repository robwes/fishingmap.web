import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'maps': ['@vis.gl/react-google-maps', '@googlemaps/markerclusterer'],
          'turf': ['@turf/turf', '@turf/jsts'],
          'forms': ['formik', 'yup', 'react-select']
        }
      }
    }
  }
});