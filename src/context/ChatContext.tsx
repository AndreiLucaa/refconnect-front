import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from './AuthContext';
import { 
    ChatDto, 
    MessageDto, 
    CreateMessageDto, 
    CreateGroupChatDto,
    UpdateChatDto,
    UpdateMessageDto,
    ChatJoinRequestDto,
    CreateChatJoinRequestDto
} from '../types';

interface ChatContextType {
    chats: ChatDto[];
    allGroupChats: ChatDto[];
    currentChat: ChatDto | null;
    messages: MessageDto[];
    joinRequests: ChatJoinRequestDto[];
    myPendingRequests: ChatJoinRequestDto[];
    isLoading: boolean;
    error: string | null;
    fetchChats: () => Promise<void>;
    fetchAllGroupChats: () => Promise<void>;
    searchGroupChats: (query: string) => Promise<void>;
    fetchMessages: (chatId: string) => Promise<void>;
    sendMessage: (chatId: string, content: string) => Promise<MessageDto | null>;
    updateMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    createGroupChat: (name: string, description: string, userIds: string[]) => Promise<ChatDto | null>;
    updateChat: (chatId: string, name?: string, description?: string) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    requestJoinChat: (chatId: string) => Promise<void>;
    fetchJoinRequestsForOwner: () => Promise<void>;
    fetchJoinRequestsForChat: (chatId: string) => Promise<void>;
    fetchMyPendingRequests: () => Promise<void>;
    acceptJoinRequest: (requestId: string) => Promise<void>;
    declineJoinRequest: (requestId: string) => Promise<void>;
    cancelJoinRequest: (requestId: string) => Promise<void>;
    setCurrentChat: (chat: ChatDto | null) => void;
    clearError: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [chats, setChats] = useState<ChatDto[]>([]);
    const [allGroupChats, setAllGroupChats] = useState<ChatDto[]>([]);
    const [currentChat, setCurrentChat] = useState<ChatDto | null>(null);
    const [messages, setMessages] = useState<MessageDto[]>([]);
    const [joinRequests, setJoinRequests] = useState<ChatJoinRequestDto[]>([]);
    const [myPendingRequests, setMyPendingRequests] = useState<ChatJoinRequestDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    // Fetch all chats for current user
    const fetchChats = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/Chats');
            setChats(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch chats:', err);
            setError('Failed to load chats');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all group chats (for browsing/joining)
    const fetchAllGroupChats = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/Chats/groups');
            setAllGroupChats(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch all group chats:', err);
            setError('Failed to load group chats');
        } finally {
            setIsLoading(false);
        }
    };

