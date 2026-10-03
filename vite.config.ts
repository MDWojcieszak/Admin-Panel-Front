import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~/': `${process.cwd()}/src/`,
    },
  },
  // Pinned to 5173: the backend builds the device-flow approval link and the
  // password-reset link from INTERFACE_URL, which points here. strictPort makes
  // a clash fail loudly — silently sliding to 5174 sends users to whatever else
  // grabbed 5173 (the Electron app defaults to it too), and the resulting page
  // looks broken with nothing to explain why.
  server: { host: true, port: 5173, strictPort: true, proxy: {} },
  // Served from node_modules as-is, MapLibre finds its worker file beside its
  // own; pre-bundled into .vite/deps it looks in the wrong folder. The
  // production build points it at a Vite-built worker instead.
  optimizeDeps: { exclude: ['maplibre-gl'] },
});
