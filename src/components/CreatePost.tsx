import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePost } from '../context/PostContext';
import { useAIModeration } from '../hooks/useAIModeration';
import { Image, Video, Send, AlertCircle } from 'lucide-react';

export default function CreatePost() {
    const { user } = useAuth();
    const { checkContent, isChecking } = useAIModeration();
    const { createPost, error: postError } = usePost();
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setError(null);

        // AI Check
        const moderationResult = await checkContent(content);
        if (!moderationResult.safe) {
            setError(moderationResult.reason || "Content flagged as inappropriate.");
            return;
        }

        // Create Post via Context
        const newPost = await createPost({
            description: content,
            mediaUrl: '', // TODO: Implement file upload
            mediaType: 'text' // TODO: Detect type
        });

        if (newPost) {
            setContent('');
            // alert("Post published successfully!"); // Optional: show toast or something
        } else {
            setError("Failed to create post. Check console for details.");
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary flex-shrink-0 overflow-hidden">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gray-300" />
                        )}
                    </div>
                    <div className="flex-1">
                        <textarea
                            className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm p-0 placeholder-muted-foreground"
                            rows={3}
                            placeholder="Share your thoughts or match updates..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs mt-2 bg-red-50 p-2 rounded">
                                <AlertCircle className="h-3 w-3" />
                                {error}
                            </div>
                        )}
                        {postError && (
                             <div className="flex items-center gap-2 text-red-500 text-xs mt-2 bg-red-50 p-2 rounded">
                                <AlertCircle className="h-3 w-3" />
                                {postError}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-3 border-t border-border pt-3">
                            <div className="flex gap-2 text-muted-foreground">
                                <button type="button" className="p-1.5 hover:bg-secondary rounded-full transition-colors">
                                    <Image className="h-4 w-4" />
                                </button>
                                <button type="button" className="p-1.5 hover:bg-secondary rounded-full transition-colors">
                                    <Video className="h-4 w-4" />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isChecking || !content.trim()}
                                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isChecking ? 'Checking...' : (
                                    <>
                                        Post <Send className="h-3 w-3" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
