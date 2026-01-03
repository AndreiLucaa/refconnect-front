import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, UserPlus, CheckCircle, Shield } from 'lucide-react';

export default function Matches() {
    const { user } = useAuth();

    // Mock Matches
    const [matches, setMatches] = useState([
        {
            id: 1,
            home: 'Red Lions FC',
            away: 'Blue Birds United',
            date: '2025-06-15',
            time: '14:00',
            location: 'Wembley Stadium',
            referees: [
                { id: 1, name: 'Howard Webb', role: 'Main' },
                { id: 2, name: 'Mike Dean', role: 'Assistant' }
            ],
            needed: 4
        },
        {
            id: 2,
            home: 'City Tech',
            away: 'University Rangers',
            date: '2025-06-16',
            time: '16:30',
            location: 'City Ground',
            referees: [],
            needed: 4
        }
    ]);

    const isAdmin = user?.role === 'admin';

    const handleDelegate = (matchId: number) => {
        // Mock delegation logic
        setMatches(prev => prev.map(m => {
            if (m.id === matchId && m.referees.length < m.needed) {
                const newRef = { id: 99, name: 'Delegated Ref', role: 'Assistant' }; // Mock ref
                const updatedRefs = [...m.referees, newRef];

                // Auto group creation check
                if (updatedRefs.length === 4) {
                    console.log(`Match ${m.id} is full! Auto-creating private group...`);
                    alert(`Match full! Private group for "${m.home} vs ${m.away}" created.`);
                }

                return { ...m, referees: updatedRefs };
            }
            return m;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
                <p className="text-sm text-muted-foreground">Upcoming fixtures and delegations.</p>
            </div>

            <div className="space-y-4">
                {matches.map(match => (
                    <div key={match.id} className="bg-card border border-border rounded-lg p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg mb-1">{match.home} vs {match.away}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        {match.date} at {match.time}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        {match.location}
                                    </div>
                                </div>
                            </div>
                            {match.referees.length === match.needed && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Full
                                </span>
                            )}
                        </div>

                        <div className="border-t border-border pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Delegated Officials ({match.referees.length}/{match.needed})</span>
                                {isAdmin && match.referees.length < match.needed && (
                                    <button
                                        onClick={() => handleDelegate(match.id)}
                                        className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90"
                                    >
                                        <UserPlus className="h-3 w-3" /> Delegate
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {match.referees.length > 0 ? match.referees.map((ref, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1 text-sm">
                                        <Shield className="h-3 w-3 text-muted-foreground" />
                                        <span>{ref.name}</span>
                                    </div>
                                )) : (
                                    <span className="text-sm text-muted-foreground italic">No referees delegated yet.</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
