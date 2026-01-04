import React, { createContext, useContext, ReactNode } from 'react';
import { api, useAuth } from './AuthContext';
import { Follow, FollowRequestDto } from '../types';

interface FollowContextType {
    followUser: (userId: string) => Promise<boolean>;
    sendFollowRequest: (userId: string) => Promise<boolean>;
    unfollowUser: (userId: string) => Promise<boolean>;
    cancelFollowRequest: (userId: string) => Promise<boolean>;
    checkFollowStatus: (userId: string) => Promise<'following' | 'requested' | 'not_following'>;
    acceptFollowRequest: (requesterId: string, followRequestId?: string) => Promise<boolean>;
    rejectFollowRequest: (requesterId: string, followRequestId?: string) => Promise<boolean>;
    getFollowers: (userId: string) => Promise<Follow[]>;
    getFollowing: (userId: string) => Promise<Follow[]>;
    getPendingRequests: () => Promise<FollowRequestDto[]>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const checkFollowStatus = async (userId: string): Promise<'following' | 'requested' | 'not_following'> => {
        if (!user) return 'not_following';
        try {
            // Backend does not export a specific status endpoint. 
            // We check our 'following' list (people I follow).
            // We assume getFollowing works (from another controller perhaps).
            const followingList = await getFollowing(user.id);
            const isFollowing = followingList.some(f => f.followingId === userId || f.following?.id === userId);

            if (isFollowing) return 'following';

            // We cannot easily check 'requested' without a GetSentRequests endpoint.
            // If the UI tracks it, good. If not, we might report 'not_following'.
            // However, we can try to rely on local state if we just sent it?
            // For now, return 'not_following' to be safe, or we could potentially check pending REQUESTS (incoming) 
            // but we need OUTGOING requests to know if *I* requested *THEM*.
            // Since we don't have that endpoint, 'not_following' is the only safe fallback unless we store state.
            return 'not_following';
        } catch (error) {
            console.warn('Failed to deduce follow status', error);
            return 'not_following';
        }
    };

    const followUser = async (userId: string) => {
        if (!user) return false;
        try {
            // POST api/Follows [FromBody] Follow
            // Follow entity usually needs: FollowerId, FollowingId, FollowedAt.
            // We follow strict casing if backend expects capitalized, but usually JS is camelCase -> C# PascalCase mapping.
            await api.post(`/Follows`, {
                followerId: user.id,
                followingId: userId,
                followedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Failed to follow user', error);
            throw error;
        }
    };

    const sendFollowRequest = async (userId: string) => {
        if (!user) return false;
        try {
            // POST api/FollowRequests [FromBody] FollowRequestDto
            // [Required]: FollowRequestId, FollowerId, FollowingId, RequestedAt
            const payload: FollowRequestDto = {
                followRequestId: crypto.randomUUID ? crypto.randomUUID() : 'req-' + Date.now(),
                followerId: user.id,
                followingId: userId,
                requestedAt: new Date()
            };
            await api.post(`/FollowRequests`, payload);
            return true;
        } catch (error) {
            console.error('Failed to send follow request', error);
            throw error;
        }
    };

    const unfollowUser = async (userId: string) => {
        if (!user) return false;
        try {
            // DELETE api/Follows [FromBody] Follow
            await api.delete(`/Follows`, {
                data: {
                    followerId: user.id,
                    followingId: userId,
                    followedAt: new Date().toISOString()
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to unfollow user', error);
            throw error;
        }
    };

    const cancelFollowRequest = async (userId: string) => {
        if (!user) return false;
        try {
            // DELETE api/FollowRequests [FromBody] FollowRequestDto
            const payload: FollowRequestDto = {
                followRequestId: crypto.randomUUID ? crypto.randomUUID() : 'cancel-' + Date.now(), // ID required by DTO even for delete? Usually yes for validation
                followerId: user.id,
                followingId: userId,
                requestedAt: new Date()
            };
            await api.delete(`/FollowRequests`, {
                data: payload
            });
            return true;
        } catch (error) {
            console.error('Failed to cancel follow request', error);
            throw error;
        }
    };

    const acceptFollowRequest = async (requesterId: string, followRequestId?: string) => {
        if (!user) return false;
        try {
            // POST api/FollowRequests/Accept [FromBody] FollowRequestDto
            // Requester is the Follower. I am the Following.
            const payload: FollowRequestDto = {
                followRequestId: followRequestId || (crypto.randomUUID ? crypto.randomUUID() : 'accept-' + Date.now()),
                followerId: requesterId,
                followingId: user.id,
                requestedAt: new Date()
            };
            await api.post(`/FollowRequests/Accept`, payload);
            return true;
        } catch (error) {
            console.error('Failed to accept follow request', error);
            return false;
        }
    };

    const rejectFollowRequest = async (requesterId: string, followRequestId?: string) => {
        if (!user) return false;
        try {
            // POST api/FollowRequests/Decline [FromBody] FollowRequestDto
            const payload: FollowRequestDto = {
                followRequestId: followRequestId || (crypto.randomUUID ? crypto.randomUUID() : 'reject-' + Date.now()),
                followerId: requesterId,
                followingId: user.id,
                requestedAt: new Date()
            };
            await api.post(`/FollowRequests/Decline`, payload);
            return true;
        } catch (error) {
            console.error('Failed to reject follow request', error);
            return false;
        }
    };

    const getFollowers = async (userId: string) => {
        try {
            // Check if backend exposes this. Standard might be related entries.
            // The prompt didn't explicitly give GetFollowers controller code, but implied context.
            // Keeping existing path.
            const response = await api.get<Follow[]>(`/follow/${userId}/followers`);
            return response.data;
        } catch (error) {
            console.error('Failed to get followers', error);
            return [];
        }
    };

    const getFollowing = async (userId: string) => {
        try {
            const response = await api.get<Follow[]>(`/follow/${userId}/following`);
            return response.data;
        } catch (error) {
            console.error('Failed to get following', error);
            return [];
        }
    };

    const getPendingRequests = async () => {
        try {
            // Matches provided controller: GET: api/FollowRequests/Pending
            const response = await api.get<FollowRequestDto[]>(`/FollowRequests/Pending`);
            return response.data;
        } catch (error) {
            console.error('Failed to get pending requests', error);
            return [];
        }
    }

    return (
        <FollowContext.Provider value={{
            followUser,
            sendFollowRequest,
            unfollowUser,
            cancelFollowRequest,
            checkFollowStatus,
            acceptFollowRequest,
            rejectFollowRequest,
            getFollowers,
            getFollowing,
            getPendingRequests
        }}>
            {children}
        </FollowContext.Provider>
    );
};

export const useFollow = () => {
    const context = useContext(FollowContext);
    if (context === undefined) {
        throw new Error('useFollow must be used within a FollowProvider');
    }
    return context;
};
