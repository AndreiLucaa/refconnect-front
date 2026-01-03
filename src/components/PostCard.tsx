import React, { useState } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react'; // Added Trash2
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { usePost } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

interface PostProps {
    post: Post;
}

export default function PostCard({ post }: PostProps) {
    const { user } = useAuth();
    const { likePost, unlikePost, deletePost } = usePost();

    // Check if current user liked the post
    const isLikedByMe = post.likes?.some(l => l.userId === user?.id) || false;

    // Local state to show immediate feedback (optimistic update is also handled in context, but this helps)
    // Actually, if context updates post list, we might not need local state if props update.
    // But for smoother UI, local state is often good. However, if context fetches fresh data, it overrides.
    // Let's rely on props if we trust parent updates, or locally toggle. 
    // Given the context implementation fetches/updates list, we can rely on props if the list is updated.
    // But creating a 'toggle' local state just for animation is fine.

    // For now, let's just use the props derived state. 
    // If the context optimistically updates the post object in the list, then this will re-render with correct status.
    // If context doesn't update the specific post object in the array, we won't see changes.
    // My PostContext `likePost` implementation was "For now, let's assume the caller might want to refetch". 
    // So I should probably manually fetchPosts or the context should update. 
    // To be safe, I will implement local state here too.

    const [isLiked, setIsLiked] = useState(isLikedByMe);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

    const handleLike = async () => {
        if (isLiked) {
            setLikesCount(prev => Math.max(0, prev - 1));
            setIsLiked(false);
            await unlikePost(post.postId);
        } else {
            setLikesCount(prev => prev + 1);
            setIsLiked(true);
            await likePost(post.postId);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await deletePost(post.postId);
        }
    };

    const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const authorName = post.user ?
        ((post.user.firstName && post.user.lastName) ? `${post.user.firstName} ${post.user.lastName}` : (post.user.userName || 'Unknown User'))
        : 'Unknown User';

    const isAuthor = user?.id === post.userId;

    return (
        <div className="bg-card border border-border rounded-lg p-4 mb-4 text-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.userId}`} className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
                        {post.user?.profileImageUrl ? (
                            <img src={post.user.profileImageUrl} alt={authorName} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                {authorName.charAt(0)}
                            </div>
                        )}
                    </Link>
                    <div>
                        <Link to={`/profile/${post.userId}`} className="font-semibold hover:underline block">
                            {authorName}
                        </Link>
                        <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    </div>
                </div>
                {isAuthor && (
                    <button onClick={handleDelete} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <p className="mb-3 whitespace-pre-wrap">{post.description}</p>

            {post.mediaUrl && post.mediaType === 'image' && (
                <div className="mb-3 rounded-lg overflow-hidden border border-border">
                    <img src={post.mediaUrl} alt="Post content" className="w-full h-auto" />
                </div>
            )}
            {post.mediaUrl && post.mediaType === 'video' && (
                <div className="mb-3 rounded-lg overflow-hidden border border-border">
                    <video src={post.mediaUrl} controls className="w-full h-auto" />
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
                    {post.comments?.length || 0}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto">
                    <Share2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
