import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true, type: "module" },
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "LabelCheck — Legal Metrology Compliance",
        short_name: "LabelCheck",
        description: "Scan packaged commodity labels for Legal Metrology Rule 6 compliance.",
        theme_color: "#4640d6",
        background_color: "#f6f7fb",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Never cache API/upload responses — scans and photos must always be fresh.
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    // Dev-only: lets a tunnel (loca.lt/trycloudflare) with a random subdomain
    // through Vite's Host-header check so a phone can reach this dev server.
    // Never do this for anything other than a throwaway local test session.
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
