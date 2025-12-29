import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import logger from '../utils/logger';

export interface ExtractedContent {
    title: string;
    content: string;
    url: string;
}

/**
 * Extract main content from a webpage
 */
export async function extractArticleContent(url: string): Promise<ExtractedContent | null> {
    let browser: Browser | null = null;

    try {
        logger.info(`📄 Extracting content from: ${url}`);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page: Page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for content to load
        await page.waitForSelector('body', { timeout: 10000 });

        const html = await page.content();
        const $ = cheerio.load(html);

        // Extract title
        const title =
            $('h1').first().text().trim() ||
            $('article h1').first().text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            $('title').text().trim() ||
            'Untitled';

        // Extract main content using multiple strategies
        let content = '';

        // Strategy 1: Look for article/main content containers
        const contentSelectors = [
            'article',
            'main article',
            '.article-content',
            '.post-content',
            '.entry-content',
            'main',
            '[role="main"]',
            '.content',
            '#content',
        ];

        for (const selector of contentSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                // Clone to avoid modifying original
                const clone = element.clone();

                // Remove unwanted elements
                clone.find('script, style, nav, footer, aside, header, .comments, .related, .sidebar, .advertisement, .ads, iframe, button, form').remove();

                // Get paragraphs
                const paragraphs = clone.find('p, h1, h2, h3, h4, h5, h6, li');
                const textParts: string[] = [];

                paragraphs.each((_, el) => {
                    const text = $(el).text().trim();
                    if (text.length > 20) { // Filter out short snippets
                        textParts.push(text);
                    }
                });

                content = textParts.join('\n\n');

                if (content.length > 200) break; // Found substantial content
            }
        }

        // Strategy 2: If no content found, get all paragraphs
        if (!content || content.length < 200) {
            const paragraphs: string[] = [];
            $('p').each((_, element) => {
                const text = $(element).text().trim();
                if (text.length > 50) {
                    paragraphs.push(text);
                }
            });
            content = paragraphs.join('\n\n');
        }

        // Clean up content
        content = cleanContent(content);

        if (!content || content.length < 100) {
            logger.warn(`Insufficient content extracted from ${url}`);
            return null;
        }

        logger.info(`Extracted ${content.length} characters from ${url}`);

        return {
            title,
            content,
            url,
        };

    } catch (error) {
        logger.error(`Failed to extract content from ${url}:`, error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Clean extracted content
 */
function cleanContent(text: string): string {
    return text
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove multiple newlines
        .replace(/\n{3,}/g, '\n\n')
        // Remove special characters
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        // Trim
        .trim();
}

/**
 * Extract content from multiple URLs
 */
export async function extractMultipleArticles(urls: string[]): Promise<ExtractedContent[]> {
    const results: ExtractedContent[] = [];

    for (const url of urls) {
        try {
            const content = await extractArticleContent(url);
            if (content) {
                results.push(content);
            }
        } catch (error) {
            logger.error(`Failed to extract ${url}:`, error);
        }
    }

    return results;
}
