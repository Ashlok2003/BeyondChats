import { Router } from 'express';
import { body } from 'express-validator';
import {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    scrapeArticles,
    enhanceArticles,
    enhanceArticleById,
} from '../controllers/articleController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - originalUrl
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated UUID
 *         title:
 *           type: string
 *           description: Article title
 *         content:
 *           type: string
 *           description: Article content
 *         author:
 *           type: string
 *           description: Article author
 *         publishedDate:
 *           type: string
 *           format: date-time
 *           description: Publication date
 *         originalUrl:
 *           type: string
 *           description: Original article URL
 *         isUpdated:
 *           type: boolean
 *           description: Whether article has been updated by LLM
 *         updatedContent:
 *           type: string
 *           description: LLM-generated updated content
 *         references:
 *           type: array
 *           items:
 *             type: string
 *           description: Reference article URLs
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: updated
 *         schema:
 *           type: boolean
 *         description: Filter by updated status
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 */
router.get('/', getAllArticles);

/**
 * @swagger
 * /api/articles/scrape:
 *   post:
 *     summary: Trigger article scraping from BeyondChats blog
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Scraping completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       description: Number of new articles saved
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 *       500:
 *         description: Server error
 */
router.post('/scrape', scrapeArticles);

/**
 * @swagger
 * /api/articles/enhance:
 *   post:
 *     summary: Trigger AI enhancement for articles
 *     description: Searches Google, extracts content, and rewrites the oldest 5 non-updated articles using LLM.
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Enhancement completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 *       500:
 *         description: Server error
 */
router.post('/enhance', enhanceArticles);

/**
 * @swagger
 * /api/articles/{id}/enhance:
 *   post:
 *     summary: Trigger AI enhancement for a specific article
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article enhanced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     article:
 *                       $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 */
router.post('/:id/enhance', enhanceArticleById);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     article:
 *                       $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 */
router.get('/:id', getArticleById);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create new article
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - originalUrl
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date-time
 *               originalUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Article created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Article already exists
 */
router.post(
    '/',
    [
        body('title').notEmpty().trim().withMessage('Title is required'),
        body('content').notEmpty().withMessage('Content is required'),
        body('originalUrl').isURL().withMessage('Valid URL is required'),
        body('author').optional().trim(),
        body('publishedDate').optional().isISO8601(),
    ],
    createArticle
);

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: Update article
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               publishedDate:
 *                 type: string
 *                 format: date-time
 *               isUpdated:
 *                 type: boolean
 *               updatedContent:
 *                 type: string
 *               references:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Article updated
 *       404:
 *         description: Article not found
 */
router.put('/:id', updateArticle);

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Delete article
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Article deleted
 *       404:
 *         description: Article not found
 */
router.delete('/:id', deleteArticle);

export default router;
