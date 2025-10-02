import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Page Object Model for U-Ask Chatbot
 */
export class UAskChatbotPage {
  readonly page: Page;
  readonly baseURL: string;
  
 
  private readonly chatInputSelector = '.expando-textarea';
  private readonly sendButtonSelector = 'button[name="Send"], button:has-text("Send"), button:has-text("إرسال")';
  private readonly userMessageSelector = '.user-message, [data-role="user"]';
  private readonly botMessageSelector = '.bot-message, .assistant-message, [data-role="assistant"]';
  private readonly loadingIndicatorSelector = '.loading, .typing-indicator, .dots';
  private readonly captchaFrameSelector = 'iframe[name^="a-"]';
  
  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'https://ask.u.ae';
  }
  
  async navigate(language: 'en' | 'ar' = 'en'): Promise<void> {
    const url = `${this.baseURL}/${language}/`;
    logger.info(`Navigating to: ${url}`);
    
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);
      
      logger.info('Successfully navigated to U-Ask chatbot');
    } catch (error) {
      logger.error(`Navigation failed: ${error}`);
      throw error;
    }
  }
  
  async handleLandingPageWidgets(): Promise<void> {
    logger.info('Handling landing page widgets...');
    
    try {
      const acceptButton = this.page.getByRole('button', { name: 'Accept and continue' });
      if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await acceptButton.click();
        logger.info('Clicked "Accept and continue" button');
        await this.page.waitForTimeout(2000);
      }
      
      await this.handleElement(
        this.page.getByRole('button', { name: /accept/i }),
        'Cookie consent accepted'
      );
      
      logger.info('Landing page widgets handled successfully');
    } catch (error) {
      logger.warn('Error handling landing page widgets:', error);
    }
  }
  
  private async handleElement(locator: Locator, successMessage: string): Promise<void> {
    try {
      if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
        await locator.click({ timeout: 5000 });
        logger.info(successMessage);
        await this.page.waitForTimeout(1000);
      }
    } catch (error) {
      // Element not found
    }
  }
  
  get chatInput(): Locator {
    return this.page.locator(this.chatInputSelector).first();
  }
  
  get sendButton(): Locator {
    return this.page.getByRole('button', { name: /send|إرسال/i }).first();
  }
  
  get botMessages(): Locator {
    return this.page.locator(this.botMessageSelector);
  }
  
  get loadingIndicator(): Locator {
    return this.page.locator(this.loadingIndicatorSelector).first();
  }
  
  async isCaptchaPresent(): Promise<boolean> {
    try {
      const frames = this.page.frames();
      for (const frame of frames) {
        const url = frame.url();
        if (url.includes('recaptcha') || url.includes('captcha')) {
          try {
            const checkbox = frame.locator('[role="checkbox"]');
            const isVisible = await checkbox.isVisible({ timeout: 1000 }).catch(() => false);
            if (isVisible) {
              return true;
            }
          } catch {
            continue;
          }
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  
  async handleCaptcha(mode: 'manual' | 'wait' | 'skip' = 'manual'): Promise<boolean> {
    try {
      const captchaPresent = await this.isCaptchaPresent();
      
      if (!captchaPresent) {
        return true;
      }
      
      logger.warn('CAPTCHA detected!');
      
      switch (mode) {
        case 'manual':
          return await this.handleCaptchaManual();
        case 'wait':
          return await this.waitForCaptchaSolved(120000); // 2 minutes
        case 'skip':
          logger.warn('Skipping CAPTCHA');
          return false;
        default:
          return await this.handleCaptchaManual();
      }
    } catch (error) {
      logger.error('Error handling CAPTCHA:', error);
      return false;
    }
  }
 
  private async handleCaptchaManual(): Promise<boolean> {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         ⚠️  CAPTCHA MANUAL SOLVING REQUIRED            ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║  1. Look at the browser window                         ║');
    console.log('║  2. Solve the CAPTCHA challenge                        ║');
    console.log('║  3. Test will continue automatically                   ║');
    console.log('║                                                        ║');
    console.log('║  ⏱️  Timeout: 120 seconds (2 minutes)                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    await this.takeScreenshot('captcha-needs-solving');
    
    try {
      const solved = await this.waitForCaptchaSolved(120000); // 2 minutes
      
      if (solved) {
        console.log('\n✅ CAPTCHA SOLVED! Continuing test...\n');
        logger.info('✅ CAPTCHA solved successfully');
        await this.page.waitForTimeout(3000); // Wait for page to process
        return true;
      } else {
        console.log('\n❌ CAPTCHA TIMEOUT! Please solve faster next time.\n');
        logger.error('❌ CAPTCHA solving timeout');
        return false;
      }
    } catch (error) {
      logger.error('Failed to handle CAPTCHA:', error);
      return false;
    }
  }
  
 
  private async waitForCaptchaSolved(timeout: number = 120000): Promise<boolean> {
    const startTime = Date.now();
    let checksCount = 0;
    
    while (Date.now() - startTime < timeout) {
      const stillPresent = await this.isCaptchaPresent();
      
      if (!stillPresent) {
        logger.info('✓ CAPTCHA solved');
        return true;
      }
      
      checksCount++;
      if (checksCount % 5 === 0) { // Log every 10 seconds
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.floor((timeout - (Date.now() - startTime)) / 1000);
        console.log(`   ... waiting for CAPTCHA (${elapsed}s elapsed, ${remaining}s remaining)`);
      }
      
      await this.page.waitForTimeout(2000); // Check every 2 seconds
    }
    
    return false;
  }
  
  async isWidgetReady(): Promise<boolean> {
    try {
      await this.page.waitForLoadState('networkidle');
      await expect(this.chatInput).toBeVisible({ timeout: 10000 });
      logger.info('Chat widget is ready');
      return true;
    } catch (error) {
      logger.error('Chat widget not ready:', error);
      return false;
    }
  }
  
  async sendMessage(
    message: string, 
    waitForResponse = true,
    handleCaptcha = true
  ): Promise<string | null> {
    logger.info(`Sending message: ${message.substring(0, 50)}...`);
    
    try {
      await this.page.waitForLoadState('networkidle');
      
      // Wait for and handle intercepting element
      await this.page.waitForTimeout(1000);
      
      // Use force click to bypass interception
      await this.chatInput.click({ force: true, timeout: 10000 });
      
      // For contenteditable, use innerHTML or textContent
      await this.chatInput.evaluate((el, text) => {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, message);
      
      await this.page.waitForTimeout(500);
      
      await this.takeScreenshot('before-send');
      
      const messagesBefore = await this.botMessages.count();
      
      // Click send with force
      await this.sendButton.click({ force: true });
      logger.info('Message sent');
      
      // Handle CAPTCHA with proper mode
      if (handleCaptcha) {
        await this.page.waitForTimeout(2000);
        
        const captchaPresent = await this.isCaptchaPresent();
        if (captchaPresent) {
          logger.warn('⚠️  CAPTCHA appeared');
          
          // Use manual mode by default (not 'wait')
          const solved = await this.handleCaptcha('manual');
          
          if (!solved) {
            throw new Error('CAPTCHA not solved. Please run tests with --headed flag and solve manually.');
          }
        }
      }
      
      if (waitForResponse) {
        return await this.waitForResponse(messagesBefore);
      }
      
      return null;
    } catch (error) {
      logger.error('Error sending message:', error);
      await this.takeScreenshot('send-message-error');
      throw error;
    }
  }
  
  private async waitForResponse(previousCount: number, timeout = 60000): Promise<string> {
    logger.info('Waiting for bot response...');
    
    try {
      try {
        await this.loadingIndicator.waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        // No loading indicator
      }
      
      await this.page.waitForFunction(
        ([selector, count]) => {
          return document.querySelectorAll(selector as string).length > (count as number);
        },
        [this.botMessageSelector, previousCount],
        { timeout }
      );
      
      try {
        await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 });
      } catch {
        // Already hidden
      }
      
      await this.page.waitForTimeout(2000);
      
      const botMessageElements = await this.botMessages.all();
      if (botMessageElements.length === 0) {
        throw new Error('No bot messages found');
      }
      
      const latestMessage = botMessageElements[botMessageElements.length - 1];
      const responseText = (await latestMessage.textContent()) || '';
      
      logger.info(`Received response (${responseText.length} chars)`);
      await this.takeScreenshot('response-received');
      
      return responseText;
    } catch (error) {
      logger.error('Error waiting for response:', error);
      await this.takeScreenshot('response-timeout');
      throw new Error(`Bot did not respond within ${timeout}ms`);
    }
  }
  
  async switchLanguage(targetLang: 'en' | 'ar' | 'es'): Promise<void> {
    logger.info(`Switching language to: ${targetLang}`);
    
    try {
      const languageMap: Record<string, string> = {
        'en': 'en-US',
        'ar': 'ar-AE',
        'es': 'es-AR'
      };
      
      const languageCode = languageMap[targetLang] || targetLang;
      
      const dropdown = this.page.getByRole('combobox');
      await dropdown.waitFor({ state: 'visible', timeout: 5000 });
      await dropdown.selectOption(languageCode);
      
      logger.info(`Language switched to: ${languageCode}`);
      await this.page.waitForTimeout(2000);
    } catch (error) {
      logger.error('Error switching language:', error);
      throw error;
    }
  }
  
  async clickSuggestedQuestion(questionText: string): Promise<void> {
    logger.info(`Clicking suggested question: ${questionText.substring(0, 50)}...`);
    
    try {
      const question = this.page.getByText(questionText).first();
      await question.waitFor({ state: 'visible', timeout: 5000 });
      await question.click();
      logger.info('Suggested question clicked');
      await this.page.waitForTimeout(1000);
    } catch (error) {
      logger.error('Error clicking suggested question:', error);
      throw error;
    }
  }
  
  async isRTLLayout(): Promise<boolean> {
    try {
      const direction = await this.page.evaluate(() => {
        return window.getComputedStyle(document.body).direction;
      });
      
      logger.info(`Page direction: ${direction}`);
      return direction === 'rtl';
    } catch (error) {
      logger.error('Error checking RTL layout:', error);
      return false;
    }
  }
  
  async getAllMessages(): Promise<Array<{ role: string; content: string }>> {
    const messages: Array<{ role: string; content: string }> = [];
    
    try {
      const userElements = await this.page.locator(this.userMessageSelector).all();
      for (const element of userElements) {
        const content = (await element.textContent()) || '';
        messages.push({ role: 'user', content });
      }
      
      const botElements = await this.botMessages.all();
      for (const element of botElements) {
        const content = (await element.textContent()) || '';
        messages.push({ role: 'assistant', content });
      }
      
      logger.info(`Retrieved ${messages.length} messages`);
      return messages;
    } catch (error) {
      logger.error('Error getting messages:', error);
      return [];
    }
  }
  
  async clearConversation(): Promise<void> {
    try {
      const resetSelectors = [
        'button:has-text("Clear")',
        'button:has-text("New Chat")'
      ];
      
      for (const selector of resetSelectors) {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
          await button.click();
          logger.info('Conversation cleared');
          await this.page.waitForTimeout(1000);
          return;
        }
      }
      
      logger.info('Reloading page');
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);
      await this.handleLandingPageWidgets();
    } catch (error) {
      logger.warn('Failed to clear conversation:', error);
    }
  }
  
  async takeScreenshot(prefix: string): Promise<void> {
    try {
      const timestamp = Date.now();
      const deviceType = await this.getDeviceType();
      const filename = `screenshots/${prefix}-${deviceType}-${timestamp}.png`;
      
      await this.page.screenshot({ path: filename, fullPage: false });
      logger.debug(`Screenshot: ${filename}`);
    } catch (error) {
      // Ignore screenshot errors
    }
  }
  
  async getDeviceType(): Promise<'mobile' | 'tablet' | 'desktop'> {
    const viewport = this.page.viewportSize();
    if (!viewport) return 'desktop';
    
    if (viewport.width < 768) return 'mobile';
    if (viewport.width < 1024) return 'tablet';
    return 'desktop';
  }
  
  async isMobileView(): Promise<boolean> {
    return (await this.getDeviceType()) === 'mobile';
  }
  
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
  
  getCurrentURL(): string {
    return this.page.url();
  }
  
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }
  
  async checkAccessibility(): Promise<{
    hasAriaLabels: boolean;
    keyboardNavigable: boolean;
  }> {
    const results = {
      hasAriaLabels: false,
      keyboardNavigable: false
    };
    
    try {
      const ariaLabel = await this.chatInput.getAttribute('aria-label');
      results.hasAriaLabels = !!ariaLabel;
      
      await this.chatInput.focus();
      const isFocused = await this.chatInput.evaluate((el) => el === document.activeElement);
      results.keyboardNavigable = isFocused;
      
      logger.info('Accessibility check:', results);
    } catch (error) {
      logger.error('Error checking accessibility:', error);
    }
    
    return results;
  }
  
  async testMaliciousInput(payload: string): Promise<{
    executed: boolean;
    sanitized: boolean;
    response: string;
  }> {
    let xssDetected = false;
    
    const dialogHandler = async (dialog: any) => {
      xssDetected = true;
      await dialog.dismiss();
    };
    
    this.page.on('dialog', dialogHandler);
    
    try {
      const response = await this.sendMessage(payload, true, true);
      
      const pageContent = await this.page.content();
      const sanitized = !pageContent.includes(payload);
      
      return {
        executed: xssDetected,
        sanitized,
        response: response || ''
      };
    } finally {
      this.page.off('dialog', dialogHandler);
    }
  }
}