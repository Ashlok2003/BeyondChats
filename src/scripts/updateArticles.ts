import prisma from '../config/database';
import logger from '../utils/logger';
import { searchGoogle } from '../services/googleSearch';
import { extractMultipleArticles } from '../services/contentExtractor';
import { rewriteArticle } from '../services/llmService';

/**
 * Main script for Phase 2: Update articles using Google Search and LLM
 */
async function main() {
    try {
        logger.info('🚀 Starting article update process (Phase 2)...');

        // Fetch all articles that haven't been updated yet
        const articles = await prisma.article.findMany({
            where: { isUpdated: false },
        });

        if (articles.length === 0) {
            logger.info('No articles to update');
            return;
        }

        logger.info(`Found ${articles.length} articles to update`);

        let successCount = 0;
        let failureCount = 0;

        for (const article of articles) {
            try {
                logger.info(`\n${'='.repeat(80)}`);
                logger.info(`Processing: ${article.title}`);
                logger.info(`${'='.repeat(80)}\n`);

                // Step 1: Search Google for the article title
                const searchResults = await searchGoogle(article.title, 2);

                if (searchResults.length === 0) {
                    logger.warn(`No search results found for: ${article.title}`);
                    failureCount++;
                    continue;
                }

                // Step 2: Extract content from top 2 results
                const referenceUrls = searchResults.map(result => result.url);
                logger.info(`Extracting content from ${referenceUrls.length} reference articles...`);

                const referenceArticles = await extractMultipleArticles(referenceUrls);

                if (referenceArticles.length === 0) {
                    logger.warn(`Failed to extract content from reference articles for: ${article.title}`);
                    failureCount++;
                    continue;
                }

                logger.info(`Successfully extracted ${referenceArticles.length} reference articles`);

                // Step 3: Use LLM to rewrite the article
                const { updatedContent, references } = await rewriteArticle(
                    article.title,
                    article.content,
                    referenceArticles
                );

                // Step 4: Update the article in database
                await prisma.article.update({
                    where: { id: article.id },
                    data: {
                        isUpdated: true,
                        updatedContent,
                        references,
                    },
                });

                logger.info(`Successfully updated article: ${article.title}`);
                successCount++;

                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                logger.error(`Failed to update article: ${article.title}`, error);
                failureCount++;
            }
        }

        logger.info(`\n${'='.repeat(80)}`);
        logger.info(`   Update Summary:`);
        logger.info(`   Total articles: ${articles.length}`);
        logger.info(`   Successfully updated: ${successCount}`);
        logger.info(`   Failed: ${failureCount}`);
        logger.info(`${'='.repeat(80)}\n`);

        logger.info('Article update process completed!');

    } catch (error) {
        logger.error('Update script failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
