import { defineConfig, devices } from '@playwright/test'
import path from 'path'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false, // Electron apps don't work well with parallel tests
  workers: 1,
  reporter: 'list',
  use: {
    // Electron-specific config
    // We'll use the electron app path from the build output
  }
})