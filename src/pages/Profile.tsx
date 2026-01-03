import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Camera, Grid, Lock, UserPlus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'posts' | 'info'>('posts');

    // Mock data for profile
    const isOwnProfile = true; // In real app, this depends on URL param vs auth user
    const profileUser = user || {
        name: 'Visitor',
        role: 'visitor',
        bio: 'Just visiting',
        isPrivate: false,
        avatarUrl: null
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Lock className="h-12 w-12 mb-4" />
                <p>Please login to view profiles.</p>
                <Link to="/login" className="mt-4 text-primary hover:underline">Login</Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-background shadow-sm">
                        {profileUser.avatarUrl ? (
                            <img src={profileUser.avatarUrl} alt={profileUser.name} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-12 w-12 text-muted-foreground" />
                        )}
                    </div>
                    {isOwnProfile && (
                        <Link to="/profile/edit" className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:opacity-90">
                            <Settings className="h-4 w-4" />
                        </Link>
                    )}
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                    <p className="text-muted-foreground capitalize">{profileUser.role}</p>
                </div>

                <div className="flex gap-4 text-sm w-full justify-center">
                    <div className="flex flex-col items-center">
                        <span className="font-bold">128</span>
                        <span className="text-muted-foreground">Posts</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold">452</span>
                        <span className="text-muted-foreground">Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-bold">321</span>
                        <span className="text-muted-foreground">Following</span>
                    </div>
                </div>

                {!isOwnProfile && (
                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:opacity-90">
                        <UserPlus className="h-4 w-4" />
                        Follow
                    </button>
                )}
            </div>

            {/* Bio */}
            <div className="bg-card border border-border rounded-lg p-4 text-sm">
                <p>{profileUser.bio || "No description available."}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'posts' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Grid className="h-4 w-4 mx-auto mb-1" />
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <FileText className="h-4 w-4 mx-auto mb-1" />
                    Info
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px]">
                {activeTab === 'posts' ? (
                    <div className="grid grid-cols-3 gap-1">
                        {/* Mock Grid */}
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-square bg-secondary rounded-sm hover:opacity-90 cursor-pointer" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex justify-between border-b border-border pb-2">
                            <span>Joined</span>
                            <span className="text-foreground">Dec 2025</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                            <span>Visibility</span>
                            <span className="text-foreground">{profileUser.isPrivate ? 'Private' : 'Public'}</span>
                        </div>
                        {/* Match stats could go here for referees */}
                    </div>
                )}
            </div>
        </div>
    );
}
