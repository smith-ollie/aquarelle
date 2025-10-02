// @ts-check
import { defineConfig } from "astro/config";
import glsl from "vite-plugin-glsl";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: process.env.SITE_BASE_URL || '',
  integrations: [react({ experimentalReactChildren: true }), mdx()],
});
