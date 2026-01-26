import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap'; // <--- THIS IS THE FIX

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://welcometotheinfinitevoidofautomatedrejections.qzz.io',
      dynamicRoutes: ['/wall', '/submit', '/about'] 
    }),
  ],
});