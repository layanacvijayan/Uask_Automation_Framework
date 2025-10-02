import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
dotenv.config();
// import path from 'path';
//dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit-results.xml' }],
    ['list'],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: true
    }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
   // Base URL
    baseURL: process.env.BASE_URL || 'https://ask.u.ae',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Default timeout for actions
    actionTimeout: 15000,
    
    // Default timeout for navigation
    navigationTimeout: 30000,
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'Asia/Dubai',
    
    // Ignore HTTPS errors (if needed)
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    // Desktop Browsers
   /* {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    }, */
    // Desktop Browsers
   {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    }, 
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // Mobile Browsers - iOS
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 14 Pro'],
        isMobile: true,
        hasTouch: true,
      },
    },
    
    {
      name: 'mobile-safari-landscape',
      use: { 
        ...devices['iPhone 14 Pro landscape'],
        isMobile: true,
        hasTouch: true,
      },
    },
    
    {
      name: 'ipad',
      use: { 
        ...devices['iPad Pro'],
        isMobile: true,
        hasTouch: true,
      },
    },
    
    // Mobile Browsers - Android
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 7'],
        isMobile: true,
        hasTouch: true,
      },
    },
    
    {
      name: 'mobile-chrome-landscape',
      use: { 
        ...devices['Pixel 7 landscape'],
        isMobile: true,
        hasTouch: true,
      },
    },
    
    {
      name: 'galaxy-tab',
      use: { 
        ...devices['Galaxy Tab S4'],
        isMobile: true,
        hasTouch: true,
      },
    },
    
    // Grouped project for mobile testing
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 14 Pro'],
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  
  // Web server configuration (if needed)
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },
});