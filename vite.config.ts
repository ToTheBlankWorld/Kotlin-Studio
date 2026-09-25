import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) return 'three';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/animejs')) return 'motion';
          return undefined;
        },
      },
    },
  },
});
