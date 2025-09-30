import { test, expect } from '@playwright/test';
import { UAskChatbotPage } from '../../pages/UAskChatbotPage';
import { allure } from 'allure-playwright';

test.describe('A. Chatbot UI Behavior', () => {
  let chatPage: UAskChatbotPage;
  
  test.beforeEach(async ({ page }) => {
    chatPage = new UAskChatbotPage(page);
    await chatPage.navigate();
    
    // Handle cookie consent and landing page widgets
    await chatPage.handleLandingPageWidgets();
  });
  
  test('UI-001: Chat widget loads correctly on desktop and mobile', async ({ page, browserName }) => {
    await allure.epic('U-Ask Chatbot');
    await allure.feature('UI Behavior');
    await allure.story('Widget Loading');
    
    // Check device type
    const deviceType = await chatPage.getDeviceType();
    await allure.parameter('Device Type', deviceType);
    await allure.parameter('Browser', browserName);
    
    // Verify widget is ready
    const isReady = await chatPage.isWidgetReady();
    expect(isReady).toBeTruthy();
    
    // Verify input field is visible
    await expect(chatPage.chatInput).toBeVisible();
    await expect(chatPage.chatInput).toBeEnabled();
    
    // Take screenshot
    await chatPage.takeScreenshot(`widget-loaded-${deviceType}`);
    
    // Verify page title
    const title = await chatPage.getTitle();
    expect(title).toBeTruthy();
  });
  
  test('UI-002: User can send messages via input box', async () => {
    await allure.story('Message Sending');
    
    const testMessage = 'Hello, I need help with Emirates ID';
    
    // Send message
    const response = await chatPage.sendMessage(testMessage);
    
    // Verify response received
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(0);
    
    // Verify message appears in conversation
    const messages = await chatPage.getAllMessages();
    const userMessages = messages.filter(m => m.role === 'user');
    expect(userMessages.some(m => m.content.includes(testMessage))).toBeTruthy();
  });
  
  test('UI-003: AI responses are rendered properly in conversation area', async () => {
    await allure.story('Response Rendering');
    
    const response = await chatPage.sendMessage('What services does UAE provide?');
    
    // Check response has no broken HTML
    expect(response).not.toContain('<script>');
    expect(response?.toLowerCase()).not.toContain('undefined');
    
    // Verify proper text rendering
    expect(response?.trim()).toBeTruthy();
    expect(response!.length).toBeGreaterThan(10);
  });
  
  test('UI-004: Multilingual support - English (LTR)', async () => {
    await allure.story('Multilingual Support');
    
    // Verify LTR layout
    const isRTL = await chatPage.isRTLLayout();
    expect(isRTL).toBeFalsy();
    
    // Test English input
    const response = await chatPage.sendMessage('Hello, I need help');
    expect(response).toBeTruthy();
  });
  
  test('UI-005: Multilingual support - Arabic (RTL)', async ({ page }) => {
    await allure.story('Multilingual Support');
    
    // Navigate to Arabic version
    chatPage = new UAskChatbotPage(page);
    await chatPage.navigate('ar');
    await chatPage.handleLandingPageWidgets();
    
    // Verify RTL layout
    const isRTL = await chatPage.isRTLLayout();
    expect(isRTL).toBeTruthy();
    
    // Test Arabic input
    const response = await chatPage.sendMessage('مرحبا، أحتاج مساعدة');
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(0);
  });
  
  test('UI-006: Input is cleared after sending', async () => {
    await allure.story('Input Clearing');
    
    const testMessage = 'Test message for input clearing';
    
    // Send message
    await chatPage.sendMessage(testMessage, false);
    await chatPage.wait(500);
    
    // Verify input is cleared (checked in sendMessage method)
    const inputValue = await chatPage.chatInput.inputValue();
    expect(inputValue).toBe('');
  });
  
  test('UI-007: Scroll and accessibility work as expected', async () => {
    await allure.story('Accessibility');
    
    // Run accessibility checks
    const accessibilityResults = await chatPage.checkAccessibility();
    
    // Verify keyboard navigation
    expect(accessibilityResults.keyboardNavigable).toBeTruthy();
    
    // Test Tab navigation
    await chatPage.chatInput.focus();
    await chatPage.page.keyboard.press('Tab');
    
    // Verify send button can receive focus
    const sendButtonFocused = await chatPage.sendButton.evaluate(
      (el) => el === document.activeElement
    );
    expect(sendButtonFocused).toBeTruthy();
  });
  
  test('UI-008: Mobile view - Touch interactions work', async ({ page }) => {
    test.skip(!await chatPage.isMobileView(), 'This test is for mobile devices only');
    
    await allure.story('Mobile Interactions');
    
    // Test tap on input
    await chatPage.chatInput.tap();
    await expect(chatPage.chatInput).toBeFocused();
    
    // Test message sending on mobile
    const response = await chatPage.sendMessage('Mobile test message');
    expect(response).toBeTruthy();
  });
  
  test('UI-009: Response time is acceptable', async () => {
    await allure.story('Performance');
    
    const startTime = Date.now();
    await chatPage.sendMessage('What is Emirates ID?');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    // Response should be under 30 seconds
    expect(responseTime).toBeLessThan(30000);
    
    await allure.attachment('Response Time', `${responseTime} ms`, 'text/plain');
  });
  
  test('UI-010: Multiple messages in conversation', async () => {
    await allure.story('Conversation Flow');
    
    // Send multiple messages
    await chatPage.sendMessage('Hello');
    await chatPage.sendMessage('How do I renew Emirates ID?');
    await chatPage.sendMessage('Thank you');
    
    // Verify all messages appear
    const messages = await chatPage.getAllMessages();
    expect(messages.length).toBeGreaterThanOrEqual(6); // 3 user + 3 bot minimum
  });
});