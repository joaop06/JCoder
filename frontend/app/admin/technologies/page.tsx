'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export default function TechnologiesManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/login');
            return;
        }
        setIsAuthenticated(true);
        setLoading(false);
    }, [router]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        router.push('/');
    }, [router]);

    if (!isAuthenticated || loading) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header isAdmin={true} onLogout={handleLogout} />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <ol className="flex items-center gap-2 text-sm text-jcoder-muted">
                            <li>
                                <button onClick={() => router.push('/admin')} className="hover:text-jcoder-primary transition-colors">
                                    Admin
                                </button>
                            </li>
                            <li>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li className="text-jcoder-foreground font-medium">Technologies</li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-jcoder-foreground">Technologies Management</h1>
                            <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-sm font-semibold rounded-full">
                                Coming Soon
                            </span>
                        </div>
                        <p className="text-jcoder-muted">Manage technologies and tech stack for your portfolio</p>
                    </div>

                    {/* Coming Soon Card */}
                    <div className="bg-jcoder-card border border-jcoder rounded-lg p-12 text-center">
                        <div className="max-w-2xl mx-auto">
                            {/* Icon */}
                            <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold text-jcoder-foreground mb-4">
                                Technologies Feature Coming Soon
                            </h2>

                            {/* Description */}
                            <p className="text-lg text-jcoder-muted mb-8">
                                We're working on an amazing feature to manage your technologies and tech stack.
                                You'll be able to create, organize, and showcase all the technologies you use in your projects.
                            </p>

                            {/* Features List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                                <div className="p-6 bg-jcoder-secondary border border-jcoder rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-jcoder-gradient rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-jcoder-foreground mb-2">Add Technologies</h3>
                                            <p className="text-sm text-jcoder-muted">Create and manage a comprehensive list of technologies you work with</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-jcoder-secondary border border-jcoder rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-jcoder-foreground mb-2">Categorize & Tag</h3>
                                            <p className="text-sm text-jcoder-muted">Organize technologies by categories like Frontend, Backend, DevOps, etc.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-jcoder-secondary border border-jcoder rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-jcoder-foreground mb-2">Custom Icons</h3>
                                            <p className="text-sm text-jcoder-muted">Upload custom icons and logos for each technology</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-jcoder-secondary border border-jcoder rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-jcoder-foreground mb-2">Link to Projects</h3>
                                            <p className="text-sm text-jcoder-muted">Associate technologies with your portfolio applications</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="px-6 py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors font-medium"
                                >
                                    Back to Dashboard
                                </button>
                                <button
                                    onClick={() => router.push('/admin/applications')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                >
                                    <span>Manage Applications</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for Future UI */}
                    <div className="mt-8 p-6 bg-jcoder-secondary border border-dashed border-jcoder rounded-lg">
                        <h3 className="text-lg font-semibold text-jcoder-foreground mb-3">Future Preview</h3>
                        <p className="text-jcoder-muted mb-4">This is where the technologies management table will appear:</p>
                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-8 text-center">
                            <p className="text-jcoder-muted italic">Technologies table with CRUD operations will be displayed here</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

