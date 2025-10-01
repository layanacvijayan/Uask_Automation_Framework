# 🚀 U-Ask QA Automation Framework - TypeScript + Playwright

**Production-ready test automation framework for UAE Government's U-Ask chatbot with mobile and web browser support**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green)](https://playwright.dev/)
[![Node](https://img.shields.io/badge/Node-18+-brightgreen)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [How to Run Tests](#how-to-run-tests)
- [How to Configure Test Language](#how-to-configure-test-language)
- [Test Coverage](#test-coverage)
- [Mobile & Web Support](#mobile--web-support)
- [Troubleshooting](#troubleshooting)
- [Screenshots and Logs](#screenshots-and-logs)
- [Reporting](#reporting)
- [CI/CD Integration](#cicd-integration)

---

## 🎯 Overview

This framework provides comprehensive automated testing for the U-Ask generative AI chatbot, validating:

### A. Chatbot UI Behavior
- ✅ Widget loading on desktop and mobile devices
- ✅ Message sending and receiving
- ✅ Response rendering in conversation area
- ✅ Multilingual support (English LTR, Arabic RTL)
- ✅ Input field clearing after submission
- ✅ Accessibility and keyboard navigation

### B. GPT-Powered Response Validation
- ✅ Clear and helpful responses to public service queries
- ✅ Hallucination detection using AI
- ✅ Response consistency for similar intents
- ✅ Bilingual consistency (English/Arabic)
- ✅ Clean response formatting
- ✅ Loading states and fallback messages

### C. Security & Injection Handling
- ✅ XSS attack prevention
- ✅ SQL injection prevention
- ✅ Prompt injection resistance
- ✅ Command injection prevention
- ✅ Input sanitization

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn**
- **OpenAI API Key** (for AI validation) - [Get key](https://platform.openai.com/api-keys)

### Installation

```bash
# 1. Navigate to project directory
cd E:\PLAYWRIGHT\uask_Playwright_Automation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# Or install all browsers
npx playwright install

# 4. Create .env file
cp .env.example .env

# 5. Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-actual-key-here
```

### Verify Setup

```bash
# Run a single test to verify setup
npx playwright test e2e/tests/ui.spec.ts --headed --project=chromium
```

---

## ▶️ How to Run Tests

### 1. Run All Tests (All Browsers)

```bash
npm test
```

This runs all 34+ tests across all configured browsers and devices (takes 25-35 minutes).

### 2. Run Specific Test Suite

```bash
# UI tests only (10 tests)
npm run test:ui
# OR
npx playwright test e2e/tests/ui.spec.ts

# AI validation tests (10 tests)
npm run test:ai
# OR
npx playwright test e2e/tests/ai-validation.spec.ts

# Security tests (14 tests)
npm run test:security
# OR
npx playwright test e2e/tests/security.spec.ts
```

### 3. Run with Visible Browser (Headed Mode)

```bash
# Run with browser visible (great for debugging)
npm run test:headed

# Or specific test file
npx playwright test e2e/tests/ui.spec.ts --headed
```

### 4. Run on Specific Browser/Device

```bash
# Desktop Browsers
npx playwright test --project=chromium      # Chrome
npx playwright test --project=firefox       # Firefox
npx playwright test --project=webkit        # Safari

# Mobile Devices
npx playwright test --project=mobile-safari # iPhone 14 Pro
npx playwright test --project=mobile-chrome # Android Pixel 7
npx playwright test --project=ipad          # iPad Pro

# Or use shortcuts
npm run test:desktop   # All desktop browsers
npm run test:mobile    # Mobile devices only
```

### 5. Run Specific Test by Name

```bash
# Run test by name pattern
npx playwright test -g "Chat widget loads"

# Run test by file and line number
npx playwright test e2e/tests/ui.spec.ts:15
```

### 6. Debug Mode

```bash
# Run with Playwright Inspector (step through tests)
npm run test:debug

# Or specific test
npx playwright test e2e/tests/ui.spec.ts:25 --debug
```

### 7. Parallel Execution

```bash
# Run with 4 workers (faster)
npx playwright test --workers=4

# Run serially (one at a time)
npx playwright test --workers=1
```

---

## 🌐 How to Configure Test Language

The framework supports both **English** and **Arabic** testing with automatic layout detection.

### Method 1: Default Language (English)

Tests run in English by default:

```bash
# English tests
npm test
```

### Method 2: Run Arabic Tests

Arabic tests are automatically included in the test suite. The framework will:
- Navigate to `/ar/` URL
- Verify RTL (Right-to-Left) layout
- Test Arabic input and responses

```bash
# All tests including Arabic
npm test

# Run specific Arabic test
npx playwright test -g "Arabic"
```

### Method 3: Configure in Test Code

You can specify language in your test:

```typescript
// English
await chatPage.navigate('en');

// Arabic
await chatPage.navigate('ar');
```

### Method 4: Environment Variable

Set base URL for specific language:

```bash
# In .env file
BASE_URL=https://ask.u.ae   # Framework adds /en/ or /ar/ automatically

# For Arabic only testing (not recommended)
BASE_URL=https://ask.u.ae/ar
```

### Language-Specific Tests

The framework includes:

1. **UI-005**: Multilingual support - Arabic (RTL)
   - Validates Arabic RTL layout
   - Tests Arabic message input
   - Verifies Arabic responses

2. **AI-004**: English/Arabic consistency
   - Compares responses across languages
   - Validates semantic consistency
   - Tests translation accuracy

### Verify RTL Layout for Arabic

```typescript
// In your test
const isRTL = await chatPage.isRTLLayout();
expect(isRTL).toBeTruthy(); // Should be true for Arabic
```

---

## 📊 Test Coverage

### Test Statistics

- **Total Tests**: 34+
- **UI Tests**: 10
- **AI Validation Tests**: 10
- **Security Tests**: 14

### Detailed Breakdown

#### A. UI Behavior Tests (10 tests)
1. ✅ Widget loads on desktop and mobile
2. ✅ User can send messages
3. ✅ AI responses render properly
4. ✅ English (LTR) layout validation
5. ✅ Arabic (RTL) layout validation
6. ✅ Input cleared after sending
7. ✅ Accessibility features
8. ✅ Mobile touch interactions
9. ✅ Response time performance
10. ✅ Multiple messages in conversation

#### B. AI Response Tests (10 tests)
1. ✅ Clear responses for 3 common queries
2. ✅ Hallucination detection
3. ✅ Response consistency
4. ✅ English/Arabic consistency
5. ✅ Response formatting
6. ✅ Loading states
7. ✅ Quality metrics
8. ✅ Public service relevance
9. ✅ Fallback handling
10. ✅ Response time consistency

#### C. Security Tests (14 tests)
1. ✅ XSS prevention (7 payloads)
2. ✅ Prompt injection (8 scenarios)
3. ✅ SQL injection (6 patterns)
4. ✅ Code injection
5. ✅ Long input handling
6. ✅ Special characters
7. ✅ Complex XSS attacks
8. ✅ LDAP injection
9. ✅ Command injection
10. ✅ Path traversal
11. ✅ Session security
12. ✅ CSP validation
13. ✅ HTTPS enforcement
14. ✅ Rate limiting

---

## 📱 Mobile & Web Support

### Supported Devices

#### Desktop Browsers (1920x1080)
- ✅ Chromium (Chrome)
- ✅ Firefox
- ✅ WebKit (Safari)

#### Mobile - iOS
- ✅ iPhone 14 Pro (393x852)
- ✅ iPhone 14 Pro Landscape
- ✅ iPad Pro (1024x1366)

#### Mobile - Android
- ✅ Pixel 7 (360x800)
- ✅ Pixel 7 Landscape
- ✅ Galaxy Tab S4 (1024x768)

### Running Mobile Tests

```bash
# All mobile devices
npm run test:mobile

# Specific mobile device
npx playwright test --project=mobile-safari   # iPhone
npx playwright test --project=mobile-chrome   # Android
npx playwright test --project=ipad            # iPad
```

---

## 🐛 Troubleshooting

### Issue 1: "Modal close button timeout" (Your Current Issue)

**Error Message:**
```
locator.click: Timeout 15000ms exceeded.
element is not visible
```

**Solution:**
The framework has been updated to check if elements are visible before clicking. Update your `UAskChatbotPage.ts` with the latest code from the artifact.

**The fix includes:**
- Check if elements are visible with `isVisible()` before clicking
- Loop through multiple close buttons to find visible one
- Reduce timeout for visibility check to 2 seconds
- Continue test even if widget handling fails

**Quick fix:**
```bash
# Pull latest code from artifact
# Or manually update handleLandingPageWidgets() method
```

### Issue 2: "Timeout waiting for selector"

**Solution:**
```bash
# 1. Inspect website to find correct selectors
npm run test:codegen

# 2. Update selectors in pages/UAskChatbotPage.ts
# Lines 16-22 approximately

# 3. Example actual selectors:
private readonly chatInputSelector = 'textarea#user-input';
private readonly sendButtonSelector = 'button[data-testid="send-btn"]';
```

### Issue 3: "OpenAI API key not configured"

**Solution:**
```bash
# 1. Check .env file exists
ls .env

# 2. Verify API key format (no spaces)
# Correct: OPENAI_API_KEY=sk-abc123
# Wrong:   OPENAI_API_KEY = sk-abc123

# 3. Restart terminal/IDE after adding key
```

### Issue 4: "Browser not found"

**Solution:**
```bash
# Reinstall browsers
npx playwright install --force

# Or specific browser
npx playwright install chromium
```

### Issue 5: "Tests fail on Arabic language"

**Solution:**
```bash
# 1. Verify /ar/ URL is accessible
# Open https://ask.u.ae/ar/ in browser

# 2. Check RTL CSS is loading
# Inspect page direction in browser

# 3. Update Arabic-specific selectors if needed
```

### Issue 6: "Module not found" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Verify TypeScript compilation
npx tsc --noEmit
```

### Issue 7: Landing page widgets changing

**Solution:**
Update `handleLandingPageWidgets()` method in `UAskChatbotPage.ts`:

```typescript
// Add new widget selectors
const newWidgetButton = this.page.getByRole('button', { name: 'New Widget Text' });
if (await newWidgetButton.isVisible()) {
  await newWidgetButton.click();
}
```

---

## 📸 Screenshots and Logs

### Screenshot Locations

Screenshots are automatically captured:

**During Test Execution:**
- `screenshots/before-send-[timestamp].png` - Before sending message
- `screenshots/response-[timestamp].png` - After receiving response
- `screenshots/widget-loaded-[device].png` - Widget loading verification

**On Test Failure:**
- `test-results/[test-name]/test-failed-1.png`
- Full page screenshots in `playwright-report/`

### Log Files

**Execution Logs:**
```
logs/test-execution.log  # All logs
logs/errors.log          # Errors only
```

**View logs:**
```bash
# View all logs
cat logs/test-execution.log

# View errors only
cat logs/errors.log

# Tail logs in real-time
tail -f logs/test-execution.log
```

**Log Levels:**
- INFO: General information
- WARN: Warnings (non-critical)
- ERROR: Errors (test failures)
- DEBUG: Detailed debugging info

### Configure Logging

Edit `.env` file:
```bash
LOG_LEVEL=info    # Options: info, debug, warn, error
```

---

## 📊 Reporting

### 1. Playwright HTML Report

```bash
# Run tests
npm test

# Open report automatically
npm run test:report

# Or manually open
npx playwright show-report
```

**Report includes:**
- Test results per browser/device
- Screenshots on failure
- Video recordings
- Error traces
- Execution timeline

### 2. Allure Report (Advanced)

```bash
# Install Allure (first time only)
# macOS
brew install allure

# Windows (with Scoop)
scoop install allure

# Generate and open report
npm run allure:generate
npm run allure:open
```

**Allure report includes:**
- Interactive dashboard
- Trend charts
- Test distribution
- Duration graphs
- Detailed test steps
- Attachments (screenshots, logs)

### 3. Console Output

Real-time test results in terminal:
```
✓ UI-001: Chat widget loads correctly (5.2s)
✓ UI-002: User can send messages (8.1s)
✗ SEC-001: XSS prevention (timeout)

25 passed, 1 failed, 0 skipped
```

### 4. CI/CD Reports

- **JUnit XML**: `junit-results.xml`
- **JSON**: `test-results.json`

---

## 🚀 CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: U-Ask Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npm test
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins

```groovy
pipeline {
    agent any
    
    environment {
        OPENAI_API_KEY = credentials('openai-api-key')
    }
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install chromium'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

---

## 🎯 Best Practices

### 1. Before Running Tests
- ✅ Verify `.env` file exists with API key
- ✅ Check selectors are up to date
- ✅ Ensure browsers are installed
- ✅ Test internet connection

### 2. During Development
- ✅ Use `--headed` mode to see tests run
- ✅ Use `--debug` mode for step-by-step execution
- ✅ Check logs for detailed information
- ✅ Review screenshots on failures

### 3. In CI/CD
- ✅ Use headless mode
- ✅ Set retry count: `--retries=2`
- ✅ Run in parallel with workers
- ✅ Archive test reports

### 4. Maintenance
- ✅ Update selectors when UI changes
- ✅ Review test failures weekly
- ✅ Update test data regularly
- ✅ Monitor OpenAI API usage/costs

---

## 📞 Support

**Need Help?**

1. Check logs: `logs/test-execution.log`
2. Review screenshots: `screenshots/`
3. Check this README's Troubleshooting section
4. Review Playwright documentation: https://playwright.dev/

**Common Commands Quick Reference:**

```bash
# Setup
npm install && npx playwright install

# Run Tests
npm test                  # All tests
npm run test:headed       # With browser visible
npm run test:debug        # Debug mode

# Specific Tests
npm run test:ui           # UI tests only
npm run test:mobile       # Mobile tests only

# Reports
npm run test:report       # Open HTML report
npm run allure:open       # Open Allure report

# Utilities
npm run test:codegen      # Inspect website
```

---

## 📄 License

MIT License

---

## 👥 Authors

QA Automation Team - U-Ask Testing

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-29  
**Framework**: TypeScript + Playwright  
**Supported**: Desktop, Mobile Web, iOS, Android

---

## 🎯 Overview

This framework provides comprehensive automated testing for the U-Ask generative AI chatbot, validating:

### A. Chatbot UI Behavior
- ✅ Widget loading on desktop and mobile devices
- ✅ Message sending and receiving
- ✅ Response rendering in conversation area
- ✅ Multilingual support (English LTR, Arabic RTL)
- ✅ Input field clearing after submission
- ✅ Accessibility and keyboard navigation

### B. GPT-Powered Response Validation
- ✅ Clear and helpful responses to public service queries
- ✅ Hallucination detection using AI
- ✅ Response consistency for similar intents
- ✅ Bilingual consistency (English/Arabic)
- ✅ Clean response formatting
- ✅ Loading states and fallback messages

### C. Security & Injection Handling
- ✅ XSS attack prevention
- ✅ SQL injection prevention
- ✅ Prompt injection resistance
- ✅ Command injection prevention
- ✅ Input sanitization

---

## ✨ Features

### 🌐 Multi-Browser Support
- Chromium, Firefox, WebKit
- iOS Safari (iPhone, iPad)
- Android Chrome
- Custom device emulation

### 📱 Mobile-First Testing
- Real mobile device emulation
- Touch interactions
- Portrait and landscape orientations
- Responsive design validation

### 🤖 AI-Powered Validation
- OpenAI GPT-4 integration
- Hallucination detection
- Semantic similarity analysis
- Quality metrics evaluation

### 📊 Comprehensive Reporting
- Playwright HTML reports
- Allure test reports
- Screenshots on failure
- Video recording
- Detailed logs

---

## 📁 Project Structure

```
uask-qa-automation-typescript/
├── pages/
│   └── UAskChatbotPage.ts          # Page Object Model
├── tests/
│   ├── ui.spec.ts                   # UI behavior tests
│   ├── ai-validation.spec.ts        # AI response tests
│   └── security.spec.ts             # Security tests
├── utils/
│   ├── AIValidator.ts               # AI validation utilities
│   └── logger.ts                    # Winston logger
├── playwright.config.ts             # Playwright configuration
├── test-data.json                   # Test data (EN & AR)
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── .env.example                     # Environment template
├── screenshots/                     # Test screenshots
├── logs/                           # Execution logs
├── playwright-report/              # HTML reports
├── allure-results/                 # Allure results
└── README.md                       # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn**
- **OpenAI API Key** (for AI validation) - [Get key](https://platform.openai.com/api-keys)

### Installation

```bash
# 1. Clone or create project directory
mkdir uask-qa-automation && cd uask-qa-automation

# 2. Initialize npm project (if not already done)
npm init -y

# 3. Install dependencies
npm install

# 4. Install Playwright browsers
npm run install:browsers

# 5. Create .env file
cp .env.example .env

# 6. Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-actual-key-here
```

### Verify Setup

```bash
# Run a single test to verify setup
npx playwright test tests/ui.spec.ts:3 --headed
```

---

## ▶️ Running Tests

### All Tests (All Browsers)

```bash
npm test
```

### Desktop Only (Chromium)

```bash
npm run test:desktop
```

### Mobile Only

```bash
npm run test:mobile
```

### Specific Test Suite

```bash
# UI tests only
npm run test:ui

# AI validation tests
npm run test:ai

# Security tests
npm run test:security
```

### With Browser Visible (Headed Mode)

```bash
npm run test:headed
```

### Debug Mode

```bash
npm run test:debug
```

### Specific Browser

```bash
# Chromium
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Mobile Safari
npx playwright test --project=mobile-safari

# Mobile Chrome
npx playwright test --project=mobile-chrome
```

### Run Specific Test

```bash
# By test name
npx playwright test -g "Chat widget loads"

# By file and line number
npx playwright test tests/ui.spec.ts:15
```

---

## 📊 Test Coverage

### Test Statistics

- **Total Tests**: 34+
- **UI Tests**: 10
- **AI Validation Tests**: 10
- **Security Tests**: 14

### Test Matrix

| Test Category | Desktop | Mobile | Arabic | AI Validation |
|--------------|---------|--------|--------|---------------|
| UI Behavior | ✅ | ✅ | ✅ | ❌ |
| AI Responses | ✅ | ✅ | ✅ | ✅ |
| Security | ✅ | ✅ | ✅ | ❌ |

---

## 📱 Mobile & Web Support

### Supported Devices

#### Desktop Browsers
- Chrome (1920x1080)
- Firefox (1920x1080)
- Safari/WebKit (1920x1080)

#### Mobile - iOS
- iPhone 14 Pro (393x852)
- iPhone 14 Pro Landscape
- iPad Pro (1024x1366)

#### Mobile - Android
- Pixel 7 (360x800)
- Pixel 7 Landscape
- Galaxy Tab S4 (1024x768)

### Device-Specific Testing

```typescript
// Tests automatically detect device type
const deviceType = await chatPage.getDeviceType();
// Returns: 'mobile' | 'tablet' | 'desktop'

// Check if mobile view
const isMobile = await chatPage.isMobileView();
```

### Custom Device Emulation

Edit `playwright.config.ts`:

```typescript
{
  name: 'custom-mobile',
  use: {
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Your custom UA'
  }
}
```

---

## ⚙️ Configuration

### Test Language

Configure test language in `.env`:

```bash
# For English tests
BASE_URL=https://ask.u.ae

# Tests will use /en/ or /ar/ automatically
```

Or specify in test:

```typescript
await chatPage.navigate('ar'); // Arabic
await chatPage.navigate('en'); // English
```

### Timeouts

Edit `playwright.config.ts`:

```typescript
timeout: 60 * 1000,           // Test timeout
actionTimeout: 15000,          // Action timeout
navigationTimeout: 30000,      // Navigation timeout
```

### Parallel Execution

```bash
# Run in parallel (multiple workers)
npx playwright test --workers=4

# Run serially
npx playwright test --workers=1
```

### Retry Failed Tests

```bash
# Retry failed tests 2 times
npx playwright test --retries=2
```

---

## 📊 Reporting

### Playwright HTML Report

```bash
# Run tests
npm test

# Open report
npm run test:report
```

### Allure Report

```bash
# Generate and open Allure report
npm run allure:generate
npm run allure:open
```

### View Test Results

```bash
# Show last HTML report
npx playwright show-report

# Show specific report
npx playwright show-report playwright-report
```

### Screenshot and Video Artifacts

- **Screenshots**: `screenshots/` folder
- **Videos**: `test-results/*/video.webm` (on failure)
- **Traces**: `test-results/*/trace.zip` (on retry)

### Logs

- **Execution logs**: `logs/test-execution.log`
- **Error logs**: `logs/errors.log`

---

## 🔧 Advanced Features

### Handling Landing Page Widgets

The framework automatically handles:
- Cookie consent banners
- "Accept and continue" buttons
- Modal overlays
- Terms and conditions

```typescript
// Automatically called in beforeEach
await chatPage.handleLandingPageWidgets();
```

### AI Response Validation

```typescript
import { AIValidator } from './utils/AIValidator';

const validator = new AIValidator();

// Check for hallucinations
const result = await validator.checkHallucination(query, response);
console.log(result.isHallucinated); // boolean
console.log(result.confidence); // 0-1
console.log(result.reason); // explanation

// Calculate semantic similarity
const similarity = validator.calculateSemanticSimilarity(text1, text2);
console.log(similarity); // 0-1

// Evaluate response quality
const metrics = validator.evaluateResponseQuality(query, response);
console.log(metrics.lengthAppropriate); // boolean
console.log(metrics.relevanceScore); // 0-1
```

### Custom Test Data

Edit `test-data.json` to add your test scenarios:

```json
{
  "common_queries": {
    "english": [
      {
        "query": "Your test query",
        "expected_keywords": ["keyword1", "keyword2"]
      }
    ]
  }
}
```

---

## 🔐 Security Testing

The framework tests against:

- **XSS Attacks**: 7 different payloads
- **SQL Injection**: 6 common patterns
- **Prompt Injection**: 8 manipulation attempts
- **Code Injection**: 5 template injections
- **Command Injection**: 5 OS command attempts
- **Path Traversal**: 4 directory traversal attempts

All security tests verify:
1. Input is sanitized
2. Scripts are not executed
3. Errors are not exposed
4. System responds gracefully

---

## 🚀 CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run tests
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: npm test
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Jenkins

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Report') {
            steps {
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Report'
                ])
            }
        }
    }
}
```

---

## 🐛 Troubleshooting

### Issue: "Playwright browser not found"

```bash
# Reinstall browsers
npx playwright install --force
```

### Issue: "Timeout waiting for selector"

**Solution**: Update selectors in `UAskChatbotPage.ts` after inspecting actual website:

```bash
# Use codegen to inspect website
npm run test:codegen
```

### Issue: "OpenAI API key not configured"

**Solution**: 
1. Create `.env` file from `.env.example`
2. Add your API key: `OPENAI_API_KEY=sk-...`
3. Ensure no spaces around `=`

### Issue: "Tests fail on mobile devices"

**Solution**:
- Verify `isMobile: true` in config
- Check `hasTouch: true` is set
- Test on actual device configuration

### Issue: "Arabic RTL layout not detected"

**Solution**:
- Ensure navigating to `/ar/` URL
- Check page fully loaded before checking direction
- Verify CSS `direction` property

### Issue: "Landing page widgets not handled"

**Solution**:
- Update selectors in `handleLandingPageWidgets()`
- Increase wait timeouts
- Check for dynamic content loading

### Debug Tests

```bash
# Run with Playwright Inspector
npm run test:debug

# Run specific test with UI
npx playwright test tests/ui.spec.ts --headed --debug

# Show browser console logs
npx playwright test --headed
```

---

## 📈 Performance

### Execution Times (Approximate)

| Test Suite | Tests | Duration |
|------------|-------|----------|
| UI Tests | 10 | 5-7 min |
| AI Tests | 10 | 10-15 min |
| Security | 14 | 8-12 min |
| **Full Suite** | **34** | **23-34 min** |

### Optimization Tips

1. **Run in parallel**: Use `--workers=4`
2. **Skip AI validation in CI**: Set `SKIP_AI_VALIDATION=true`
3. **Use test sharding**: Split tests across machines
4. **Cache dependencies**: Use CI caching for `node_modules`

---

## 💰 Cost Considerations

### OpenAI API Costs

- Each AI validation: ~$0.01-0.02
- Full test run with AI: ~$0.30-0.50
- Daily CI runs: ~$10-15/month

### Cost Optimization

```typescript
// Skip AI validation in CI
const skipAI = process.env.CI && process.env.SKIP_AI_VALIDATION;

if (!skipAI) {
  await validator.checkHallucination(query, response);
}
```

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Allure Reports](https://docs.qameta.io/allure/)
- [OpenAI API](https://platform.openai.com/docs/)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-test`
3. Add tests and documentation
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add new test'`
6. Push: `git push origin feature/new-test`
7. Create Pull Request

---

## 📝 Test Execution Checklist

Before running tests:

- [ ] Install Node.js 18+
- [ ] Run `npm install`
- [ ] Install Playwright browsers
- [ ] Create `.env` file with OpenAI API key
- [ ] Inspect website and update selectors
- [ ] Run smoke test to verify setup
- [ ] Configure test language (EN/AR)
- [ ] Set appropriate timeouts
- [ ] Choose target devices/browsers

---

## 🎯 Success Criteria

Your setup is successful when:

✅ All dependencies installed  
✅ Playwright browsers ready  
✅ At least one test passes  
✅ Screenshots generated  
✅ HTML report opens  
✅ Allure report generates  
✅ Mobile and desktop tests run  
✅ Arabic and English tests work  
✅ AI validation functioning  

---

## 📞 Support & Contact

**Issues?**
1. Check logs in `logs/test-execution.log`
2. Review screenshots in `screenshots/`
3. Check Playwright trace files
4. Review this README's Troubleshooting section

**Common Commands Quick Reference:**

```bash
# Setup
npm install                    # Install dependencies
npm run install:browsers       # Install Playwright browsers

# Run Tests
npm test                       # All tests, all browsers
npm run test:desktop           # Desktop only
npm run test:mobile            # Mobile only
npm run test:headed            # With visible browser
npm run test:debug             # Debug mode

# Specific Tests
npm run test:ui                # UI tests only
npm run test:ai                # AI validation tests
npm run test:security          # Security tests

# Reports
npm run test:report            # Open HTML report
npm run allure:generate        # Generate Allure report
npm run allure:open            # Open Allure report

# Utilities
npm run test:codegen           # Inspect website with codegen
npm run lint                   # Lint code
npm run format                 # Format code
```

---

## 📄 License

MIT License - Feel free to use and modify

---

## 👥 Authors

QA Automation Team - U-Ask Testing

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-29  
**Framework**: TypeScript + Playwright  
**Supported Platforms**: Desktop, Mobile Web, iOS, Android
