import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://dankchamp.github.io',
  integrations: [tailwind()],
  output: 'static',
  adapter: undefined,
});
