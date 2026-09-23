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
});
