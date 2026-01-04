import React, { createContext, useContext, ReactNode } from 'react';
import { api } from './AuthContext';
import { Follow, FollowRequestDto } from '../types';

interface FollowContextType {
    followUser: (userId: string) => Promise<boolean>;
    sendFollowRequest: (userId: string) => Promise<boolean>;
    unfollowUser: (userId: string) => Promise<boolean>;
    cancelFollowRequest: (userId: string) => Promise<boolean>;
    checkFollowStatus: (userId: string) => Promise<'following' | 'requested' | 'not_following'>;
    acceptFollowRequest: (requesterId: string) => Promise<boolean>;
    rejectFollowRequest: (requesterId: string) => Promise<boolean>;
    getFollowers: (userId: string) => Promise<Follow[]>;
    getFollowing: (userId: string) => Promise<Follow[]>;
    getPendingRequests: () => Promise<FollowRequestDto[]>;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {

    const followUser = async (userId: string) => {
        try {
            await api.post(`/FollowRequests`, { FollowingId: userId });
            return true;
        } catch (error) {
            console.error('Failed to follow user', error);
            throw error;
        }
    };

    const sendFollowRequest = async (userId: string) => {
        try {
            await api.post(`/FollowRequests`, { FollowingId: userId });
            return true;
        } catch (error) {
            console.error('Failed to send follow request', error);
            throw error;
        }
    };

    const unfollowUser = async (userId: string) => {
        try {
            await api.delete(`/FollowRequests/${userId}`);
            return true;
        } catch (error) {
            console.error('Failed to unfollow user', error);
            throw error;
        }
    };

    const cancelFollowRequest = async (userId: string) => {
        try {
            await api.delete(`/FollowRequests/${userId}`);
            return true;
        } catch (error) {
            console.error('Failed to cancel follow request', error);
            throw error;
        }
    };

    const checkFollowStatus = async (userId: string): Promise<'following' | 'requested' | 'not_following'> => {
        try {
            const response = await api.get<{ status: 'following' | 'requested' | 'not_following' }>(`/follow/status/${userId}`);
            return response.data.status;
        } catch (error) {
            // If the endpoint doesn't exist or errors, we might need a fallback or just return not_following
            // For now assuming the endpoint exists as per plan
            console.warn('Failed to check follow status, defaulting to not_following', error);
            return 'not_following';
        }
    };

    const acceptFollowRequest = async (requesterId: string) => {
        try {
            await api.post(`/FollowRequests/Accept`, { followerId: requesterId });
            return true;
        } catch (error) {
            console.error('Failed to accept follow request', error);
            return false;
        }
    };

    const rejectFollowRequest = async (requesterId: string) => {
        try {
            await api.post(`/FollowRequests/Decline`, { followerId: requesterId });
            return true;
        } catch (error) {
            console.error('Failed to reject follow request', error);
            return false;
        }
    };

    const getFollowers = async (userId: string) => {
        try {
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
