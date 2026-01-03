import React from 'react';
import PostCard from './PostCard';

const MOCK_POSTS = [
    {
        id: 1,
        author: {
            id: 1,
            name: 'Sarah Connor',
            role: 'Referee',
            avatarUrl: 'https://i.pravatar.cc/150?u=1'
        },
        content: 'Great match today! The intensity was high but fair play prevailed. #RefereeLife',
        timestamp: '2h ago',
        likes: 24,
        comments: 5
    },
    {
        id: 2,
        author: {
            id: 2,
            name: 'Mike Dean',
            role: 'Admin',
            avatarUrl: 'https://i.pravatar.cc/150?u=2'
        },
        content: 'Reminder: Monthly referee meeting is scheduled for next Friday. Attendance is mandatory for newly promoted officials.',
        timestamp: '5h ago',
        likes: 56,
        comments: 12
    },
    {
        id: 3,
        author: {
            id: 3,
            name: 'John Doe',
            role: 'Referee',
            avatarUrl: 'https://i.pravatar.cc/150?u=3'
        },
        content: 'Anyone available to delegate for a U16 match this Saturday? DM me.',
        timestamp: '1d ago',
        likes: 8,
        comments: 20
    }
];

export default function Feed() {
    return (
        <div>
            {MOCK_POSTS.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
