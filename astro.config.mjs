import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Project site: https://dankchamp.github.io/void
export default defineConfig({
  site: 'https://dankchamp.github.io',
  base: '/void',
  integrations: [tailwind()],
  output: 'static',
});
