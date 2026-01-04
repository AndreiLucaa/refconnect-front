import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { normalizeAssetUrl } from '../lib/utils';
import PostCard from '../components/PostCard';
import { usePost } from '../context/PostContext';
import { useFollow } from '../context/FollowContext';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';

export default function ProfileView() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { followUser, sendFollowRequest, unfollowUser, cancelFollowRequest, checkFollowStatus } = useFollow();
    const [profile, setProfile] = useState<any | null>(null);
    const [extended, setExtended] = useState<any | null>(null);
    const { isPostLiked } = usePost();
    const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Follow state
    const [followStatus, setFollowStatus] = useState<'following' | 'requested' | 'not_following' | 'loading'>('loading');
    const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        let mounted = true;

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                // Check follow status first if logged in
                if (user) {
                    checkFollowStatus(id).then(status => {
                        if (mounted) setFollowStatus(status);
                    });
                }

                // Try extended first
                try {
                    const ext = await api.get(`/profiles/${id}/extended`);
                    if (!mounted) return;
                    setExtended(ext.data);
                    setProfile(ext.data);
                    return;
                } catch (err: any) {
                    if (err?.response?.status === 403) {
                        // fallback to basic profile
                        const basic = await api.get(`/profiles/${id}`);
                        if (!mounted) return;
                        setProfile(basic.data);
                        return;
                    }
                    throw err;
                }
            } catch (err: any) {
                console.error('Failed to fetch profile view', err);
                if (!mounted) return;
                setError(err?.message || 'Failed to load');
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };
        fetchProfile();
        return () => { mounted = false; };
    }, [id, user, checkFollowStatus]);

    // When we have profile.posts, pre-check like status for each post
    useEffect(() => {
        let mounted = true;
        const checkLikes = async () => {
            if (!profile?.posts || !Array.isArray(profile.posts)) return;
            const entries = await Promise.all(profile.posts.map(async (p: any) => {
                try {
                    const liked = await isPostLiked(p.postId);
                    return [p.postId, !!liked] as [string, boolean];
                } catch (e) {
                    return [p.postId, false] as [string, boolean];
                }
            }));
            if (!mounted) return;
            const map: Record<string, boolean> = {};
            for (const [k, v] of entries) map[k] = v;
            setLikedMap(map);
        };
        checkLikes();
        return () => { mounted = false; };
    }, [profile?.posts, isPostLiked]);

    const handleFollowClick = async () => {
        if (!id || !profile) return;
        setIsFollowActionLoading(true);
        try {
            if (followStatus === 'following') {
                // Confirm unfollow
                if (window.confirm(`Are you sure you want to unfollow ${profile.userName}?`)) {
                    const success = await unfollowUser(id);
                    if (success) setFollowStatus('not_following');
                }
            } else if (followStatus === 'requested') {
                // Cancel request
                const success = await cancelFollowRequest(id);
                if (success) setFollowStatus('not_following');
            } else {
                // Follow or Request
                if (profile.isProfilePublic) {
                    const success = await followUser(id);
                    if (success) setFollowStatus('following');
                } else {
                    const success = await sendFollowRequest(id);
                    if (success) setFollowStatus('requested');
                }
            }
        } catch (err: any) {
            console.error('Follow action failed', err);
            alert(`Action failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        } finally {
            setIsFollowActionLoading(false);
        }
    };

    // Render helper for the button to keep JSX clean
    function renderFollowButton() {
        if (followStatus === 'following') {
            return (
                <button
                    onClick={handleFollowClick}
                    disabled={isFollowActionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors text-sm font-medium"
                >
                    {isFollowActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                    Following
                </button>
            );
        }
        if (followStatus === 'requested') {
            return (
                <button
                    onClick={handleFollowClick}
                    disabled={isFollowActionLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 text-secondary-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-medium"
                >
                    {isFollowActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                    Requested
                </button>
            );
        }
        return (
            <button
                onClick={handleFollowClick}
                disabled={isFollowActionLoading}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
            >
                {isFollowActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Follow
            </button>
        );
    }

    if (!id) return <div className="p-8">No user specified</div>;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!profile) {
        return <div className="p-4">Profile not found</div>;
    }

    const displayName = profile.firstName || profile.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : profile.userName || 'Unknown';
    const isMe = user?.id === profile.id || user?.id === id;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border shrink-0">
                    {profile.profileImageUrl ? (
                        <img src={normalizeAssetUrl(profile.profileImageUrl)} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="text-muted-foreground font-bold text-2xl">{displayName.charAt(0)}</div>
                    )}
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    <div className="text-sm text-muted-foreground">@{profile.userName || 'username'}</div>
                </div>

                {/* Follow Action Button */}
                {!isMe && (
                    <div>
                        {followStatus === 'loading' ? (
                            <button disabled className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground opacity-50 cursor-wait">
                                ...
                            </button>
                        ) : (
                            renderFollowButton()
                        )}
                    </div>
                )}
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
                <p>{profile.description || profile.bio || 'No description.'}</p>
            </div>

            {extended && (
                <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">More about this user</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Followers</strong><div className="text-muted-foreground">{extended.followersCount ?? '—'}</div></div>
                        <div><strong>Following</strong><div className="text-muted-foreground">{extended.followingCount ?? '—'}</div></div>
                        <div className="col-span-2"><strong>Joined</strong><div className="text-muted-foreground">{extended.createdAt ? new Date(extended.createdAt).toLocaleDateString() : '—'}</div></div>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-lg font-semibold">Posts</h3>
                {profile.posts && profile.posts.length > 0 ? (
                    <div className="space-y-4 mt-3">
                        {profile.posts.map((p: any) => (
                            <PostCard key={p.postId} post={p} initialIsLiked={likedMap[p.postId]} initialLikesCount={(p.likeCount ?? p.likes?.length ?? 0)} />
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-muted-foreground border border-dashed border-border rounded-lg text-center py-8">
                        {profile.isProfilePublic || followStatus === 'following' ? "No posts yet." : "This account is private. Follow to see their posts."}
                    </div>
                )}
            </div>

            <div>
                <Link to={`/profile/${id}/matches`} className="text-sm text-primary hover:underline">View match assignments</Link>
            </div>

            <div className="mt-4">
                <Link to="/" className="text-sm text-primary hover:underline">Back home</Link>
            </div>
        </div>
    );
}
