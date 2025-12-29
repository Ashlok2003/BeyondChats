import React, { useEffect, useState } from 'react';
import { articleApi, Article } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Newspaper, Filter, Sparkles, AlertCircle, Download } from 'lucide-react';

const ArticleList: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'updated' | 'original'>('all');
    const [scraping, setScraping] = useState(false);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await articleApi.getAll();
            setArticles(data);
        } catch (err) {
            setError('Failed to fetch articles. Please try again later.');
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleScrape = async () => {
        try {
            setScraping(true);
            await articleApi.scrape();
            await fetchArticles(); // Refresh list
        } catch (err) {
            console.error('Scrape failed:', err);
            setError('Failed to scrape new articles. Check backend logs.');
        } finally {
            setScraping(false);
        }
    };

    const filteredArticles = articles.filter(article => {
        if (filter === 'updated') return article.isUpdated;
        if (filter === 'original') return !article.isUpdated;
        return true;
    });

    if (scraping) {
        return <LoadingSpinner message="Scraping new articles... This may take a few moments." />;
    }

    return (
        <div className="min-h-screen bg-background relative">
            <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

            {/* Hero Section */}
            <div className="relative pt-20 pb-12 overflow-hidden border-b border-white/5">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-white" />
                            <span className="text-xs font-semibold text-gray-300 tracking-widest uppercase">AI-Powered Content</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight leading-none">
                            BeyondChats
                            <span className="block text-3xl md:text-4xl mt-4 font-normal text-gray-400">Article Collection</span>
                        </h1>

                        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Curated articles enhanced by artificial intelligence. Experience content that evolves.
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleScrape}
                                disabled={scraping}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Scrape New Articles
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/10 pt-8 max-w-2xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-1">{articles.length}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Total Articles</div>
                            </div>
                            <div className="text-center md:border-l border-white/10">
                                <div className="text-3xl font-bold text-white mb-1">
                                    {articles.filter(a => a.isUpdated).length}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">AI Enhanced</div>
                            </div>
                            <div className="text-center border-l border-white/10 hidden md:block">
                                <div className="text-3xl font-bold text-white mb-1">
                                    {articles.length - articles.filter(a => a.isUpdated).length}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Original</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">Filter View</span>
                    </div>

                    <div className="flex bg-surface border border-white/10 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'all'
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('updated')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'updated'
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Enhanced
                        </button>
                        <button
                            onClick={() => setFilter('original')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'original'
                                ? 'bg-white text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Original
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingSpinner message="Loading articles..." />
                ) : error ? (
                    <div className="glass-card p-12 text-center border-red-500/20">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Articles</h3>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button onClick={fetchArticles} className="btn-primary">
                            Try Again
                        </button>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Newspaper className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No Articles Found</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8">
                            {filter !== 'all'
                                ? `No articles match the "${filter}" filter.`
                                : 'Your collection is empty. Scrape some articles to get started.'}
                        </p>
                        {filteredArticles.length === 0 && filter === 'all' && (
                            <button onClick={handleScrape} className="btn-primary">
                                Scrape Now
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {filteredArticles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {/* Results count */}
                        <div className="text-center text-gray-500 text-sm tracking-wide uppercase">
                            Showing {filteredArticles.length} of {articles.length} articles
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ArticleList;
