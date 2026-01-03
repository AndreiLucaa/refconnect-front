import React from 'react';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Home Feed</h1>
                <p className="text-sm text-muted-foreground">Latest updates from your network.</p>
            </div>

            {user && <CreatePost />}

            <Feed />
        </div>
    );
}
