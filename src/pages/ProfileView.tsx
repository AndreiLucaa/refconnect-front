import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { usePost } from '../context/PostContext';
import { Lock } from 'lucide-react';

export default function ProfileView() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<any | null>(null);
    const [extended, setExtended] = useState<any | null>(null);
    const { isPostLiked } = usePost();
    const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
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
                        console.error('ProfileView: extended profile fetch forbidden, trying basic', err?.response?.status, err?.response?.data);
                       
                        
                       
                        return;
                    }
                    const basic = await api.get(`/profiles/${id}`);
                    if (!mounted) return;
                    setProfile(basic.data);
                    return;


                    // other errors fallthrough
                    throw err;
                }
            } catch (err: any) {
                console.error('Failed to fetch profile view', err);
                if (!mounted) return;
                setError(err?.message || 'Failed to load');
            } finally {
                if (!mounted) return;
                setIsLoading(false);
            }
        };
        fetchProfile();
        return () => { mounted = false; };
    }, [id]);

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

    if (!id) return <div className="p-8">No user specified</div>;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">Loading profile...</div>
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

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border">
                    {profile.profileImageUrl ? (
                        <img src={profile.profileImageUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="text-muted-foreground">{displayName.charAt(0)}</div>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    <div className="text-sm text-muted-foreground">{profile.userName}</div>
                </div>
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
                    <div className="p-4 text-muted-foreground">No posts yet.</div>
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
