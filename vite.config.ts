import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Sync data/*.json → public/data/ before build & dev
function syncData(): Plugin {
  const src = resolve(__dirname, "data");
  const dest = resolve(__dirname, "public/data");
  return {
    name: "sync-data",
    buildStart() {
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true, force: true });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), syncData()],
  base: process.env.VITE_BASE_PATH || "/Social-Dashboard/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
