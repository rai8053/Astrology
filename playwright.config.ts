import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './frontend/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    headless: true,
    screenshot: 'off',
  },
  webServer: {
    command: 'cd frontend && npx vite --port 5173',
    port: 5173,
    timeout: 30000,
    reuseExistingServer: true,
  },
});
