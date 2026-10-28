import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === 'serve' && !isPreview ? '/' : '/card-duel/',
  test: {
    // game logic only (no DOM needed)
    environment: 'node',
    // spies on Math.random / crypto.randomUUID never leak between tests
    restoreMocks: true,
  },
}))
