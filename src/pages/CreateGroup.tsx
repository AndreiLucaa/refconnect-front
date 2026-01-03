import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users } from 'lucide-react';

export default function CreateGroup() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API call mock
        console.log('Creating group', { name, description });
        navigate('/groups');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <button onClick={() => navigate('/groups')} className="p-2 hover:bg-secondary rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold">Create Group</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-secondary rounded-xl flex items-center justify-center">
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Group Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="e.g. Saturday League Refs"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="What is this group about?"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90"
                >
                    Create Group
                </button>
            </form>
        </div>
    );
}
