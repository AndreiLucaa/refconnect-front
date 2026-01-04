import React, { useEffect, useState } from 'react';
import { useFollow } from '../context/FollowContext';
import { useAuth, api } from '../context/AuthContext';
import { normalizeAssetUrl } from '../lib/utils';
import { Link } from 'react-router-dom';
import { User, Check, X, Bell } from 'lucide-react';

export default function Notifications() {
    const { user } = useAuth();
    const { getPendingRequests, acceptFollowRequest, rejectFollowRequest } = useFollow();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchRequests = async () => {
            try {
                const data = await getPendingRequests();

                // Fetch user details for each request to ensure we have names/avatars
                const enrichedData = await Promise.all(data.map(async (req: any) => {
                    // If we already have user info, use it
                    if (req.follower || req.user) return req;

                    try {
                        // Fetch profile for the follower
                        const profileRes = await api.get(`/profiles/${req.followerId}`);
                        return { ...req, follower: profileRes.data };
                    } catch (e) {
                        console.error(`Failed to fetch profile for ${req.followerId}`, e);
                        return req;
                    }
                }));

                if (mounted) {
                    setRequests(enrichedData);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        fetchRequests();
        return () => { mounted = false; };
    }, [getPendingRequests]);

    const handleAccept = async (requesterId: string, requestId?: string) => {
        // Must pass requestId to satisfy strict backend DTO [Required]
        const success = await acceptFollowRequest(requesterId, requestId);
        if (success) {
            setRequests(prev => prev.filter(r => r.followerId !== requesterId));
        }
    };

    const handleReject = async (requesterId: string, requestId?: string) => {
        const success = await rejectFollowRequest(requesterId, requestId);
        if (success) {
            setRequests(prev => prev.filter(r => r.followerId !== requesterId));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <Bell className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Notificări</h1>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="font-semibold text-lg mb-4">Cereri de urmărire</h2>
                    {requests.length === 0 ? (
                        <div className="text-muted-foreground italic text-sm py-4 bg-card rounded-lg border border-border px-4">
                            Nu ai cereri noi.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(req => {
                                // Extract user info. 
                                // DTO: FollowRequestDto { followRequestId, followerId, followingId, requestedAt }
                                // It MIGHT NOT have the user object expanded depending on backend JSON serialization settings.
                                // If backend only returns DTO fields, we only have IDs. 
                                // We might need to fetch user profile OR assume backend expands `Follower` navigation property if it exists.
                                // The User's controller code returns `Ok(requests)`. `requests` comes from `_followRequestService.GetPendingFollowRequestsAsync`.
                                // Let's hope it includes the User object. If not, we show generic info or just ID?
                                // Best effort: Check for `followerRequest` or `follower` property.

                                const u = (req as any).followerRequest || (req as any).follower || (req as any).user;
                                // Fallback if no user object: Just display "User {id}" or similar?
                                // That would be bad UI. 
                                // Let's try to rely on what was there before or hope for expansion.

                                const displayName = u ? (u.firstName ? `${u.firstName} ${u.lastName}` : u.userName) : `Utilizator`;
                                const username = u?.userName || 'utilizator';
                                const imageUrl = u?.profileImageUrl;
                                const requesterId = req.followerId;
                                const requestId = req.followRequestId;

                                return (
                                    <div key={requestId || requesterId} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Link to={`/profile/${requesterId}`} className="shrink-0">
                                                <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden border border-border">
                                                    {imageUrl ? (
                                                        <img src={normalizeAssetUrl(imageUrl)} alt={displayName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <User className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                            <div className="min-w-0">
                                                <Link to={`/profile/${requesterId}`} className="font-semibold hover:underline truncate block">
                                                    {displayName}
                                                </Link>
                                                <div className="text-sm text-muted-foreground truncate">@{username} vrea să te urmărească</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <button
                                                onClick={() => handleAccept(requesterId, requestId)}
                                                className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                                                title="Acceptă"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(requesterId, requestId)}
                                                className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                title="Refuză"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
