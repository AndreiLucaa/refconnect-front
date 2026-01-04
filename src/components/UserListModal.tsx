import React from 'react';
import { X, User, Check, X as XIcon } from 'lucide-react';
import { normalizeAssetUrl } from '../lib/utils';
import { Link } from 'react-router-dom';

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: any[];
    type: 'followers' | 'following' | 'requests';
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onRemove?: (id: string) => void;
    isLoading?: boolean;
}

export default function UserListModal({
    isOpen,
    onClose,
    title,
    users,
    type,
    onAccept,
    onReject,
    onRemove,
    isLoading
}: UserListModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-md rounded-lg shadow-lg border border-border flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="font-semibold text-lg">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No users found.</div>
                    ) : (
                        users.map((user) => {
                            // Handle different DTO shapes. 
                            // Generic UserDto or FollowRequestDto might be passed.
                            // For Follow/Following lists, the shape is usually { follower: User, following: User } or just User
                            // For Requests, it might be { followerRequest: User, ... }
                            // Let's normalize inside the loop casually or expect the parent to map it?
                            // Better: Parent should pass a normalized list of { id, name, username, image, ... } OR we handle "user" object here.
                            // Given the codebase, let's assume the passed `users` array contains objects that HAVE a user property or ARE the user.

                            const validUser = user.follower || user.following || user.followerRequest || user;
                            const userId = validUser.id || validUser.userId;
                            const displayName = validUser.firstName ? `${validUser.firstName} ${validUser.lastName}` : validUser.userName;
                            const username = validUser.userName;
                            const imageUrl = validUser.profileImageUrl;

                            return (
                                <div key={userId} className="flex items-center justify-between gap-3">
                                    <Link to={`/profile/${userId}`} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden shrink-0 border border-border">
                                            {imageUrl ? (
                                                <img src={normalizeAssetUrl(imageUrl)} alt={displayName} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="truncate">
                                            <div className="font-medium text-sm truncate">{displayName}</div>
                                            <div className="text-xs text-muted-foreground truncate">@{username}</div>
                                        </div>
                                    </Link>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {type === 'requests' && onAccept && onReject && (
                                            <>
                                                <button
                                                    onClick={() => onAccept(userId)}
                                                    className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                                                    title="Accept"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onReject(userId)}
                                                    className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                    title="Decline"
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                        {/* Future extensibility: Remove follower button */}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
