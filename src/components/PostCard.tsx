import React, { useState } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostProps {
    post: {
        id: number;
        author: {
            id: number;
            name: string;
            role: string;
            avatarUrl?: string; // made optional
        };
        content: string;
        timestamp: string;
        likes: number;
        comments: number;
        imageUrl?: string;
    }
}

export default function PostCard({ post }: PostProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes);

    const handleLike = () => {
        if (isLiked) {
            setLikesCount(prev => prev - 1);
        } else {
            setLikesCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 text-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.author.id}`} className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
                        {post.author.avatarUrl && <img src={post.author.avatarUrl} alt={post.author.name} className="h-full w-full object-cover" />}
                    </Link>
                    <div>
                        <Link to={`/profile/${post.author.id}`} className="font-semibold hover:underline block">
                            {post.author.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{post.timestamp} • {post.author.role}</span>
                    </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

            {post.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-border">
                    <img src={post.imageUrl} alt="Post content" className="w-full h-auto" />
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-3 border-t border-border mt-3">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {likesCount}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto">
                    <Share2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
