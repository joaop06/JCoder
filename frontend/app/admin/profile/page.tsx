'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { UsersService } from '@/services/users.service';
import { User } from '@/types/entities/user.entity';
import { TableSkeleton } from '@/components/ui';

export default function ProfileManagementPage() {
    const router = useRouter();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        router.push('/');
    }, [router]);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/login');
            return;
        }
        setIsAuthenticated(true);
        setCheckingAuth(false);
    }, [router]);

    const loadUserProfile = useCallback(() => {
        setLoading(true);
        try {
            const userData = UsersService.getUserStorage();
            if (!userData) {
                toast.error('Failed to load profile. Please try again.');
                handleLogout();
                return;
            }
            setUser(userData);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err: any) {
            toast.error('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [toast, handleLogout]);

    useEffect(() => {
        if (!isAuthenticated) return;
        loadUserProfile();
    }, [isAuthenticated, loadUserProfile]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSaveProfile = useCallback(async () => {
        if (!user) return;

        // Validate password change if attempting to change password
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                toast.error('Current password is required to set a new password.');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('New password and confirmation do not match.');
                return;
            }
            if (formData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters long.');
                return;
            }
        }

        setIsSaving(true);
        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const updatedUser = await UsersService.updateProfile(updateData);
            setUser(updatedUser);
            setIsEditing(false);

            // Update form with new values and clear password fields
            setFormData({
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            toast.success('Profile updated successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [user, formData, toast]);

    const handleCancelEdit = useCallback(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        }
        setIsEditing(false);
    }, [user]);

    if (checkingAuth || !isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header isAdmin={true} onLogout={handleLogout} />
                <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <div className="h-10 w-64 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 w-96 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                        </div>
                        <div className="bg-jcoder-card border border-jcoder rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 animate-pulse"></div>
                            <div className="px-8 pb-8">
                                <div className="flex items-end gap-4 -mt-16 mb-8">
                                    <div className="w-32 h-32 bg-jcoder-secondary border-4 border-jcoder-card rounded-full animate-pulse"></div>
                                    <div className="mb-4">
                                        <div className="h-8 w-48 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                                        <div className="h-4 w-64 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <TableSkeleton />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header isAdmin={true} onLogout={handleLogout} />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
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
                            <li className="text-jcoder-foreground font-medium">Profile</li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-jcoder-foreground mb-2">Profile Management</h1>
                        <p className="text-jcoder-muted">Manage your administrator profile and settings</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-jcoder-card border border-jcoder rounded-lg overflow-hidden">
                        {/* Header with Avatar */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32"></div>
                        <div className="px-8 pb-8">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-8">
                                <div className="flex items-end gap-4">
                                    <div className="w-32 h-32 bg-jcoder-card border-4 border-jcoder-card rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                                        <span className="text-white font-bold text-4xl">
                                            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-bold text-jcoder-foreground">{user?.name}</h2>
                                        <p className="text-jcoder-muted">{user?.email}</p>
                                    </div>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Profile Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">Account Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                Full Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                    placeholder="Your full name"
                                                />
                                            ) : (
                                                <p className="text-jcoder-foreground">{user?.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                Email Address
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                    placeholder="your@email.com"
                                                />
                                            ) : (
                                                <p className="text-jcoder-foreground">{user?.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Change Section (only when editing) */}
                                {isEditing && (
                                    <div className="pt-6 border-t border-jcoder">
                                        <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">Change Password</h3>
                                        <p className="text-sm text-jcoder-muted mb-4">Leave blank if you don't want to change your password</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                    placeholder="Enter current password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                    placeholder="Enter new password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons (when editing) */}
                                {isEditing && (
                                    <div className="pt-6 border-t border-jcoder flex items-center justify-end gap-4">
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            className="px-6 py-2 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="inline-flex items-center gap-2 px-6 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Account Details (when not editing) */}
                                {!isEditing && (
                                    <div className="pt-6 border-t border-jcoder">
                                        <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">Account Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-jcoder-secondary rounded-lg">
                                                <p className="text-sm text-jcoder-muted mb-1">Account Created</p>
                                                <p className="text-jcoder-foreground font-medium">
                                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-jcoder-secondary rounded-lg">
                                                <p className="text-sm text-jcoder-muted mb-1">Last Updated</p>
                                                <p className="text-jcoder-foreground font-medium">
                                                    {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

