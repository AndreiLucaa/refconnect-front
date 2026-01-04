import React, { useEffect, useState } from 'react';
import { useFollow } from '../context/FollowContext';
import { useAuth } from '../context/AuthContext';
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
                if (mounted) {
                    setRequests(data);
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

    const handleAccept = async (requesterId: string) => {
        const success = await acceptFollowRequest(requesterId);
        if (success) {
            setRequests(prev => prev.filter(r => r.followerId !== requesterId));
        }
    };

    const handleReject = async (requesterId: string) => {
        const success = await rejectFollowRequest(requesterId);
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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <Bell className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            <div className="space-y-6">
                <div>
                    <h2 className="font-semibold text-lg mb-4">Follow Requests</h2>
                    {requests.length === 0 ? (
                        <div className="text-muted-foreground italic text-sm py-4 bg-card rounded-lg border border-border px-4">
                            No pending requests.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(req => {
                                // Request object usually has `followerRequest` which is the User object, or we use `followerId` to fetch?
                                // Assuming the DTO has hydrated user info or we are limited.
                                // The `FollowRequestDto` in types.ts DOES NOT have the nested user object clearly defined in standard DTO,
                                // BUT `FollowRequest` interface does. 
                                // Let's check safely. If no user object, we might display ID or fetch?
                                // Based on previous `UserListModal` logic, we hope the backend sends expanded data or we might need to fetch profile.
                                // To be safe: checks for `followerRequest` object (from type `FollowRequest`). 

                                const u = (req as any).followerRequest || (req as any).follower;
                                const displayName = u ? (u.firstName ? `${u.firstName} ${u.lastName}` : u.userName) : 'Unknown User';
                                const username = u?.userName || 'unknown';
                                const imageUrl = u?.profileImageUrl;
                                const requesterId = req.followerId;

                                return (
                                    <div key={req.followRequestId || requesterId} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border shadow-sm">
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
                                                <div className="text-sm text-muted-foreground truncate">@{username} wants to follow you</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <button
                                                onClick={() => handleAccept(requesterId)}
                                                className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                                                title="Accept"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(requesterId)}
                                                className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                title="Decline"
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

                {/* Placeholder for Recent Activity if backend supports it later */}
                {/* 
                <div>
                     <h2 className="font-semibold text-lg mb-4 text-muted-foreground">Recent Activity</h2>
                </div> 
                */}
            </div>
        </div>
    );
}
