import { scrapeBeyondChatsArticles } from '../services/scraper';
import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Script to scrape articles from BeyondChats and save to database
 */
async function main() {
    try {
        logger.info('🚀 Starting article scraping process...');

        // Scrape articles
        const articles = await scrapeBeyondChatsArticles();

        if (articles.length === 0) {
            logger.warn('No articles were scraped');
            return;
        }

        logger.info(`Saving ${articles.length} articles to database...`);

        // Save to database
        let savedCount = 0;
        let skippedCount = 0;

        for (const article of articles) {
            try {
                // Check if article already exists
                const existing = await prisma.article.findUnique({
                    where: { originalUrl: article.originalUrl },
                });

                if (existing) {
                    logger.info(`Article already exists: ${article.title}`);
                    skippedCount++;
                    continue;
                }

                // Create new article
                await prisma.article.create({
                    data: {
                        title: article.title,
                        content: article.content,
                        author: article.author,
                        publishedDate: article.publishedDate,
                        originalUrl: article.originalUrl,
                    },
                });

                logger.info(`Saved: ${article.title}`);
                savedCount++;

            } catch (error) {
                logger.error(`Failed to save article: ${article.title}`, error);
            }
        }

        logger.info(`\nSummary:`);
        logger.info(`   Total scraped: ${articles.length}`);
        logger.info(`   Saved: ${savedCount}`);
        logger.info(`   Skipped (duplicates): ${skippedCount}`);
        logger.info(`\n Scraping completed successfully!`);

    } catch (error) {
        logger.error('Scraping script failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
main();
