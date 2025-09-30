import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger';
/**
 * Page Object Model for U-Ask Chatbot
 * Handles all interactions with the chatbot interface
 */
export class UAskChatbotPage {
  readonly page: Page;
  readonly baseURL: string;
  
  // Locators - Update these after inspecting actual website
  private readonly chatInputSelector = 'textarea[placeholder*="Ask"], input[type="text"]';
  private readonly sendButtonSelector = 'button[type="submit"], button:has-text("Send")';
  private readonly messageContainerSelector = '.message-container, .chat-messages';
  private readonly userMessageSelector = '.user-message, [data-role="user"]';
  private readonly botMessageSelector = '.bot-message, .assistant-message, [data-role="assistant"]';
  private readonly loadingIndicatorSelector = '.loading, .typing-indicator, .dots';
  private readonly errorMessageSelector = '.error-message, .alert-error';
  
  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'https://ask.u.ae';
  }
  
  /**
   * Navigate to U-Ask chatbot
   */
  async navigate(language: 'en' | 'ar' = 'en'): Promise<void> {
    const url = `${this.baseURL}/${language}/`;
    logger.info(`Navigating to: ${url}`);
    
    await this.page.goto(url, { waitUntil: 'networkidle' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // Allow animations
    
    logger.info('Successfully navigated to U-Ask chatbot');
  }
  
  /**
   * Handle landing page widgets (cookie consent, modals, etc.)
   */
  async handleLandingPageWidgets(): Promise<void> {
    logger.info('Handling landing page widgets...');
    
    try {
      // Handle cookie consent banner
      const acceptButton = this.page.getByRole('button', { name: /accept/i });
      const acceptCount = await acceptButton.count();
      
      if (acceptCount > 0) {
        await acceptButton.first().click();
        logger.info('Cookie consent accepted');
        await this.page.waitForTimeout(1000);
      }
      
      // Handle "Accept and continue" button
      const acceptContinueButton = this.page.getByRole('button', { name: 'Accept and continue' });
      const continueCount = await acceptContinueButton.count();
      
      if (continueCount > 0) {
        await acceptContinueButton.click();
        logger.info('Accept and continue clicked');
        await this.page.waitForTimeout(1000);
      }
      
      // Handle any modal overlays
      const closeButtons = this.page.locator('button[aria-label="Close"], .modal-close, .close-btn');
      const closeCount = await closeButtons.count();
      
      if (closeCount > 0) {
        await closeButtons.first().click();
        logger.info('Modal closed');
        await this.page.waitForTimeout(500);
      }
      
      // Handle terms and conditions if present
      const agreeButton = this.page.getByRole('button', { name: /agree|i agree|موافق/i });
      const agreeCount = await agreeButton.count();
      
      if (agreeCount > 0) {
        await agreeButton.first().click();
        logger.info('Terms agreed');
        await this.page.waitForTimeout(1000);
      }
      
      logger.info('Landing page widgets handled successfully');
    } catch (error) {
      logger.warn('No landing page widgets to handle or error occurred:', error);
    }
  }
  
  /**
   * Get chat input locator
   */
  get chatInput(): Locator {
    return this.page.locator(this.chatInputSelector).first();
  }
  
  /**
   * Get send button locator
   */
  get sendButton(): Locator {
    return this.page.locator(this.sendButtonSelector).first();
  }
  
  /**
   * Get all bot messages
   */
  get botMessages(): Locator {
    return this.page.locator(this.botMessageSelector);
  }
  
  /**
   * Get loading indicator
   */
  get loadingIndicator(): Locator {
    return this.page.locator(this.loadingIndicatorSelector).first();
  }
  
  /**
   * Check if chat widget is ready
   */
  async isWidgetReady(): Promise<boolean> {
    try {
      await expect(this.chatInput).toBeVisible({ timeout: 10000 });
      await expect(this.chatInput).toBeEnabled();
      return true;
    } catch (error) {
      logger.error('Chat widget not ready:', error);
      return false;
    }
  }
  
  /**
   * Send a message to the chatbot
   */
  async sendMessage(message: string, waitForResponse = true): Promise<string | null> {
    logger.info(`Sending message: ${message}`);
    
    // Focus and clear input
    await this.chatInput.click();
    await this.chatInput.fill('');
    
    // Type message
    await this.chatInput.fill(message);
    
    // Take screenshot before sending
    await this.takeScreenshot('before-send');
    
    // Get current message count
    const messagesBefore = await this.botMessages.count();
    
    // Send message
    await this.sendButton.click();
    
    // Verify input is cleared
    await this.page.waitForTimeout(500);
    const inputValue = await this.chatInput.inputValue();
    expect(inputValue).toBe('');
    
    if (waitForResponse) {
      return await this.waitForResponse(messagesBefore);
    }
    
    return null;
  }
  
  /**
   * Wait for bot response
   */
  /*private async waitForResponse(previousCount: number, timeout = 30000): Promise<string> {
    logger.info('Waiting for bot response...');
    
    // Wait for loading indicator (optional)
    try {
      await this.loadingIndicator.waitFor({ state: 'visible', timeout: 5000 });
      logger.debug('Loading indicator appeared');
    } catch (error) {
      logger.debug('Loading indicator not detected or appeared too fast');
    }
    
    // Wait for new bot message
    try {
      await this.page.waitForFunction(
        (selector, count) => {
          return document.querySelectorAll(selector).length > count;
        },
        [this.botMessageSelector, previousCount],
        { timeout }
      );
    } catch (error) {
      logger.error(`Bot did not respond within ${timeout}ms`);
      throw new Error('Bot response timeout');
    }
    
    // Wait for loading to disappear
    try {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Loading may have finished already
    }
    
    // Allow streaming to complete
    await this.page.waitForTimeout(1000);
    
    // Get latest bot message
    const botMessageElements = await this.botMessages.all();
    if (botMessageElements.length === 0) {
      throw new Error('No bot messages found');
    }
    
    const latestMessage = botMessageElements[botMessageElements.length - 1];
    const responseText = await latestMessage.textContent() || '';
    
    logger.info(`Received response: ${responseText.substring(0, 100)}...`);
    
    // Take screenshot of response
    await this.takeScreenshot('response');
    
    return responseText;
  } */
 private async waitForResponse(previousCount: number, timeout = 30000): Promise<string> {
  logger.info('Waiting for bot response...');

  // Wait for new bot message count to increase
  await expect(this.botMessages).toHaveCount(previousCount + 1, { timeout });

  // Allow streaming to complete
  await this.page.waitForTimeout(1000);

  // Get latest bot message
  const botMessageElements = await this.botMessages.all();
  if (botMessageElements.length === 0) {
    throw new Error('No bot messages found');
  }

  const latestMessage = botMessageElements[botMessageElements.length - 1];
  const responseText = await latestMessage.textContent() || '';

  logger.info(`Received response: ${responseText.substring(0, 100)}...`);

  await this.takeScreenshot('response');
  return responseText;
}

  
  /**
   * Get all conversation messages
   */
  async getAllMessages(): Promise<Array<{ role: string; content: string }>> {
    const messages: Array<{ role: string; content: string }> = [];
    
    // Get user messages
    const userElements = await this.page.locator(this.userMessageSelector).all();
    for (const element of userElements) {
      messages.push({
        role: 'user',
        content: (await element.textContent()) || ''
      });
    }
    
    // Get bot messages
    const botElements = await this.botMessages.all();
    for (const element of botElements) {
      messages.push({
        role: 'assistant',
        content: (await element.textContent()) || ''
      });
    }
    
    logger.info(`Retrieved ${messages.length} messages from conversation`);
    return messages;
  }
  
  /**
   * Switch language
   */
  async switchLanguage(targetLang: 'en' | 'ar'): Promise<void> {
    await this.navigate(targetLang);
  }
  
  /**
   * Verify RTL layout for Arabic
   */
  async isRTLLayout(): Promise<boolean> {
    const direction = await this.page.evaluate(() => {
      return window.getComputedStyle(document.body).direction;
    });
    
    logger.info(`Page direction: ${direction}`);
    return direction === 'rtl';
  }
  
  /**
   * Check accessibility features
   */
  async checkAccessibility(): Promise<{
    hasAriaLabels: boolean;
    keyboardNavigable: boolean;
  }> {
    const results = {
      hasAriaLabels: false,
      keyboardNavigable: false
    };
    
    // Check ARIA labels
    const ariaLabel = await this.chatInput.getAttribute('aria-label');
    results.hasAriaLabels = !!ariaLabel;
    
    // Test keyboard navigation
    await this.chatInput.focus();
    const isFocused = await this.chatInput.evaluate((el) => el === document.activeElement);
    results.keyboardNavigable = isFocused;
    
    logger.info('Accessibility check results:', results);
    return results;
  }
  
  /**
   * Test malicious input injection
   */
  async testMaliciousInput(payload: string): Promise<{
    executed: boolean;
    sanitized: boolean;
    response: string;
  }> {
    let xssDetected = false;
    
    // Setup dialog handler for XSS detection
    this.page.on('dialog', async (dialog) => {
      xssDetected = true;
      await dialog.dismiss();
    });
    
    // Send malicious payload
    const response = await this.sendMessage(payload);
    
    // Check if payload appears unsanitized in DOM
    const pageContent = await this.page.content();
    const sanitized = !pageContent.includes(payload);
    
    logger.info(`Injection test - Executed: ${xssDetected}, Sanitized: ${sanitized}`);
    
    return {
      executed: xssDetected,
      sanitized,
      response: response || ''
    };
  }
  
  /**
   * Clear conversation
   */
  async clearConversation(): Promise<void> {
    try {
      const resetButton = this.page.locator('button:has-text("Clear"), button:has-text("New Chat")');
      const count = await resetButton.count();
      
      if (count > 0) {
        await resetButton.first().click();
        await this.page.waitForTimeout(1000);
        logger.info('Conversation cleared');
      } else {
        // Fallback: reload page
        await this.page.reload();
        await this.page.waitForTimeout(2000);
        logger.info('Page reloaded to clear conversation');
      }
    } catch (error) {
      logger.warn('Failed to clear conversation:', error);
      await this.page.reload();
    }
  }
  
  /**
   * Get device type
   */
  async getDeviceType(): Promise<'mobile' | 'tablet' | 'desktop'> {
    const viewport = this.page.viewportSize();
    if (!viewport) return 'desktop';
    
    if (viewport.width < 768) return 'mobile';
    if (viewport.width < 1024) return 'tablet';
    return 'desktop';
  }
  
  /**
   * Check if mobile view
   */
  async isMobileView(): Promise<boolean> {
    const deviceType = await this.getDeviceType();
    return deviceType === 'mobile';
  }
  
  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(prefix: string): Promise<void> {
    try {
      const timestamp = Date.now();
      const filename = `screenshots/${prefix}-${timestamp}.png`;
      await this.page.screenshot({ path: filename, fullPage: false });
      logger.debug(`Screenshot saved: ${filename}`);
    } catch (error) {
      logger.warn('Failed to take screenshot:', error);
    }
  }
  
  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
  
  /**
   * Get current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }
  
  /**
   * Wait for specific duration
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }
}