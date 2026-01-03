import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Users, FileText, MessageSquare, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'groups'>('users');

    // Mock Data - moved to top level
    const [users, setUsers] = useState([
        { id: 1, name: 'Bad User', role: 'visitor', reports: 5 },
        { id: 2, name: 'John Doe', role: 'referee', reports: 0 },
    ]);

    const [posts, setPosts] = useState([
        { id: 1, author: 'Bad User', content: 'Inappropriate content here...', reports: 3 },
        { id: 2, author: 'John Doe', content: 'Great game today!', reports: 0 },
    ]);

    const [groups, setGroups] = useState([
        { id: 1, name: 'Spam Group', members: 2, reports: 10 },
        { id: 2, name: 'Premier League', members: 120, reports: 0 },
    ]);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    if (user?.role !== 'admin') {
        return null;
    }

    const handleDelete = (type: 'user' | 'post' | 'group', id: number) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            if (type === 'user') setUsers(users.filter(u => u.id !== id));
            if (type === 'post') setPosts(posts.filter(p => p.id !== id));
            if (type === 'group') setGroups(groups.filter(g => g.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-red-600">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage users and content.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center">
                    <Users className="h-6 w-6 text-primary mb-2" />
                    <span className="text-2xl font-bold">{users.length}</span>
                    <span className="text-xs text-muted-foreground">Users</span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center">
                    <FileText className="h-6 w-6 text-primary mb-2" />
                    <span className="text-2xl font-bold">{posts.length}</span>
                    <span className="text-xs text-muted-foreground">Posts</span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center">
                    <MessageSquare className="h-6 w-6 text-primary mb-2" />
                    <span className="text-2xl font-bold">{groups.length}</span>
                    <span className="text-xs text-muted-foreground">Groups</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Posts
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'groups' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                    Groups
                </button>
            </div>

            {/* Lists */}
            <div className="space-y-2">
                {activeTab === 'users' && users.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                        <div className="flex flex-col">
                            <h3 className="font-medium">{u.name}</h3>
                            <span className="text-xs text-muted-foreground">{u.role} • {u.reports} reports</span>
                        </div>
                        <button onClick={() => handleDelete('user', u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {activeTab === 'posts' && posts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                        <div className="flex flex-col max-w-[80%]">
                            <h3 className="font-medium text-sm truncate">{p.content}</h3>
                            <span className="text-xs text-muted-foreground">by {p.author} • {p.reports} reports</span>
                        </div>
                        <button onClick={() => handleDelete('post', p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {activeTab === 'groups' && groups.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                        <div className="flex flex-col">
                            <h3 className="font-medium">{g.name}</h3>
                            <span className="text-xs text-muted-foreground">{g.members} members • {g.reports} reports</span>
                        </div>
                        <button onClick={() => handleDelete('group', g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
