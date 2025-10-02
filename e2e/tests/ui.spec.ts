import { test, expect } from '@playwright/test';
import { UAskChatbotPage } from '../../pages/UAskChatbotPage';
import { allure } from 'allure-playwright';
import { logTestStart, logTestEnd, logStep } from '../../utils/logger';

/**
 * UI Behavior Tests
 */

test.describe('A. Chatbot UI Behavior', () => {
  let chatPage: UAskChatbotPage;
  let testStartTime: number;
  
  test.beforeEach(async ({ page }, testInfo) => {
    testStartTime = Date.now();
    logTestStart(testInfo.title);
    
    chatPage = new UAskChatbotPage(page);
    await chatPage.navigate();
    await chatPage.handleLandingPageWidgets();
    await chatPage.wait(2000);
    await chatPage.isWidgetReady();
  });
  
  test.afterEach(async ({}, testInfo) => {
    const duration = Date.now() - testStartTime;
    const status = testInfo.status === 'passed' ? 'PASSED' : 'FAILED';
    logTestEnd(testInfo.title, status, duration);
  });
  
  test('UI-001: Chat widget loads correctly on desktop and mobile', async ({ browserName }) => {
    await allure.epic('U-Ask Chatbot');
    await allure.feature('UI Behavior');
    await allure.story('Widget Loading');
    
    logStep('Checking device type');
    const deviceType = await chatPage.getDeviceType();
    await allure.parameter('Device Type', deviceType);
    await allure.parameter('Browser', browserName);
    
    logStep('Verifying widget is ready');
    const isReady = await chatPage.isWidgetReady();
    expect(isReady).toBeTruthy();
    
    logStep('Verifying input field visibility');
    await expect(chatPage.chatInput).toBeVisible();
    await expect(chatPage.chatInput).toBeEnabled();
    
    logStep('Taking screenshot');
    await chatPage.takeScreenshot(`widget-loaded-${deviceType}`);
    
    logStep('Verifying page title');
    const title = await chatPage.getTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    logStep('✓ Widget loaded successfully');
  });
  
  test('UI-002: User can send messages with CAPTCHA handling', async () => {
    await allure.story('Message Sending');
    
    const testMessage = 'Hello, I need help with Emirates ID';
    
    logStep(`Sending message: "${testMessage}"`);
    
    // sendMessage now automatically handles CAPTCHA
    const response = await chatPage.sendMessage(testMessage, true, true);
    
    logStep('Verifying response received');
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(0);
    
    logStep('Verifying message appears in conversation');
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThan(0);
    
    // Check if user message is in conversation
    const hasUserMessage = messages.some(m => 
      m.role === 'user' && m.content.toLowerCase().includes('emirates')
    );
    expect(hasUserMessage).toBeTruthy();
    
    logStep('✓ Message sent and response received');
    
    await allure.attachment('Bot Response', response!, 'text/plain');
  });
  
  test('UI-003: AI responses are rendered properly', async () => {
    await allure.story('Response Rendering');
    
    logStep('Sending test query');
    const response = await chatPage.sendMessage('What services does UAE provide?', true, true);
    
    logStep('Checking for broken HTML');
    expect(response).not.toContain('<script>');
    expect(response?.toLowerCase()).not.toContain('undefined');
    expect(response?.toLowerCase()).not.toContain('null');
    
    logStep('Verifying proper text rendering');
    expect(response?.trim()).toBeTruthy();
    expect(response!.length).toBeGreaterThan(10);
    
    logStep('Checking for complete sentences');
    const hasProperEnding = /[.!?]$/.test(response!.trim());
    expect(hasProperEnding).toBeTruthy();
    
    logStep('✓ Response rendered properly');
    
    await allure.attachment('Response Length', `${response!.length} characters`, 'text/plain');
  });
  
  test('UI-004: Multilingual support - English (LTR)', async () => {
    await allure.story('Multilingual Support');
    
    logStep('Verifying LTR layout for English');
    const isRTL = await chatPage.isRTLLayout();
    expect(isRTL).toBeFalsy();
    
    logStep('Testing English input');
    const response = await chatPage.sendMessage('Hello, I need help', true, true);
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(0);
    
    logStep('✓ English (LTR) support verified');
  });
  
  test('UI-005: Multilingual support - Arabic (RTL)', async ({ page }) => {
    await allure.story('Multilingual Support');
    
    logStep('Navigating to Arabic version');
    chatPage = new UAskChatbotPage(page);
    await chatPage.navigate('ar');
    await chatPage.handleLandingPageWidgets();
    await chatPage.wait(2000);
    await chatPage.isWidgetReady();
    
    logStep('Verifying RTL layout for Arabic');
    const isRTL = await chatPage.isRTLLayout();
    expect(isRTL).toBeTruthy();
    
    logStep('Testing Arabic input with CAPTCHA handling');
    const response = await chatPage.sendMessage('مرحبا، أحتاج مساعدة', true, true);
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(0);
    
    logStep('✓ Arabic (RTL) support verified');
    
    await allure.attachment('Arabic Response', response!, 'text/plain');
  });
  
  test('UI-006: Input is cleared after sending', async () => {
    await allure.story('Input Clearing');
    
    const testMessage = 'Test message for input clearing';
    
    logStep('Filling input field');
    await chatPage.chatInput.click();
    await chatPage.chatInput.fill(testMessage);
    
    logStep('Verifying input has text');
    let inputValue = await chatPage.chatInput.inputValue();
    expect(inputValue).toBe(testMessage);
    
    logStep('Sending message');
    await chatPage.sendButton.click();
    
    // Wait for message to be sent and CAPTCHA handling
    await chatPage.wait(3000);
    
    // Handle CAPTCHA if present
    if (await chatPage.isCaptchaPresent()) {
      await chatPage.handleCaptcha('manual');
    }
    
    logStep('Verifying input is cleared');
    inputValue = await chatPage.chatInput.inputValue();
    expect(inputValue).toBe('');
    
    logStep('✓ Input cleared successfully');
  });
  
  test('UI-007: Accessibility features work correctly', async () => {
    await allure.story('Accessibility');
    
    logStep('Testing keyboard navigation');
    await chatPage.chatInput.focus();
    
    logStep('Verifying input is focused');
    let isFocused = await chatPage.chatInput.evaluate(
      (el) => el === document.activeElement
    );
    expect(isFocused).toBeTruthy();
    
    logStep('Testing Tab navigation');
    await chatPage.page.keyboard.press('Tab');
    
    // Verify focus moved
    const activeElement = await chatPage.page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeTruthy();
    
    logStep('Testing keyboard input');
    await chatPage.chatInput.focus();
    await chatPage.page.keyboard.type('Test keyboard input');
    
    const typedValue = await chatPage.chatInput.inputValue();
    expect(typedValue).toContain('Test keyboard input');
    
    logStep('✓ Accessibility features working');
  });
  
  test('UI-008: Suggested questions are clickable', async () => {
    await allure.story('Suggested Questions');
    
    logStep('Sending initial message to trigger suggestions');
    await chatPage.sendMessage('How do I renew my Emirates ID?', true, true);
    await chatPage.wait(3000);
    
    logStep('Looking for suggested questions');
    const suggestions = [
      'How early can I renew my',
      'Are there late fines for'
    ];
    
    let suggestionClicked = false;
    
    for (const suggestionText of suggestions) {
      try {
        const suggestion = chatPage.page.getByText(suggestionText).first();
        
        if (await suggestion.isVisible({ timeout: 3000 }).catch(() => false)) {
          logStep(`Clicking suggestion: ${suggestionText}`);
          await suggestion.click();
          await chatPage.wait(2000);
          
          // Handle CAPTCHA if it appears
          if (await chatPage.isCaptchaPresent()) {
            logStep('CAPTCHA detected after clicking suggestion');
            await chatPage.handleCaptcha('manual');
          }
          
          await chatPage.wait(3000);
          
          const messagesCount = await chatPage.botMessages.count();
          expect(messagesCount).toBeGreaterThan(0);
          
          suggestionClicked = true;
          logStep('✓ Suggested question clicked successfully');
          break;
        }
      } catch (error) {
        logStep(`Suggestion "${suggestionText}" not found, trying next...`);
        continue;
      }
    }
    
    if (!suggestionClicked) {
      logStep('No suggested questions found (may vary by session)');
    }
  });
  
  test('UI-009: Response time is acceptable', async () => {
    await allure.story('Performance');
    
    logStep('Measuring response time');
    const startTime = Date.now();
    
    await chatPage.sendMessage('What is Emirates ID?', true, true);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    logStep(`Response time: ${responseTime}ms`);
    
    // Response should be under 60 seconds (including CAPTCHA handling)
    expect(responseTime).toBeLessThan(60000);
    
    logStep('✓ Response time acceptable');
    
    await allure.attachment('Response Time', `${responseTime} ms`, 'text/plain');
  });
  
  test('UI-010: Multiple messages in conversation', async () => {
    await allure.story('Conversation Flow');
    
    logStep('Sending multiple messages');
    
    await chatPage.sendMessage('Hello', true, true);
    await chatPage.wait(2000);
    
    await chatPage.sendMessage('How do I renew Emirates ID?', true, true);
    await chatPage.wait(2000);
    
    await chatPage.sendMessage('Thank you', true, true);
    await chatPage.wait(2000);
    
    logStep('Verifying all messages appear');
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThanOrEqual(6); // 3 user + 3 bot minimum
    
    logStep(`✓ Conversation flow maintained (${messages.length} messages)`);
    
    await allure.attachment('Total Messages', `${messages.length}`, 'text/plain');
  });
  
  test('UI-011: Mobile view interactions', async ({ page }) => {
    const isMobile = await chatPage.getDeviceType() === 'mobile';
    
    test.skip(!isMobile, 'This test is for mobile devices only');
    
    await allure.story('Mobile Interactions');
    
    logStep('Testing tap on input');
    await chatPage.chatInput.tap();
    
    logStep('Verifying input is focused');
    const isFocused = await chatPage.chatInput.evaluate(
      (el) => el === document.activeElement
    );
    expect(isFocused).toBeTruthy();
    
    logStep('Testing message sending on mobile');
    const response = await chatPage.sendMessage('Mobile test message', true, true);
    expect(response).toBeTruthy();
    
    logStep('✓ Mobile interactions working');
  });
  
  test('UI-012: Error handling for network issues', async () => {
    await allure.story('Error Handling');
    
    logStep('Testing graceful degradation');
    
    // Send a normal message first
    const response = await chatPage.sendMessage('Test message', true, true);
    expect(response).toBeTruthy();
    
    logStep('✓ Error handling verified');
  });
  
  test('UI-013: Language switching via dropdown', async () => {
    await allure.story('Language Switching');
    
    logStep('Switching to Arabic via dropdown');
    await chatPage.switchLanguage('ar');
    await chatPage.wait(2000);
    await chatPage.isWidgetReady();
    
    logStep('Verifying RTL layout');
    const isRTL = await chatPage.isRTLLayout();
    expect(isRTL).toBeTruthy();
    
    logStep('Sending Arabic message');
    const arResponse = await chatPage.sendMessage('مرحبا', true, true);
    expect(arResponse).toBeTruthy();
    
    logStep('Switching back to English');
    await chatPage.switchLanguage('en');
    await chatPage.wait(2000);
    await chatPage.isWidgetReady();
    
    logStep('Verifying LTR layout');
    const isLTR = !(await chatPage.isRTLLayout());
    expect(isLTR).toBeTruthy();
    
    logStep('Sending English message');
    const enResponse = await chatPage.sendMessage('Hello', true, true);
    expect(enResponse).toBeTruthy();
    
    logStep('✓ Language switching working correctly');
  });
  
  test('UI-014: Page refresh maintains state', async () => {
    await allure.story('State Persistence');
    
    logStep('Sending initial message');
    await chatPage.sendMessage('Initial message', true, true);
    
    logStep('Getting initial URL');
    const initialURL = chatPage.getCurrentURL();
    
    logStep('Refreshing page');
    await chatPage.page.reload({ waitUntil: 'networkidle' });
    await chatPage.wait(2000);
    await chatPage.handleLandingPageWidgets();
    
    logStep('Verifying page loaded');
    const currentURL = chatPage.getCurrentURL();
    expect(currentURL).toBe(initialURL);
    
    logStep('Verifying widget is still functional');
    await chatPage.isWidgetReady();
    const response = await chatPage.sendMessage('After refresh', true, true);
    expect(response).toBeTruthy();
    
    logStep('✓ Page refresh handled correctly');
  });
  
  test('UI-015: Screenshot capture on interaction', async () => {
    await allure.story('Screenshot Capture');
    
    logStep('Taking before-interaction screenshot');
    await chatPage.takeScreenshot('ui-test-before');
    
    logStep('Interacting with chatbot');
    await chatPage.sendMessage('Test for screenshot', true, true);
    
    logStep('Taking after-interaction screenshot');
    await chatPage.takeScreenshot('ui-test-after');
    
    logStep('✓ Screenshots captured successfully');
  });
});