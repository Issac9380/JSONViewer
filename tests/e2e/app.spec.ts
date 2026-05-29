import { test, expect } from '@playwright/test'
import path from 'path'

const APP_PATH = path.join(__dirname, '../../release/win-unpacked/JSON Viewer.exe')

test.describe('JSON Viewer E2E', () => {
  test.setTimeout(60000)

  test.skip('basic functionality', async () => {
    // Note: Electron testing requires built app
    // This test is skipped until app is packaged
    // To run after build: npm run dist && npx playwright test
  })
})