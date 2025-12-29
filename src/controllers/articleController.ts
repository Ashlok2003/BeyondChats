import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';
import logger from '../utils/logger';

/**
 * Get all articles
 */
export const getAllArticles = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { updated } = req.query;

        const where = updated !== undefined
            ? { isUpdated: updated === 'true' }
            : {};

        const articles = await prisma.article.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            status: 'success',
            data: {
                count: articles.length,
                articles,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single article by ID
 */
export const getArticleById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const article = await prisma.article.findUnique({
            where: { id },
        });

        if (!article) {
            throw new AppError('Article not found', 404);
        }

        res.json({
            status: 'success',
            data: { article },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new article
 */
export const createArticle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new AppError('Validation failed', 400);
        }

        const { title, content, author, publishedDate, originalUrl } = req.body;

        // Check if article with same URL already exists
        const existing = await prisma.article.findUnique({
            where: { originalUrl },
        });

        if (existing) {
            throw new AppError('Article with this URL already exists', 409);
        }

        const article = await prisma.article.create({
            data: {
                title,
                content,
                author,
                publishedDate: publishedDate ? new Date(publishedDate) : null,
                originalUrl,
            },
        });

        logger.info(`Article created: ${article.id} - ${article.title}`);

        res.status(201).json({
            status: 'success',
            data: { article },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update article
 */
export const updateArticle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { title, content, author, publishedDate, isUpdated, updatedContent, references } = req.body;

        const article = await prisma.article.findUnique({
            where: { id },
        });

        if (!article) {
            throw new AppError('Article not found', 404);
        }

        const updated = await prisma.article.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(content && { content }),
                ...(author && { author }),
                ...(publishedDate && { publishedDate: new Date(publishedDate) }),
                ...(isUpdated !== undefined && { isUpdated }),
                ...(updatedContent && { updatedContent }),
                ...(references && { references }),
            },
        });

        logger.info(`Article updated: ${updated.id} - ${updated.title}`);

        res.json({
            status: 'success',
            data: { article: updated },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete article
 */
export const deleteArticle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const article = await prisma.article.findUnique({
            where: { id },
        });

        if (!article) {
            throw new AppError('Article not found', 404);
        }

        await prisma.article.delete({
            where: { id },
        });

        logger.info(`Article deleted: ${id}`);


        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Trigger article scraping
 */
export const scrapeArticles = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { scrapeBeyondChatsArticles } = await import('../services/scraper');

        logger.info('Received scrape request');
        const articles = await scrapeBeyondChatsArticles();

        if (articles.length === 0) {
            res.json({
                status: 'success',
                message: 'No articles found to scrape',
                data: { count: 0, articles: [] }
            });
            return;
        }

        let savedCount = 0;
        const savedArticles = [];

        for (const article of articles) {
            // Check existence
            const existing = await prisma.article.findUnique({
                where: { originalUrl: article.originalUrl },
            });

            if (!existing) {
                const saved = await prisma.article.create({
                    data: {
                        title: article.title,
                        content: article.content,
                        author: article.author,
                        publishedDate: article.publishedDate,
                        originalUrl: article.originalUrl,
                    },
                });
                savedArticles.push(saved);
                savedCount++;
            }
        }

        res.json({
            status: 'success',
            message: `Scraping completed. Saved ${savedCount} new articles.`,
            data: {
                count: savedCount,
                articles: savedArticles
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Trigger article enhancement (rewrite using LLM)
 */
export const enhanceArticles = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { searchGoogle } = await import('../services/googleSearch');
        const { extractMultipleArticles } = await import('../services/contentExtractor');
        const { rewriteArticle } = await import('../services/llmService');

        logger.info('Received enhance request');

        // Fetch articles that need updating
        const articles = await prisma.article.findMany({
            where: { isUpdated: false },
            take: 5 // Process 5 articles at a time
        });

        if (articles.length === 0) {
            res.status(200).json({
                status: 'success',
                message: 'No articles need enhancement.',
                data: { count: 0, articles: [] }
            });
            return;
        }

        logger.info(`Found ${articles.length} articles to enhance.`);

        let successCount = 0;
        let failureCount = 0;
        const enhancedArticles = [];

        // Process articles sequentially
        for (const article of articles) {
            try {
                // 1. Search Google
                const searchResults = await searchGoogle(article.title, 2);

                let referenceArticles: any[] = [];
                if (searchResults.length > 0) {
                    // 2. Extract content
                    const referenceUrls = searchResults.map(r => r.url);
                    referenceArticles = await extractMultipleArticles(referenceUrls);
                } else {
                    logger.warn(`No search results for "${article.title}", proceeding with enhancement using internal LLM knowledge only.`);
                }

                // 3. Rewrite (even if referenceArticles is empty)
                const { updatedContent, references } = await rewriteArticle(
                    article.title,
                    article.content,
                    referenceArticles
                );

                // 4. Update DB
                const updated = await prisma.article.update({
                    where: { id: article.id },
                    data: {
                        isUpdated: true,
                        updatedContent,
                        references,
                    },
                });

                enhancedArticles.push(updated);
                successCount++;

            } catch (error) {
                logger.error(`Failed to enhance article: ${article.title}`, error);
                failureCount++;
            }
        }

        res.json({
            status: 'success',
            message: `Enhancement completed. Updated ${successCount} articles. Failed: ${failureCount}.`,
            data: {
                count: successCount,
                articles: enhancedArticles
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Trigger enhancement for a specific article
 */
export const enhanceArticleById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { searchGoogle } = await import('../services/googleSearch');
        const { extractMultipleArticles } = await import('../services/contentExtractor');
        const { rewriteArticle } = await import('../services/llmService');

        logger.info(`Received enhance request for article: ${id}`);

        const article = await prisma.article.findUnique({
            where: { id },
        });

        if (!article) {
            throw new AppError('Article not found', 404);
        }

        // 1. Search Google
        const searchResults = await searchGoogle(article.title, 2);

        let referenceArticles: any[] = [];
        if (searchResults.length > 0) {
            // 2. Extract content
            const referenceUrls = searchResults.map(r => r.url);
            referenceArticles = await extractMultipleArticles(referenceUrls);
        } else {
            logger.warn(`No search results for "${article.title}", proceeding with enhancement using internal LLM knowledge only.`);
        }

        // 3. Rewrite
        const { updatedContent, references } = await rewriteArticle(
            article.title,
            article.content,
            referenceArticles
        );

        // 4. Update DB
        const updated = await prisma.article.update({
            where: { id: article.id },
            data: {
                isUpdated: true,
                updatedContent,
                references,
            },
        });

        res.json({
            status: 'success',
            message: 'Article enhanced successfully.',
            data: { article: updated }
        });

    } catch (error) {
        next(error);
    }
};
