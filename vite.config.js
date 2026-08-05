import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Forward API + uploaded receipts to the Node backend during `npm run dev`.
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        shop: 'shop.html'
      },
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    }
  }
});

