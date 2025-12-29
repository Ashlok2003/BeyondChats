import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import logger from '../utils/logger';

export interface ScrapedArticle {
    title: string;
    content: string;
    author?: string;
    publishedDate?: Date;
    originalUrl: string;
}

/**
 * Scrape articles from BeyondChats blog
 * Fetches the 5 oldest articles from the last page
 */
export async function scrapeBeyondChatsArticles(): Promise<ScrapedArticle[]> {
    let browser: Browser | null = null;

    try {
        logger.info('🕷️  Starting BeyondChats blog scraper...');

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page: Page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        const blogUrl = process.env.BEYONDCHATS_BLOG_URL || 'https://beyondchats.com/blogs/';

        logger.info(`Navigating to ${blogUrl}`);
        await page.goto(blogUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for content to load
        await page.waitForSelector('article, .blog-post, .post, [class*="article"]', { timeout: 10000 });

        // Get page content
        const html = await page.content();
        const $ = cheerio.load(html);

        // Find all article links
        const articleLinks: string[] = [];

        // Try different selectors for article links
        $('a[href*="/blog"], a[href*="/article"], article a, .blog-post a, .post a').each((_, element) => {
            const href = $(element).attr('href');
            if (href && !articleLinks.includes(href)) {
                // Convert relative URLs to absolute
                const absoluteUrl = href.startsWith('http')
                    ? href
                    : new URL(href, blogUrl).href;
                articleLinks.push(absoluteUrl);
            }
        });

        logger.info(`Found ${articleLinks.length} article links`);

        // Get the last 5 articles (oldest)
        const articlesToScrape = articleLinks.slice(-5);
        logger.info(`Scraping ${articlesToScrape.length} oldest articles`);

        const articles: ScrapedArticle[] = [];

        for (const url of articlesToScrape) {
            try {
                logger.info(`Scraping article: ${url}`);
                const article = await scrapeArticleContent(page, url);
                if (article) {
                    articles.push(article);
                }
            } catch (error) {
                logger.error(`Failed to scrape article ${url}:`, error);
            }
        }

        logger.info(`✅ Successfully scraped ${articles.length} articles`);
        return articles;

    } catch (error) {
        logger.error('Scraping failed:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Scrape individual article content
 */
async function scrapeArticleContent(page: Page, url: string): Promise<ScrapedArticle | null> {
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for article content
        await page.waitForSelector('article, .article-content, .post-content, main', { timeout: 10000 });

        const html = await page.content();
        const $ = cheerio.load(html);

        // Extract title
        const title =
            $('h1').first().text().trim() ||
            $('article h1').first().text().trim() ||
            $('title').text().trim() ||
            'Untitled Article';

        // Extract content
        let content = '';

        // Try different content selectors
        const contentSelectors = [
            'article .content',
            '.article-content',
            '.post-content',
            'article',
            'main article',
            '.entry-content',
            '[class*="content"]',
        ];

        for (const selector of contentSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                // Remove unwanted elements
                element.find('script, style, nav, footer, aside, .comments').remove();
                content = element.text().trim();
                if (content.length > 100) break;
            }
        }

        // Extract author
        const author =
            $('[class*="author"] a').first().text().trim() ||
            $('[rel="author"]').first().text().trim() ||
            $('meta[name="author"]').attr('content') ||
            undefined;

        // Extract published date
        let publishedDate: Date | undefined;
        const dateStr =
            $('time').attr('datetime') ||
            $('[class*="date"]').first().text().trim() ||
            $('meta[property="article:published_time"]').attr('content');

        if (dateStr) {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
                publishedDate = parsed;
            }
        }

        if (!content || content.length < 50) {
            logger.warn(`Insufficient content for ${url}`);
            return null;
        }

        return {
            title,
            content,
            author,
            publishedDate,
            originalUrl: url,
        };

    } catch (error) {
        logger.error(`Error scraping ${url}:`, error);
        return null;
    }
}

/**
 * Extract clean text content from HTML
 */
export function extractTextContent(html: string): string {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, aside, iframe, .ads, .advertisement').remove();

    // Get text content
    const text = $('body').text();

    // Clean up whitespace
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
}
