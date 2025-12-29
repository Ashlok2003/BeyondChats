import React from 'react';
import { Article } from '../services/api';
import { Calendar, User, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticleCardProps {
    article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown date';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const truncateContent = (content: string, maxLength: number = 200) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).trim() + '...';
    };

    return (
        <Link to={`/article/${article.id}`}>
            <div className="glass-card p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:bg-white/5 group border border-white/5 hover:border-white/20">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-2 flex-1 tracking-tight">
                        {article.title}
                    </h3>
                    {article.isUpdated && (
                        <div className="ml-3 flex-shrink-0">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span className="text-xs font-bold text-white tracking-wider uppercase">Updated</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                    {article.author && (
                        <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            <span className="uppercase tracking-wide text-xs font-semibold">{article.author}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span className="tracking-wide text-xs">{formatDate(article.publishedDate)}</span>
                    </div>
                </div>

                {/* Content Preview */}
                <p className="text-gray-400 mb-6 line-clamp-3 flex-1 text-sm leading-relaxed">
                    {truncateContent(article.content)}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all text-sm">
                        <span>Read article</span>
                        <ExternalLink className="w-3 h-3" />
                    </div>

                    {article.isUpdated && article.references && article.references.length > 0 && (
                        <div className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors bg-white/5 px-2 py-1 rounded">
                            {article.references.length} ref{article.references.length !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ArticleCard;
