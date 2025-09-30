import OpenAI from 'openai';
import { logger } from '../../utils/logger';

/**
 * AI Response Validator using OpenAI GPT-4
 * Validates chatbot responses for hallucinations, consistency, and quality
 */
export class AIValidator {
  private openai: OpenAI | null = null;
  private model: string;
  
  constructor(apiKey?: string, model = 'gpt-4') {
    this.model = model;
    
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (key) {
      this.openai = new OpenAI({ apiKey: key });
      logger.info('OpenAI client initialized');
    } else {
      logger.warn('OpenAI API key not configured. AI validation features will be limited.');
    }
  }
  
  /**
   * Check if response contains hallucinated information
   */
  async checkHallucination(
    query: string,
    response: string
  ): Promise<{
    isHallucinated: boolean;
    confidence: number;
    reason: string;
  }> {
    if (!this.openai) {
      return {
        isHallucinated: false,
        confidence: 0,
        reason: 'OpenAI API not configured'
      };
    }
    
    const prompt = `You are an expert fact-checker for UAE government chatbot responses.

Analyze this chatbot conversation:

User Query: ${query}
Chatbot Response: ${response}

Determine if the chatbot's response contains:
1. Fabricated or made-up information
2. Hallucinated facts or statistics
3. Incorrect information about UAE government services
4. Information not related to the query

Provide your analysis in JSON format:
{
  "isHallucinated": true/false,
  "confidence": 0.0-1.0,
  "reason": "Brief explanation"
}`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a fact-checking expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      
      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      logger.info('Hallucination check:', result);
      return {
        isHallucinated: result.isHallucinated || false,
        confidence: result.confidence || 0,
        reason: result.reason || ''
      };
    } catch (error) {
      logger.error('Error in hallucination check:', error);
      return {
        isHallucinated: false,
        confidence: 0,
        reason: `Error: ${error}`
      };
    }
  }
  
  /**
   * Calculate semantic similarity between two texts
   */
  calculateSemanticSimilarity(text1: string, text2: string): number {
    // Normalize texts
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    // Calculate Jaccard similarity
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    const jaccardSimilarity = union.size === 0 ? 0 : intersection.size / union.size;
    
    // Calculate Levenshtein-based similarity
    const levenshteinDistance = this.levenshteinDistance(text1, text2);
    const maxLen = Math.max(text1.length, text2.length);
    const levenshteinSimilarity = maxLen === 0 ? 1 : 1 - (levenshteinDistance / maxLen);
    
    // Average of both
    const similarity = (jaccardSimilarity + levenshteinSimilarity) / 2;
    
    logger.info(`Semantic similarity: ${similarity.toFixed(2)} (Jaccard: ${jaccardSimilarity.toFixed(2)}, Levenshtein: ${levenshteinSimilarity.toFixed(2)})`);
    
    return similarity;
  }
  
  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Translate text using OpenAI
   */
  async translateText(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> {
    if (!this.openai) {
      logger.warn('OpenAI not configured. Returning original text.');
      return text;
    }
    
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}:\n\n${text}`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      });
      
      const translation = completion.choices[0].message.content || text;
      logger.info(`Translated text from ${sourceLang} to ${targetLang}`);
      return translation;
    } catch (error) {
      logger.error('Translation error:', error);
      return text;
    }
  }
  
  /**
   * Evaluate response quality
   */
  evaluateResponseQuality(
    query: string,
    response: string
  ): {
    lengthAppropriate: boolean;
    containsKeywords: boolean;
    wellFormatted: boolean;
    relevanceScore: number;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check length
    const wordCount = response.split(/\s+/).length;
    const lengthAppropriate = wordCount >= 10 && wordCount <= 500;
    if (!lengthAppropriate) {
      issues.push(`Unusual length: ${wordCount} words`);
    }
    
    // Check for keywords
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const commonWords = [...queryWords].filter(word => responseWords.has(word));
    const containsKeywords = commonWords.length > 0;
    if (!containsKeywords) {
      issues.push('No query keywords in response');
    }
    
    // Check formatting
    const formattingIssues: string[] = [];
    if (response.includes('</div>') || response.includes('<script>')) {
      formattingIssues.push('Contains HTML tags');
    }
    if (response.includes('```')) {
      formattingIssues.push('Contains code blocks');
    }
    if (response.endsWith('...') || response.endsWith(',')) {
      formattingIssues.push('Incomplete sentence');
    }
    
    const wellFormatted = formattingIssues.length === 0;
    issues.push(...formattingIssues);
    
    // Calculate relevance
    const relevanceScore = this.calculateSemanticSimilarity(query, response);
    
    const metrics = {
      lengthAppropriate,
      containsKeywords,
      wellFormatted,
      relevanceScore,
      issues
    };
    
    logger.info('Quality evaluation:', metrics);
    return metrics;
  }
  
  /**
   * Check if response is helpful for public services
   */
  isHelpfulForPublicServices(response: string): boolean {
    const helpfulIndicators = [
      'help', 'assist', 'service', 'government', 'uae',
      'visit', 'apply', 'contact', 'information', 'register'
    ];
    
    const responseLower = response.toLowerCase();
    return helpfulIndicators.some(indicator => responseLower.includes(indicator));
  }
}