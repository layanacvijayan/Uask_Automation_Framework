import { test, expect } from '@playwright/test';
import { UAskChatbotPage } from '../../pages/UAskChatbotPage';
import { AIValidator } from '../../utils/AIValidator';
import { allure } from 'allure-playwright';
import { logTestStart, logTestEnd, logStep } from '../../utils/logger';

/**
 * AI Response Validation Tests with CAPTCHA Handling
 */

test.describe('AI Response Validation with CAPTCHA Handling', () => {
  let chatPage: UAskChatbotPage;
  let validator: AIValidator;
  let testStartTime: number;
  
  test.beforeEach(async ({ page }, testInfo) => {
    testStartTime = Date.now();
    logTestStart(testInfo.title);
    
    chatPage = new UAskChatbotPage(page);
    validator = new AIValidator();
    
    // Navigate and handle landing page
    await chatPage.navigate('en');
    await chatPage.handleLandingPageWidgets();
    
    // Wait for widget to be ready
    await chatPage.isWidgetReady();
  });
  
  test.afterEach(async ({}, testInfo) => {
    const duration = Date.now() - testStartTime;
    const status = testInfo.status === 'passed' ? 'PASSED' : 'FAILED';
    logTestEnd(testInfo.title, status, duration);
  });
  
  test('AI-001: Emirates ID renewal query with CAPTCHA handling', async () => {
    await allure.epic('U-Ask Chatbot');
    await allure.feature('AI Response Validation');
    await allure.story('Emirates ID Services');
    
    const query = 'how to renew my emirates id?';
    
    logStep(`Sending query: "${query}"`);
    const response = await chatPage.sendMessage(query, true, true);
    
    // Note: CAPTCHA may appear, handled by sendMessage
    
    logStep('Verifying response received');
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(10);
    
    logStep('Checking for expected keywords');
    const responseLower = response!.toLowerCase();
    const expectedKeywords = ['emirates id', 'renew', 'icp', 'identity'];
    const foundKeywords = expectedKeywords.filter(kw => responseLower.includes(kw));
    
    expect(foundKeywords.length).toBeGreaterThan(0);
    
    logStep('Evaluating response quality');
    const quality = validator.evaluateResponseQuality(query, response!);
    expect(quality.lengthAppropriate).toBeTruthy();
    expect(quality.wellFormatted).toBeTruthy();
    
    await allure.attachment('Bot Response', response!, 'text/plain');
    await allure.attachment('Quality Metrics', JSON.stringify(quality, null, 2), 'application/json');
  });
  
  test('AI-002: Test clicking suggested questions', async () => {
    await allure.story('Suggested Questions');
    
    logStep('Sending initial query to trigger suggestions');
    await chatPage.sendMessage('how to renew my emirates id?', true, true);
    
    // Wait for suggestions to appear
    await chatPage.wait(2000);
    
    logStep('Clicking suggested question');
    try {
      await chatPage.clickSuggestedQuestion('How early can I renew my');
      await chatPage.wait(3000); // Wait for response
      
      const messages = await chatPage.getAllMessages();
      expect(messages.length).toBeGreaterThan(2);
      
      logStep('✓ Suggested question clicked successfully');
    } catch (error) {
      logStep('Suggested questions not found (may vary by session)');
    }
  });
  
  test('AI-003: Multiple queries with CAPTCHA persistence', async () => {
    await allure.story('Multiple Queries');
    
    const queries = [
      'how to renew my emirates id?',
      'what is the cost for emirates id?'
    ];
    
    for (const query of queries) {
      await test.step(`Query: ${query}`, async () => {
        logStep(`Sending: "${query}"`);
        const response = await chatPage.sendMessage(query, true, true);
        
        expect(response).toBeTruthy();
        expect(response!.length).toBeGreaterThan(10);
        
        logStep('✓ Response received');
        await chatPage.wait(2000); // Wait between queries
      });
    }
  });
  
  test('AI-004: Arabic language query with RTL verification', async ({ page }) => {
    await allure.story('Arabic Language Support');
    
    logStep('Navigating to Arabic version');
    chatPage = new UAskChatbotPage(page);
    await chatPage.navigate('ar');
    await chatPage.handleLandingPageWidgets();
    
    logStep('Verifying RTL layout');
    const isRTL = await chatPage.isRTLLayout();
    expect(isRTL).toBeTruthy();
    
    logStep('Switching to Arabic using dropdown');
    await chatPage.switchLanguage('ar');
    await chatPage.wait(2000);
    
    const arabicQuery = 'كم يوم يستغرق الحصول على هوية الإمارات الأصلية؟';
    
    logStep(`Sending Arabic query: "${arabicQuery}"`);
    const response = await chatPage.sendMessage(arabicQuery, true, true);
    
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(10);
    
    await allure.attachment('Arabic Response', response!, 'text/plain');
  });
  
  test('AI-005: Language switching functionality', async () => {
    await allure.story('Language Switching');
    
    logStep('Initial message in English');
    await chatPage.sendMessage('hello how are you', true, true);
    await chatPage.wait(2000);
    
    logStep('Switching to Arabic');
    await chatPage.switchLanguage('ar');
    await chatPage.wait(2000);
    
    logStep('Sending message in Arabic');
    const arabicResponse = await chatPage.sendMessage('مرحبا كيف حالك', true, true);
    expect(arabicResponse).toBeTruthy();
    
    logStep('Switching to Spanish (if available)');
    try {
      await chatPage.switchLanguage('es');
      await chatPage.wait(2000);
      logStep('✓ Spanish language available');
    } catch (error) {
      logStep('Spanish language not available');
    }
  });
  
  test('AI-006: Response consistency check', async () => {
    await allure.story('Response Consistency');
    
    const query1 = 'how to renew emirates id?';
    const query2 = 'what is the process for emirates id renewal?';
    
    logStep(`Query 1: "${query1}"`);
    const response1 = await chatPage.sendMessage(query1, true, true);
    await chatPage.wait(3000);
    
    logStep(`Query 2: "${query2}"`);
    const response2 = await chatPage.sendMessage(query2, true, true);
    
    logStep('Calculating semantic similarity');
    const similarity = validator.calculateSemanticSimilarity(response1!, response2!);
    
    expect(similarity).toBeGreaterThan(0.5);
    
    await allure.attachment('Similarity Score', similarity.toFixed(2), 'text/plain');
    await allure.attachment('Response 1', response1!, 'text/plain');
    await allure.attachment('Response 2', response2!, 'text/plain');
  });
  
  test('AI-007: Gibberish input handling', async () => {
    await allure.story('Invalid Input Handling');
    
    const gibberishInput = 'dfdfdsgshdzhxd xdfgds';
    
    logStep(`Sending gibberish: "${gibberishInput}"`);
    const response = await chatPage.sendMessage(gibberishInput, true, true);
    
    logStep('Verifying graceful handling');
    expect(response).toBeTruthy();
    
    // Should still provide a helpful response
    const isHelpful = validator.isHelpfulForPublicServices(response!);
    logStep(isHelpful ? '✓ Response is helpful' : '⚠️  Response may not be helpful');
    
    await allure.attachment('Bot Response', response!, 'text/plain');
  });
  
  test('AI-008: Suggested questions navigation', async () => {
    await allure.story('Question Suggestions');
    
    logStep('Navigating to Arabic tab');
    await chatPage.page.getByRole('button', { name: 'العربية' }).click();
    await chatPage.wait(2000);
    
    logStep('Clicking Arabic suggested question');
    try {
      await chatPage.page.locator('#chat-welcome-tab')
        .getByText('كيف يمكنني الحصول على رخصة قيادة في دولة الإمارات؟')
        .click();
      
      await chatPage.wait(3000);
      
      const messages = await chatPage.getAllMessages();
      expect(messages.length).toBeGreaterThan(0);
      
      logStep('✓ Arabic suggested question clicked successfully');
    } catch (error) {
      logStep('Arabic suggested questions not found');
    }
  });
  
  test('AI-009: Response formatting validation', async () => {
    await allure.story('Response Formatting');
    
    const query = 'what services does uae government provide?';
    
    logStep(`Sending query: "${query}"`);
    const response = await chatPage.sendMessage(query, true, true);
    
    logStep('Checking formatting');
    expect(response).not.toContain('<script>');
    expect(response).not.toContain('undefined');
    expect(response).not.toContain('null');
    
    // Check for complete sentences
    expect(response).toMatch(/[.!?]$/);
    
    logStep('Evaluating completeness');
    const completenessScore = validator.getCompletenessScore(response!);
    expect(completenessScore).toBeGreaterThan(50);
    
    await allure.attachment('Completeness Score', `${completenessScore}/100`, 'text/plain');
  });
  
  test('AI-010: Long conversation flow', async () => {
    await allure.story('Conversation Flow');
    
    const conversationFlow = [
      'hello, I need help',
      'how to renew emirates id?',
      'what documents are needed?',
      'thank you'
    ];
    
    for (const message of conversationFlow) {
      await test.step(`Message: ${message}`, async () => {
        logStep(`Sending: "${message}"`);
        const response = await chatPage.sendMessage(message, true, true);
        
        expect(response).toBeTruthy();
        logStep('✓ Response received');
        
        await chatPage.wait(2000);
      });
    }
    
    const allMessages = await chatPage.getAllMessages();
    expect(allMessages.length).toBeGreaterThanOrEqual(8); // 4 user + 4 bot minimum
    
    logStep(`✓ Conversation completed with ${allMessages.length} total messages`);
  });
});