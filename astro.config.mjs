// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// A fully static site. Wrangler serves dist/ as Workers static assets, so no
// adapter is needed.
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    // Keep -webkit-backdrop-filter in the CSS, which Safari before 18 needs.
    build: { cssTarget: ["safari16.4", "chrome111", "firefox114"] },
  },
});
