import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Users, Shield, User, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 md:pb-0">
            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
                <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                    RefConnect
                </Link>

                <nav className="flex items-center gap-6">
                    <Link to="/" className={cn("text-sm font-medium transition-colors hover:text-primary", isActive('/') ? "text-primary" : "text-muted-foreground")}>Acasă</Link>
                    <Link to="/search" className={cn("text-sm font-medium transition-colors hover:text-primary", isActive('/search') ? "text-primary" : "text-muted-foreground")}>Caută</Link>
                    {user && (
                        <>
                            <Link to="/matches" className={cn("text-sm font-medium transition-colors hover:text-primary", isActive('/matches') ? "text-primary" : "text-muted-foreground")}>Meciuri</Link>
                            <Link to="/delegations" className={cn("text-sm font-medium transition-colors hover:text-primary", isActive('/delegations') ? "text-primary" : "text-muted-foreground")}>Delegări</Link>
                            <Link to="/groups" className={cn("text-sm font-medium transition-colors hover:text-primary", isActive('/groups') ? "text-primary" : "text-muted-foreground")}>Grupuri</Link>
                        </>
                    )}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className={cn("text-sm font-medium transition-colors hover:text-primary", isActive('/admin') ? "text-primary" : "text-muted-foreground")}>Admin</Link>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Link to="/profile" className="flex items-center gap-2">
                            <span className="text-sm font-medium hidden md:block">{user.name}</span>
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <User className="h-4 w-4" />}
                            </div>
                        </Link>
                    ) : (
                        <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                            Conectează-te
                        </Link>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-2xl px-4 py-6">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around items-center p-3 z-50 safe-area-bottom">
                <Link to="/" className={cn("flex flex-col items-center gap-1", isActive('/') ? "text-primary" : "text-muted-foreground")}>
                    <Home className="h-6 w-6" />
                    <span className="text-[10px]">Acasă</span>
                </Link>
                <Link to="/search" className={cn("flex flex-col items-center gap-1", isActive('/search') ? "text-primary" : "text-muted-foreground")}>
                    <Search className="h-6 w-6" />
                    <span className="text-[10px]">Caută</span>
                </Link>
                {user ? (
                    <>
                        <Link to="/groups" className={cn("flex flex-col items-center gap-1", isActive('/groups') ? "text-primary" : "text-muted-foreground")}>
                            <Users className="h-6 w-6" />
                            <span className="text-[10px]">Grupuri</span>
                        </Link>
                        <Link to="/profile" className={cn("flex flex-col items-center gap-1", isActive('/profile') ? "text-primary" : "text-muted-foreground")}>
                            <User className="h-6 w-6" />
                            <span className="text-[10px]">Profil</span>
                        </Link>
                    </>
                ) : (
                    <Link to="/login" className={cn("flex flex-col items-center gap-1", isActive('/login') ? "text-primary" : "text-muted-foreground")}>
                        <User className="h-6 w-6" />
                        <span className="text-[10px]">Conectează-te</span>
                    </Link>
                )}
            </nav>
        </div>
    );
};
