import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  plugins: [{
    name: 'clean-content-routes',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url?.startsWith('/articles/')) request.url = '/article.html';
        if (request.url?.startsWith('/categories/')) request.url = '/category.html';
        next();
      });
    },
  }],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        dashboard: resolve(import.meta.dirname, 'dashboard.html'),
        profile: resolve(import.meta.dirname, 'profile.html'),
        assessment: resolve(import.meta.dirname, 'assessment.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        register: resolve(import.meta.dirname, 'register.html'),
        article: resolve(import.meta.dirname, 'article.html'),
        category: resolve(import.meta.dirname, 'category.html'),
      },
    },
  },
});
