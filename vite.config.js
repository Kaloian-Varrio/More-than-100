import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        dashboard: resolve(import.meta.dirname, 'dashboard.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        register: resolve(import.meta.dirname, 'register.html'),
      },
    },
  },
});
