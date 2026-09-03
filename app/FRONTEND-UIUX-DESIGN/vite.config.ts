import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';
import fs from 'fs';

// Resolve the real physical path — avoids NTFS junction issues on Windows
// where __dirname can differ from the real path Rollup uses for index.html.
const realRoot = fs.realpathSync(path.resolve(__dirname));

// https://vitejs.dev/config/
export default defineConfig({
  root: realRoot,
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      '@': path.join(realRoot, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});

