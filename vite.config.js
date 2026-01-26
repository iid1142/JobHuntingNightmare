import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'; // <--- THIS IS THE FIX

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sitemap({
      hostname: 'https://welcometotheinfinitevoidofautomatedrejections.qzz.io',
      dynamicRoutes: ['/wall', '/submit', '/about']
    }),
  ],
  //server: {
  //  host:true,
  //}
})