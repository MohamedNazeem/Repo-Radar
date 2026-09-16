import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@repo/api": path.resolve(__dirname, "../../packages/api/src"),
      "@repo/store": path.resolve(__dirname, "../../packages/store/src"),
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@repo/plots": path.resolve(__dirname, "../../packages/plots/src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 43123,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 43123,
    strictPort: true,
  },
});
