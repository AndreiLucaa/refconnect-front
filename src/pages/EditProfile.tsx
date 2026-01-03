import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '../context/AuthContext';
import { ChevronLeft, Save } from 'lucide-react';

export default function EditProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Initialize with user data or defaults
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        isPrivate: user?.isPrivate || false,
        avatarUrl: user?.avatarUrl || ''
    });

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Check if it's a checkbox - though typescript knows value is string, we cast or check checked
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API update
        setTimeout(() => {
            // Here update context user in real app
            console.log('Saved:', formData);
            setIsLoading(false);
            navigate('/profile');
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-4">
                <button onClick={() => navigate('/profile')} className="p-2 hover:bg-secondary rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold">Edit Profile</h1>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                        {formData.avatarUrl ? (
                            <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-xs text-muted-foreground p-2 text-center">No Image</span>
                        )}
                    </div>
                    <button type="button" className="text-sm text-primary font-medium hover:underline">
                        Change Profile Photo
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                            Display Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                        <div>
                            <span className="block text-sm font-medium">Private Profile</span>
                            <span className="text-xs text-muted-foreground">Only followers can see your posts</span>
                        </div>
                        <input
                            type="checkbox"
                            name="isPrivate"
                            checked={formData.isPrivate}
                            onChange={handleChange}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-foreground text-background py-2.5 rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Saving...' : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
