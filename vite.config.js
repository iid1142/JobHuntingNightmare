import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://welcometotheinfinitevoidofautomatedrejections.qzz.io',
      dynamicRoutes: ['/wall', '/submit', '/about'] 
    }),
  ],
});