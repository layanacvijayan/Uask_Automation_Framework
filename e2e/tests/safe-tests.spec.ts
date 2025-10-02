import { test, expect } from '@playwright/test';
import { UAskChatbotPage } from '../../pages/UAskChatbotPage';
import { AIValidator } from '../../utils/AIValidator';
import { allure } from 'allure-playwright';
import { logTestStart, logTestEnd, logStep } from '../../utils/logger';

/**
 * Safe Test Suite - Normal queries that don't trigger CAPTCHA
 * These tests can run in headless mode and won't be blocked
 */

test.describe('Safe Tests - UI & Basic Functionality', () => {
  let chatPage: UAskChatbotPage;
  let validator: AIValidator;
  let testStartTime: number;
  
  test.beforeEach(async ({ page }, testInfo) => {
    testStartTime = Date.now();
    logTestStart(testInfo.title);
    
    chatPage = new UAskChatbotPage(page);
    validator = new AIValidator();
    
    await chatPage.navigate();
    await chatPage.handleLandingPageWidgets();
    await chatPage.wait(2000); // Extra wait after widgets
  });
  
  test.afterEach(async ({}, testInfo) => {
    const duration = Date.now() - testStartTime;
    const status = testInfo.status === 'passed' ? 'PASSED' : 'FAILED';
    logTestEnd(testInfo.title, status, duration);
  });
  
  test('SAFE-001: Widget loads correctly', async ({ browserName }) => {
    await allure.epic('U-Ask Chatbot');
    await allure.feature('Safe Tests');
    await allure.story('Widget Loading');
    
    logStep('Checking widget readiness');
    const isReady = await chatPage.isWidgetReady();
    expect(isReady).toBeTruthy();
    
    logStep('Verifying input field');
    await expect(chatPage.chatInput).toBeVisible();
    await expect(chatPage.chatInput).toBeEnabled();
    
    const title = await chatPage.getTitle();
    expect(title).toBeTruthy();
  });
  
  test('SAFE-002: Emirates ID renewal query', async () => {
    await allure.story('Public Service Query');
    
    // Set longer timeout for this test
    test.setTimeout(180000);
    
    const query = 'how to renew my emirates id?';
    
    logStep(`Sending query: "${query}"`);
    
    try {
      const response = await chatPage.sendMessage(query, true, true);
      
      logStep('Verifying response');
      expect(response).toBeTruthy();
      expect(response!.length).toBeGreaterThan(10);
      
      // Check for relevant keywords
      const responseLower = response!.toLowerCase();
      const hasRelevantInfo = ['emirates', 'id', 'renew', 'identity'].some(kw => 
        responseLower.includes(kw)
      );
      
      expect(hasRelevantInfo).toBeTruthy();
      
      await allure.attachment('Bot Response', response!, 'text/plain');
      
    } catch (error: any) {
      if (error.message?.includes('CAPTCHA')) {
        logStep('⚠️  CAPTCHA appeared - this is expected on first query');
        test.skip(true, 'CAPTCHA requires manual solving - run with --headed');
      }
      throw error;
    }
  });
  
  test('SAFE-003: Government office hours query', async () => {
    await allure.story('General Information');
    
    test.setTimeout(180000);
    
    const query = 'what are government office working hours?';
    
    logStep(`Sending query: "${query}"`);
    
    try {
      const response = await chatPage.sendMessage(query, true, true);
      
      expect(response).toBeTruthy();
      expect(response!.length).toBeGreaterThan(10);
      
      await allure.attachment('Response', response!, 'text/plain');
      
    } catch (error: any) {
      if (error.message?.includes('CAPTCHA')) {
        test.skip(true, 'CAPTCHA appeared - manual solving needed');
      }
      throw error;
    }
  });
  
  test('SAFE-004: Visa application query', async () => {
    await allure.story('Immigration Services');
    
    test.setTimeout(180000);
    
    const query = 'how can i apply for a uae visa?';
    
    logStep(`Sending query: "${query}"`);
    
    try {
      const response = await chatPage.sendMessage(query, true, true);
      
      expect(response).toBeTruthy();
      
      // Evaluate response quality
      const quality = validator.evaluateResponseQuality(query, response!);
      expect(quality.lengthAppropriate).toBeTruthy();
      
      await allure.attachment('Quality Score', 
        `Relevance: ${quality.relevanceScore.toFixed(2)}`, 
        'text/plain'
      );
      
    } catch (error: any) {
      if (error.message?.includes('CAPTCHA')) {
        test.skip(true, 'CAPTCHA appeared');
      }
      throw error;
    }
  });
  
  test('SAFE-005: Multiple queries in succession', async () => {
    await allure.story('Conversation Flow');
    
    test.setTimeout(300000); // 5 minutes for multiple queries
    
    const queries = [
      'hello',
      'what services do you provide?',
      'thank you'
    ];
    
    for (const query of queries) {
      await test.step(`Query: ${query}`, async () => {
        logStep(`Sending: "${query}"`);
        
        try {
          const response = await chatPage.sendMessage(query, true, true);
          expect(response).toBeTruthy();
          logStep('✓ Response received');
          
          await chatPage.wait(3000); // Wait between queries
          
        } catch (error: any) {
          if (error.message?.includes('CAPTCHA')) {
            test.skip(true, 'CAPTCHA appeared during conversation');
          }
          throw error;
        }
      });
    }
  });
  
  test('SAFE-006: Arabic language support', async ({ page }) => {
    await allure.story('Multilingual');
    
    test.setTimeout(180000);
    
    logStep('Switching to Arabic');
    chatPage = new UAskChatbotPage(page);
    await chatPage.navigate('ar');
    await chatPage.handleLandingPageWidgets();
    await chatPage.wait(2000);
    
    logStep('Verifying RTL layout');
    const isRTL = await chatPage.isRTLLayout();
    expect(isRTL).toBeTruthy();
    
    const arabicQuery = 'مرحبا';
    
    logStep(`Sending Arabic query: "${arabicQuery}"`);
    
    try {
      const response = await chatPage.sendMessage(arabicQuery, true, true);
      expect(response).toBeTruthy();
      
      await allure.attachment('Arabic Response', response!, 'text/plain');
      
    } catch (error: any) {
      if (error.message?.includes('CAPTCHA')) {
        test.skip(true, 'CAPTCHA appeared');
      }
      throw error;
    }
  });
  
  test('SAFE-007: Response formatting validation', async () => {
    await allure.story('Response Quality');
    
    test.setTimeout(180000);
    
    const query = 'tell me about uae services';
    
    logStep(`Sending query: "${query}"`);
    
    try {
      const response = await chatPage.sendMessage(query, true, true);
      
      logStep('Checking response format');
      expect(response).not.toContain('<script>');
      expect(response).not.toContain('undefined');
      expect(response).not.toContain('null');
      
      // Should have proper punctuation
      expect(response).toMatch(/[.!?]$/);
      
      logStep('✓ Response format is clean');
      
    } catch (error: any) {
      if (error.message?.includes('CAPTCHA')) {
        test.skip(true, 'CAPTCHA appeared');
      }
      throw error;
    }
  });
});