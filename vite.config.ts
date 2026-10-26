import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';

// Shown on the About page. The Docker build has no .git (see .dockerignore),
// so the commit is there only for builds made from a checkout.
const commit = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
})();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __BUILD_COMMIT__: JSON.stringify(commit),
  },
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
