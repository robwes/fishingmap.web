import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
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
  test: {
    // Deterministic env for service tests (import.meta.env.VITE_* is read
    // at module load).
    env: {
      VITE_BASE_URL: 'http://api.test',
      VITE_IMAGES_URL: 'http://api.test/api/images',
      VITE_MAPS_API_KEY: 'test-maps-key',
      VITE_MAP_ID: 'test-map-id'
    }
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