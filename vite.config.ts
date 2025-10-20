import { defineConfig } from 'vite'
import path from 'path'
import tsconfigPaths from "vite-tsconfig-paths"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'src/core'),
    },
  },
})
