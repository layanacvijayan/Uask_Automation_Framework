import OpenAI from 'openai';
import { logger } from './logger';

/**
 * AI Response Validator using OpenAI GPT-4
 * Validates chatbot responses for hallucinations, consistency, and quality
 */
export class AIValidator {
  private openai: OpenAI | null = null;
  private model: string;
  private maxRetries: number = 3;
  
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
   * with retry logic for API failures
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
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.debug(`Hallucination check attempt ${attempt}/${this.maxRetries}`);
        
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a fact-checking expert.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        });
        
        const result = JSON.parse(completion.choices[0].message.content || '{}');
        
        logger.info(`Hallucination check: ${result.isHallucinated ? 'DETECTED' : 'CLEAR'} (confidence: ${result.confidence})`);
        
        return {
          isHallucinated: result.isHallucinated || false,
          confidence: result.confidence || 0,
          reason: result.reason || ''
        };
      } catch (error: any) {
        logger.error(`Hallucination check attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetries) {
          return {
            isHallucinated: false,
            confidence: 0,
            reason: `Error after ${this.maxRetries} attempts: ${error.message}`
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return {
      isHallucinated: false,
      confidence: 0,
      reason: 'Max retries reached'
    };
  }
  
  /**
   * Calculate semantic similarity between two texts
   * Using multiple algorithms for better accuracy
   */
  calculateSemanticSimilarity(text1: string, text2: string): number {
    // Normalize texts
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    // 1. Jaccard similarity
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    const jaccardSimilarity = union.size === 0 ? 0 : intersection.size / union.size;
    
    // 2. Cosine similarity (word frequency based)
    const cosineSimilarity = this.calculateCosineSimilarity(words1, words2);
    
    // 3. Levenshtein-based similarity
    const levenshteinDistance = this.levenshteinDistance(text1, text2);
    const maxLen = Math.max(text1.length, text2.length);
    const levenshteinSimilarity = maxLen === 0 ? 1 : 1 - (levenshteinDistance / maxLen);
    
    // Weighted average
    const similarity = (
      jaccardSimilarity * 0.4 +
      cosineSimilarity * 0.4 +
      levenshteinSimilarity * 0.2
    );
    
    logger.info(
      `Semantic similarity: ${similarity.toFixed(2)} ` +
      `(Jaccard: ${jaccardSimilarity.toFixed(2)}, ` +
      `Cosine: ${cosineSimilarity.toFixed(2)}, ` +
      `Levenshtein: ${levenshteinSimilarity.toFixed(2)})`
    );
    
    return similarity;
  }
  
  /**
   * Calculate cosine similarity based on word frequency
   */
  private calculateCosineSimilarity(words1: string[], words2: string[]): number {
    // Build vocabulary
    const vocabulary = new Set([...words1, ...words2]);
    
    // Create frequency vectors
    const vector1: number[] = [];
    const vector2: number[] = [];
    
    for (const word of vocabulary) {
      vector1.push(words1.filter(w => w === word).length);
      vector2.push(words2.filter(w => w === word).length);
    }
    
    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
    }
    
    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
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
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
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
    
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Return only the translation, no explanations:\n\n${text}`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      });
      
      const translation = completion.choices[0].message.content || text;
      logger.info(`Translated text from ${sourceLang} to ${targetLang}`);
      return translation.trim();
    } catch (error: any) {
      logger.error('Translation error:', error.message);
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
    const wordCount = response.split(/\s+/).filter(w => w.length > 0).length;
    const lengthAppropriate = wordCount >= 10 && wordCount <= 500;
    if (!lengthAppropriate) {
      issues.push(`Unusual length: ${wordCount} words (expected 10-500)`);
    }
    
    // Check for keywords
    const queryWords = new Set(
      query.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3) // Only words longer than 3 chars
    );
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const commonWords = [...queryWords].filter(word => responseWords.has(word));
    const containsKeywords = commonWords.length > 0;
    
    if (!containsKeywords) {
      issues.push('No significant query keywords found in response');
    }
    
    // Check formatting
    const formattingIssues: string[] = [];
    
    if (response.includes('</div>') || response.includes('<script>')) {
      formattingIssues.push('Contains unescaped HTML tags');
    }
    if (response.includes('```')) {
      formattingIssues.push('Contains code block markers');
    }
    if (response.trim().endsWith('...')) {
      formattingIssues.push('Ends with ellipsis (incomplete)');
    }
    if (response.trim().endsWith(',')) {
      formattingIssues.push('Ends with comma (incomplete)');
    }
    if (response.includes('undefined') || response.includes('null')) {
      formattingIssues.push('Contains undefined/null values');
    }
    
    const wellFormatted = formattingIssues.length === 0;
    issues.push(...formattingIssues);
    
    // Calculate relevance
    const relevanceScore = this.calculateSemanticSimilarity(query, response);
    
    if (relevanceScore < 0.3) {
      issues.push(`Low relevance score: ${relevanceScore.toFixed(2)}`);
    }
    
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
      'visit', 'apply', 'contact', 'information', 'register',
      'document', 'office', 'ministry', 'department', 'portal'
    ];
    
    const responseLower = response.toLowerCase();
    const foundIndicators = helpfulIndicators.filter(indicator => 
      responseLower.includes(indicator)
    );
    
    logger.debug(`Found ${foundIndicators.length} helpful indicators in response`);
    return foundIndicators.length >= 2; // At least 2 indicators
  }
  
  /**
   * Check if response contains contact information or actionable steps
   */
  hasActionableInformation(response: string): boolean {
    const actionablePatterns = [
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, // Phone number
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /https?:\/\/[^\s]+/, // URL
      /step\s+\d+/i, // Step-by-step instructions
      /first|second|third|finally/i, // Sequential instructions
      /click|visit|go to|navigate/i // Action words
    ];
    
    return actionablePatterns.some(pattern => pattern.test(response));
  }
  
  /**
   * Detect if response is too generic or unhelpful
   */
  isGenericResponse(response: string): boolean {
    const genericPhrases = [
      'i can help',
      'how can i assist',
      'is there anything',
      'let me know',
      'feel free to ask',
      'i\'m here to help'
    ];
    
    const responseLower = response.toLowerCase();
    const hasGenericPhrase = genericPhrases.some(phrase => 
      responseLower.includes(phrase)
    );
    
    // Generic if it's short and contains generic phrases
    return hasGenericPhrase && response.split(/\s+/).length < 30;
  }
  
  /**
   * Calculate response completeness score
   */
  getCompletenessScore(response: string): number {
    let score = 0;
    
    // Has reasonable length (10-500 words)
    const wordCount = response.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 500) score += 25;
    
    // Has proper punctuation
    if (/[.!?]$/.test(response.trim())) score += 15;
    
    // Has actionable information
    if (this.hasActionableInformation(response)) score += 30;
    
    // Not generic
    if (!this.isGenericResponse(response)) score += 30;
    
    logger.debug(`Completeness score: ${score}/100`);
    return score;
  }
}