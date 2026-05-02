import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Toda chamada a /api/* é repassada para o backend SEM remover o /api,
      // pois o Express registra as rotas como app.use('/api', router).
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});