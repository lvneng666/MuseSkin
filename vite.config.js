import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Forward API calls to the Spring Boot backend during dev.
      '/api': 'http://localhost:8080',
    },
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
  },
});
