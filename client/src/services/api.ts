import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Article {
    id: string;
    title: string;
    content: string;
    author?: string;
    publishedDate?: string;
    originalUrl: string;
    isUpdated: boolean;
    updatedContent?: string;
    references?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ArticlesResponse {
    status: string;
    data: {
        count: number;
        articles: Article[];
    };
}

export interface ArticleResponse {
    status: string;
    data: {
        article: Article;
    };
}

// API functions
export const articleApi = {
    // Get all articles
    getAll: async (updated?: boolean): Promise<Article[]> => {
        const params = updated !== undefined ? { updated } : {};
        const response = await api.get<ArticlesResponse>('/articles', { params });
        return response.data.data.articles;
    },

    // Get single article
    getById: async (id: string): Promise<Article> => {
        const response = await api.get<ArticleResponse>(`/articles/${id}`);
        return response.data.data.article;
    },

    // Create article
    create: async (data: Partial<Article>): Promise<Article> => {
        const response = await api.post<ArticleResponse>('/articles', data);
        return response.data.data.article;
    },

    // Update article
    update: async (id: string, data: Partial<Article>): Promise<Article> => {
        const response = await api.put<ArticleResponse>(`/articles/${id}`, data);
        return response.data.data.article;
    },

    // Delete article
    delete: async (id: string): Promise<void> => {
        await api.delete(`/articles/${id}`);
    },

    // Trigger Scraper
    scrape: async (): Promise<{ count: number; articles: Article[] }> => {
        const response = await api.post('/articles/scrape');
        return response.data.data;
    },

    // Enhance specific article
    enhance: async (id: string): Promise<Article> => {
        const response = await api.post<ArticleResponse>(`/articles/${id}/enhance`);
        return response.data.data.article;
    },
};

export default api;
