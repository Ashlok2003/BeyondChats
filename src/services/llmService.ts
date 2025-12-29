import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger';
import { ExtractedContent } from './contentExtractor';

// Initialize clients
let openai: OpenAI | null = null;
let genAI: GoogleGenerativeAI | null = null;

if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export interface RewriteResult {
    updatedContent: string;
    references: string[];
}

/**
 * Rewrite article using LLM based on reference articles
 */
export async function rewriteArticle(
    originalTitle: string,
    originalContent: string,
    referenceArticles: ExtractedContent[]
): Promise<RewriteResult> {
    try {
        logger.info(`🤖 Rewriting article: "${originalTitle}"`);

        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        const hasGemini = !!process.env.GEMINI_API_KEY;

        if (!hasOpenAI && !hasGemini) {
            throw new Error('Neither OPENAI_API_KEY nor GEMINI_API_KEY is set in environment variables');
        }

        // Prepare reference content
        const referencesText = referenceArticles
            .map((ref, index) => {
                return `Reference Article ${index + 1}: ${ref.title}\nURL: ${ref.url}\n\nContent:\n${ref.content.substring(0, 2000)}...\n`;
            })
            .join('\n---\n\n');

        // Create prompt for LLM
        const prompt = `You are an expert content writer and editor. Your task is to rewrite and improve the following article based on the style, formatting, and content approach of the reference articles provided.

ORIGINAL ARTICLE:
Title: ${originalTitle}
Content:
${originalContent}

---

REFERENCE ARTICLES (Top-ranking articles on Google for this topic):
${referencesText}

---

INSTRUCTIONS:
1. Analyze the formatting, structure, and writing style of the reference articles
2. Rewrite the original article to match the quality and style of the reference articles
3. Improve the content while maintaining the core message and facts
4. Use similar heading structures, paragraph lengths, and formatting patterns
5. Make the content more engaging and SEO-friendly
6. Keep the rewritten content comprehensive and well-structured
7. Do NOT include any meta-commentary or explanations - only output the rewritten article
8. Do NOT add a "References" section at the end. The references will be displayed separately by the system.
9. Ensure the content flows naturally and is not just a list of summaries.

OUTPUT FORMAT:
Return ONLY the rewritten article content in markdown format. DO NOT include a "References" section.`;

        let updatedContent = '';

        // Prefer OpenAI if available, otherwise use Gemini
        if (hasOpenAI && openai) {
            logger.info('Using OpenAI GPT-4...');
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert content writer who specializes in rewriting and improving articles to match the style and quality of top-ranking content.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 4000,
            });
            updatedContent = response.choices[0]?.message?.content || '';
        } else if (hasGemini && genAI) {
            logger.info('Using Google Gemini 2.5 Flash...');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                try {
                    const result = await model.generateContent(prompt);
                    updatedContent = result.response.text();
                    break; // Success
                } catch (error: any) {
                    attempts++;
                    if (error.status === 429 || error.message?.includes('429')) {
                        logger.warn(`Rate limit hit (Attempt ${attempts}/${maxAttempts}). Waiting 65s to reset minute quota...`);
                        await new Promise(resolve => setTimeout(resolve, 65000));
                    } else {
                        throw error; // Rethrow other errors
                    }
                }
            }

            if (!updatedContent) {
                throw new Error(`Failed to generate content after ${maxAttempts} attempts due to rate limits.`);
            }
        }

        if (!updatedContent) {
            throw new Error('LLM returned empty content');
        }

        logger.info(`Article rewritten successfully (${updatedContent.length} characters)`);

        // Extract reference URLs
        const references = referenceArticles.map(ref => ref.url);

        return {
            updatedContent,
            references,
        };

    } catch (error) {
        logger.error('LLM rewrite failed:', error);
        throw error;
    }
}

/**
 * Generate article summary using LLM
 */
export async function generateSummary(content: string, maxLength: number = 200): Promise<string> {
    try {
        const hasOpenAI = !!process.env.OPENAI_API_KEY;
        const hasGemini = !!process.env.GEMINI_API_KEY;

        const prompt = `Summarize the following article in ${maxLength} characters or less:\n\n${content}`;

        if (hasOpenAI && openai) {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates concise summaries.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.5,
                max_tokens: 100,
            });
            return response.choices[0]?.message?.content || '';
        } else if (hasGemini && genAI) {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }

        return '';
    } catch (error) {
        logger.error('Summary generation failed:', error);
        return '';
    }
}
