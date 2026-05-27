import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [
    icon({
      svgoOptions: {
        multipass: true,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
  server: {
    port: 4323,
    host: true, // Equivalent to --host flag; matches your npm script's 0.0.0.0 binding
  },

  // Remote image optimization — fetches from WP, converts to WebP, caches on CDN
  image: {
    domains: ['cms.bresselsports.com', '104.248.157.67', 'localhost'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.bresselsports.com' },
      { protocol: 'http', hostname: '104.248.157.67' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
});
