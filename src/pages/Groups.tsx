import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Search } from 'lucide-react';

export default function Groups() {
    const groups = [
        { id: 1, name: 'Premier League Refs', members: 124, description: 'Discussion for PL officials.' },
        { id: 2, name: 'London FA', members: 56, description: 'Updates and match info for London area.' },
        { id: 3, name: 'Fitness Training', members: 89, description: 'Weekly training plans and meetups.' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
                <Link to="/groups/create" className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 transition-opacity">
                    <Plus className="h-5 w-5" />
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search groups..."
                    className="w-full bg-secondary/50 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="flex flex-col gap-3">
                {groups.map(group => (
                    <Link key={group.id} to={`/groups/${group.id}`} className="block bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">{group.name}</h3>
                            </div>
                            <span className="text-xs text-muted-foreground">{group.members} members</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
