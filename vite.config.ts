import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const backendProxy = {
  "/api": {
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
  },
  "/ws": {
    target: "ws://127.0.0.1:8000",
    ws: true,
  },
};

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5174,
    proxy: backendProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    proxy: backendProxy,
  },
});
