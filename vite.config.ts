import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  vite: {
    server: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 8080,
      strictPort: false,
      allowedHosts: true,
    },
    preview: {
      host: "0.0.0.0",
      port: Number(process.env.PORT) || 8080,
      allowedHosts: true,
    },
  },
});
