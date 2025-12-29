import puppeteer, { Browser, Page } from 'puppeteer';
import logger from '../utils/logger';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

/**
 * Search Google and return top blog/article results
 */
export async function searchGoogle(query: string, numResults: number = 2): Promise<SearchResult[]> {
    let browser: Browser | null = null;

    try {
        logger.info(`🔍 Searching Google for: "${query}"`);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page: Page = await browser.newPage();
        // Use a more recent/realistic User Agent
        await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        );

        // Navigate to Google search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=us&hl=en`;

        try {
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            // specific selector for consent "Accept all" might vary, but let's try waiting for results first with longer timeout
            await page.waitForSelector('#search, #rso, .g', { timeout: 10000 });
        } catch (e) {
            logger.warn('Search results selector not found or timeout, returning empty results to allow fallback.');
            return [];
        }

        // Extract search results
        const results = await page.evaluate(() => {
            const searchResults: SearchResult[] = [];

            // Get all search result elements
            const resultElements = document.querySelectorAll('div.g, div[data-sokoban-container]');

            resultElements.forEach((element) => {
                // Extract title and URL
                const linkElement = element.querySelector('a[href]') as HTMLAnchorElement;
                const titleElement = element.querySelector('h3');
                const snippetElement = element.querySelector('div[data-sncf], .VwiC3b, .s3v9rd');

                if (linkElement && titleElement && linkElement.href.startsWith('http')) {
                    const url = linkElement.href;

                    // Filter out non-article URLs (social media, videos, etc.)
                    const excludeDomains = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com/posts'];
                    const isExcluded = excludeDomains.some(domain => url.includes(domain));

                    if (!isExcluded) {
                        searchResults.push({
                            title: titleElement.textContent || '',
                            url: url,
                            snippet: snippetElement?.textContent || '',
                        });
                    }
                }
            });

            return searchResults;
        });

        logger.info(`Found ${results.length} search results`);

        // Return top N results
        const topResults = results.slice(0, numResults);

        topResults.forEach((result, index) => {
            logger.info(`${index + 1}. ${result.title}`);
            logger.info(`   URL: ${result.url}`);
        });

        return topResults;

    } catch (error) {
        logger.error('Google search failed:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
