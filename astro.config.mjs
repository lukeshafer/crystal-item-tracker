import { defineConfig } from 'astro/config';

// https://astro.build/config
import tailwind from '@astrojs/tailwind';
import solidJs from '@astrojs/solid-js';

// https://astro.build/config
import image from '@astrojs/image';

// https://astro.build/config
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [tailwind(), solidJs(), image()],
  adapter: vercel()
});