    // Search group chats
    const searchGroupChats = async (query: string) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/Chats/groups/search?query=${encodeURIComponent(query)}`);
            setAllGroupChats(response.data || []);
        } catch (err: any) {
            console.error('Failed to search group chats:', err);
            setError('Failed to search group chats');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch messages for a specific chat
    const fetchMessages = async (chatId: string) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/Messages/chat/${chatId}`);
            setMessages(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch messages:', err);
            setError('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    // Send a new message
    const sendMessage = async (chatId: string, content: string): Promise<MessageDto | null> => {
        try {
            const payload: CreateMessageDto = { chatId, content };
            const response = await api.post('/Messages', payload);
            
            if (response.data) {
                setMessages(prev => [...prev, response.data]);
                return response.data;
            }
            return null;
        } catch (err: any) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
            throw err;
        }
    };

    // Update a message
    const updateMessage = async (messageId: string, content: string) => {
        try {
            const payload: UpdateMessageDto = { content };
            await api.put(`/Messages/${messageId}`, payload);
            
            setMessages(prev => prev.map(msg => 
                msg.messageId === messageId 
                    ? { ...msg, content }
                    : msg
            ));
        } catch (err: any) {
            console.error('Failed to update message:', err);
            setError('Failed to update message');
            throw err;
        }
    };

    // Delete a message
    const deleteMessage = async (messageId: string) => {
        try {
            await api.delete(`/Messages/${messageId}`);
            setMessages(prev => prev.filter(msg => msg.messageId !== messageId));
        } catch (err: any) {
            console.error('Failed to delete message:', err);
            setError('Failed to delete message');
            throw err;
        }
    };

    // Create a group chat
    const createGroupChat = async (name: string, description: string, userIds: string[]): Promise<ChatDto | null> => {
        try {
            const payload: CreateGroupChatDto = { 
                groupName: name, 
                description: description || undefined, 
                initialUserIds: userIds 
            };
            console.log('Creating group chat with payload:', JSON.stringify(payload, null, 2));
            const response = await api.post('/Chats/group', payload);
            console.log('Group chat created:', response.data);
            
            if (response.data) {
                setChats(prev => [...prev, response.data]);
                return response.data;
            }
            return null;
        } catch (err: any) {
            console.error('Failed to create group chat:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            setError('Failed to create group chat');
            throw err;
        }
    };

    // Update a chat
    const updateChat = async (chatId: string, name?: string, description?: string) => {
        try {
            const payload: UpdateChatDto = { name, description };
            await api.put(`/Chats/${chatId}`, payload);
            
            setChats(prev => prev.map(chat => 
                chat.chatId === chatId 
                    ? { ...chat, ...(name && { name }), ...(description && { description }) }
                    : chat
            ));
            
            if (currentChat?.chatId === chatId) {
                setCurrentChat(prev => prev ? { ...prev, ...(name && { name }), ...(description && { description }) } : null);
            }
        } catch (err: any) {
            console.error('Failed to update chat:', err);
            setError('Failed to update chat');
            throw err;
        }
    };

    // Delete a chat
    const deleteChat = async (chatId: string) => {
        try {
            await api.delete(`/Chats/${chatId}`);
            setChats(prev => prev.filter(chat => chat.chatId !== chatId));
            
            if (currentChat?.chatId === chatId) {
                setCurrentChat(null);
                setMessages([]);
            }
        } catch (err: any) {
            console.error('Failed to delete chat:', err);
            setError('Failed to delete chat');
            throw err;
        }
    };

    // Request to join a chat
    const requestJoinChat = async (chatId: string) => {
        try {
            const payload: CreateChatJoinRequestDto = { chatId };
            await api.post('/ChatJoinRequests', payload);
        } catch (err: any) {
            console.error('Failed to request join chat:', err);
            setError('Failed to send join request');
            throw err;
        }
    };

    // Fetch join requests for chats you own
    const fetchJoinRequestsForOwner = async () => {
        try {
            const response = await api.get('/ChatJoinRequests/owner');
            setJoinRequests(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch join requests:', err);
        }
    };

    // Fetch join requests for a specific chat
    const fetchJoinRequestsForChat = async (chatId: string) => {
        try {
            const response = await api.get(`/ChatJoinRequests/chat/${chatId}`);
            setJoinRequests(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch join requests for chat:', err);
        }
    };

    // Fetch your own pending requests
    const fetchMyPendingRequests = async () => {
        try {
            const response = await api.get('/ChatJoinRequests/my-requests');
            setMyPendingRequests(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch my pending requests:', err);
        }
    };

    // Accept a join request
    const acceptJoinRequest = async (requestId: string) => {
        try {
            await api.post(`/ChatJoinRequests/${requestId}/accept`);
            setJoinRequests(prev => prev.filter(req => req.chatJoinRequestId !== requestId));
        } catch (err: any) {
            console.error('Failed to accept join request:', err);
            setError('Failed to accept request');
            throw err;
        }
    };

    // Decline a join request
    const declineJoinRequest = async (requestId: string) => {
        try {
            await api.post(`/ChatJoinRequests/${requestId}/decline`);
            setJoinRequests(prev => prev.filter(req => req.chatJoinRequestId !== requestId));
        } catch (err: any) {
            console.error('Failed to decline join request:', err);
            setError('Failed to decline request');
            throw err;
        }
    };

    // Cancel your own pending request
    const cancelJoinRequest = async (requestId: string) => {
        try {
            await api.delete(`/ChatJoinRequests/${requestId}`);
            setMyPendingRequests(prev => prev.filter(req => req.chatJoinRequestId !== requestId));
        } catch (err: any) {
            console.error('Failed to cancel join request:', err);
            setError('Failed to cancel request');
            throw err;
        }
    };

    return (
        <ChatContext.Provider value={{
            chats,
            allGroupChats,
            currentChat,
            messages,
            joinRequests,
            myPendingRequests,
            isLoading,
            error,
            fetchChats,
            fetchAllGroupChats,
            searchGroupChats,
            fetchMessages,
            sendMessage,
            updateMessage,
            deleteMessage,
            createGroupChat,
            updateChat,
            deleteChat,
            requestJoinChat,
            fetchJoinRequestsForOwner,
            fetchJoinRequestsForChat,
            fetchMyPendingRequests,
            acceptJoinRequest,
            declineJoinRequest,
            cancelJoinRequest,
            setCurrentChat,
            clearError
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
