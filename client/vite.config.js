import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    pool: 'threads',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      include: ['src/'],
      exclude: ['src/**/*.test.*', 'src/tests/**', 'src/main.jsx', 'src/setupTests.js'],
      reporter: ['text', 'html'],
      reportOnFailure: true,
    },
  },
});