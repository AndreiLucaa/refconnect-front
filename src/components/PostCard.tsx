import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react'; // Added Trash2
import CommentsModal from './CommentsModal';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { usePost } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import { UpdatePostDto } from '../types';

interface PostProps {
    post: Post;
    initialIsLiked?: boolean;
    initialLikesCount?: number;
}

export default function PostCard({ post, initialIsLiked, initialLikesCount }: PostProps) {
    const { user } = useAuth();
    const { likePost, unlikePost, deletePost, fetchPosts, isPostLiked } = usePost();

  
    const isLikedByMe = post.likes?.some(l => l.userId === user?.id) || false;

    const [isLiked, setIsLiked] = useState<boolean>(typeof initialIsLiked === 'boolean' ? initialIsLiked : isLikedByMe);
    const [likesCount, setLikesCount] = useState<number>(typeof initialLikesCount === 'number' ? initialLikesCount : (post.likeCount ?? post.likes?.length ?? 0));

    const handleLike = async () => {
        if (isLiked) {
            // Optimistically update UI
            setLikesCount(prev => Math.max(0, prev - 1));
            setIsLiked(false);
            const ok = await unlikePost(post.postId);
            if (!ok) {
                // revert optimistic update
                setLikesCount(prev => prev + 1);
                setIsLiked(true);
                console.error(`Failed to unlike post ${post.postId}. See previous logs for details.`);
            }
        } else {
            setLikesCount(prev => prev + 1);
            setIsLiked(true);
            const ok = await likePost(post.postId);
            if (!ok) {
                setLikesCount(prev => Math.max(0, prev - 1));
                setIsLiked(false);
                console.error(`Failed to like post ${post.postId}. See previous logs for details.`);
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await deletePost(post.postId);
        }
    };

    const [showComments, setShowComments] = useState(false);

    const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Local author state: prefer embedded post.user but fall back to calling api/profiles/{id}
    const [author, setAuthor] = useState<any | null>(post.user || null);
    const authorName = author ? ((author.firstName && author.lastName) ? `${author.firstName} ${author.lastName}` : (author.userName || 'Unknown User')) : 'Unknown User';

    const isAuthor = user?.id === post.userId;
    const canEdit = isAuthor || user?.role === 'admin';

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UpdatePostDto>({
        description: post.description || '',
        mediaUrl: post.mediaUrl || '',
        mediaType: post.mediaType || 'text'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchAuthor = async () => {
            if (post.user) return; // already have embedded author
            if (!post.userId) return;
            try {
                const resp = await api.get(`/profiles/${post.userId}`);
                if (!mounted) return;
                setAuthor(resp.data);
            } catch (err) {
                // ignore - we'll show fallback Unknown
                console.debug('Failed to fetch author profile', err);
            }
        };
        fetchAuthor();
        
        const checkLiked = async () => {
            if (!post.postId) return;
            try {
                const liked = await isPostLiked(post.postId);
                if (!mounted) return;
                setIsLiked(liked);
            } catch (err) {
                
            }
        };
        checkLiked();
        return () => { mounted = false; };
    }, [post.user, post.userId, post.postId, isPostLiked]);

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
                <div className="flex items-center gap-1">
                    {isAuthor && (
                        <button onClick={handleDelete} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                    {canEdit && (
                        <button onClick={() => { setIsEditing(prev => !prev); setEditData({ description: post.description || '', mediaUrl: post.mediaUrl || '', mediaType: post.mediaType || 'text' }); }} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <p className="mb-3 whitespace-pre-wrap">{post.description}</p>

            {isEditing && (
                <form onSubmit={async (e) => { e.preventDefault(); setIsSaving(true); try { await api.put(`/posts/${post.postId}`, editData); setIsEditing(false); try { await fetchPosts(); } catch {} } catch (err) { console.error('Failed to update post', err); } finally { setIsSaving(false); } }} className="space-y-3 mb-3">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                        <textarea value={editData.description} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="block w-full rounded-md border border-input px-3 py-2 text-foreground sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Media URL</label>
                        <input type="url" value={editData.mediaUrl} onChange={(e) => setEditData(prev => ({ ...prev, mediaUrl: e.target.value }))} className="block w-full rounded-md border border-input px-3 py-2 text-foreground sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Media Type</label>
                        <select value={editData.mediaType} onChange={(e) => setEditData(prev => ({ ...prev, mediaType: e.target.value }))} className="block w-full rounded-md border border-input px-3 py-2 text-foreground sm:text-sm">
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" disabled={isRefining} onClick={async () => {
                            if (!editData.description.trim()) return;
                            setIsRefining(true);
                            try {
                                // Send raw JSON string body (curl example uses a raw string payload). Use absolute URL so it hits the AI service directly.
                                const resp = await api.post('/AI/refine-post-text', editData.description);
                                const refined = resp?.data?.refinedText ?? resp?.data?.text ?? resp?.data;
                                if (typeof refined === 'string' && refined.trim()) setEditData(prev => ({ ...prev, description: refined.trim() }));
                            } catch (err) {
                                console.error('AI refine failed', err);
                            } finally {
                                setIsRefining(false);
                            }
                        }} className="px-3 py-1 rounded border text-sm">{isRefining ? 'AI…' : 'Refine'}</button>
                        <button type="submit" disabled={isSaving} className="px-3 py-1 rounded bg-foreground text-background text-sm">{isSaving ? 'Saving...' : 'Save'}</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 rounded border text-sm">Cancel</button>
                    </div>
                </form>
            )}

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
                <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments?.length || 0}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto">
                    <Share2 className="h-4 w-4" />
                </button>
            </div>
            <CommentsModal open={showComments} onClose={() => setShowComments(false)} postId={post.postId} initialComments={post.comments} />
        </div>
    );
}
