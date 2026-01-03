import React, { useState } from 'react';
import { Search as SearchIcon, UserPlus, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchUsers() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock search results
    const allUsers = [
        { id: 1, name: 'Alice Smith', role: 'referee', bio: 'FIFA Assistant Referee' },
        { id: 2, name: 'Bob Johnson', role: 'referee', bio: 'Regional Referee' },
        { id: 3, name: 'Charlie Brown', role: 'visitor', bio: 'Just watching' },
    ];

    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-full border border-input bg-secondary/50 py-2.5 pl-10 pr-4 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background transition-colors"
                    placeholder="Search referees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="space-y-2">
                <h2 className="text-sm font-semibold text-muted-foreground px-1">
                    {searchTerm ? 'Results' : 'Suggested'}
                </h2>

                <div className="flex flex-col gap-2">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <Link to={`/profile/${user.id}`} className="font-medium hover:underline text-sm block">
                                        {user.name}
                                    </Link>
                                    <span className="text-xs text-muted-foreground lowercase">{user.role}</span>
                                </div>
                            </div>
                            <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                                <UserPlus className="h-4 w-4" />
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
