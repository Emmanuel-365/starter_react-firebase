import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Ca doit run sur le port 4000
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000
  }
})
