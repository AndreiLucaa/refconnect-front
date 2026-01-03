import React from 'react';
import PostCard from './PostCard';

const MOCK_POSTS = [
    {
        id: 1,
        author: {
            id: 1,
            name: 'Danciu Valentin',
            role: 'Referee',
            avatarUrl: 'https://scontent.fotp3-2.fna.fbcdn.net/v/t39.30808-6/489807719_1765965260629835_1816407754487707967_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=CP27hd1QZe8Q7kNvwH9rGA_&_nc_oc=AdmmQCAExH0FvvLZgNcGl8HVrrhUMuLQTyL7lTpowGubx9yp6RagdqFigMN58PbFYHk&_nc_zt=23&_nc_ht=scontent.fotp3-2.fna&_nc_gid=f8pxOD9CPF3VGYP4YWE62w&oh=00_Afrl9ROVTIc04gZQSJBObV0j3QeugNh6iS9w3iC_wUnqjQ&oe=695EC795'
        },
        content: 'Winning starts with training! #RefereeLife',
        timestamp: '2h ago',
        likes: 24,
        comments: 5
    },
    {
        id: 2,
        author: {
            id: 2,
            name: 'Admin Birsan',
            role: 'Admin',
            avatarUrl: 'https://www.frf.ro/wp-content/uploads/2023/06/Marcel-Birsan_Sportpictures.jpg'
        },
        content: 'Amintiri din teren! #Throwback #Referee',
        timestamp: '5h ago',
        likes: 56,
        comments: 12
    },
    {
        id: 3,
        author: {
            id: 3,
            name: 'Neacsu Ionut Traian',
            role: 'Referee',
            avatarUrl: 'https://arenavalceana.ro/wp-content/uploads/2022/02/neacsu-ionut.jpg'
        },
        content: 'Unii cum vor atii cum pot! #europaleague #nottingham #porto',
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
