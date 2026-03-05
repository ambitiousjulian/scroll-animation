import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  // Photos served from public/photos/ are referenced as ./photos/<name>
  // in production builds the base can be adjusted here
})
