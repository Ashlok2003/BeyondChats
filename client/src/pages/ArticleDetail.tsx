import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articleApi, Article } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, User, ExternalLink, Sparkles, FileText, Link as LinkIcon } from 'lucide-react';

const ArticleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'original' | 'updated'>('original');

    useEffect(() => {
        if (id) {
            fetchArticle(id);
        }
    }, [id]);

    const fetchArticle = async (articleId: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await articleApi.getById(articleId);
            setArticle(data);
            // If article is updated, show updated version by default
            if (data.isUpdated) {
                setActiveTab('updated');
            }
        } catch (err) {
            setError('Failed to fetch article. Please try again later.');
            console.error('Error fetching article:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown date';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const [enhancing, setEnhancing] = useState(false);

    const handleEnhance = async () => {
        if (!article) return;
        try {
            setEnhancing(true);
            const enhanced = await articleApi.enhance(article.id);
            setArticle(enhanced);
            setActiveTab('updated');
        } catch (err) {
            console.error('Enhancement failed:', err);
            // Optional: show toast or error state
        } finally {
            setEnhancing(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading article..." />;
    }

    if (enhancing) {
        return <LoadingSpinner message="Enhancing article with AI... This may take a minute." />;
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-8 text-center max-w-md bg-surface border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
                    <p className="text-gray-400 mb-4">{error || 'Article not found'}</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Back to Articles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    <div className="flex gap-3">
                        <a
                            href={article.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary flex items-center gap-2 text-sm py-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Original</span>
                        </a>
                        {!article.isUpdated && (
                            <button
                                onClick={handleEnhance}
                                disabled={enhancing}
                                className="btn-primary flex items-center gap-2 text-sm py-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Enhance with AI</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-0">
                {/* Title and Meta */}
                <div className="mb-10 text-center">
                    <div className="flex justify-center mb-6">
                        {article.isUpdated && (
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 text-white" />
                                <span className="text-xs font-semibold text-white tracking-widest uppercase">AI Enhanced</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight text-balance">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm tracking-wide">
                        {article.author && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="uppercase">{article.author}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.publishedDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs (if article is updated) */}
                {article.isUpdated && article.updatedContent && (
                    <div className="mb-8 flex justify-center">
                        <div className="bg-surface/50 p-1 rounded-xl border border-white/10 inline-flex">
                            <button
                                onClick={() => setActiveTab('original')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'original'
                                    ? 'bg-white/10 text-white shadow-lg border border-white/5'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                Original
                            </button>
                            <button
                                onClick={() => setActiveTab('updated')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'updated'
                                    ? 'bg-white text-black shadow-lg shadow-white/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Enhanced
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <div className="w-24 h-24 bg-white/5 rounded-full blur-3xl" />
                    </div>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-300 prose-a:text-white prose-strong:text-white">
                        {activeTab === 'updated' && article.updatedContent ? (
                            <ReactMarkdown>{article.updatedContent}</ReactMarkdown>
                        ) : (
                            <div className="whitespace-pre-wrap leading-relaxed">
                                {article.content}
                            </div>
                        )}
                    </div>
                </div>

                {/* References */}
                {article.isUpdated && article.references && article.references.length > 0 && activeTab === 'updated' && (
                    <div className="mt-8">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <LinkIcon className="w-5 h-5 text-white" />
                            <h3 className="text-xl font-bold text-white tracking-tight">References</h3>
                        </div>
                        <div className="grid gap-3">
                            {article.references.map((ref, index) => (
                                <a
                                    key={index}
                                    href={ref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-surface border border-white/5 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all group"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/10 group-hover:border-white/30 transition-colors">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 truncate text-gray-400 text-sm group-hover:text-white transition-colors font-mono">
                                        {ref}
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleDetail;
