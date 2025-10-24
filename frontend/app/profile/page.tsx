'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { RoleEnum } from '@/types/enums/role.enum';
import { User } from '@/types/entities/user.entity';
import { UsersService } from '@/services/users.service';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/toast/ToastContext';

export default function ProfilePage() {
    const router = useRouter();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
    });

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/login');
            return;
        }
        setIsAuthenticated(true);
    }, [router]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const loadUserData = async () => {
            setLoading(true);
            try {
                const user = UsersService.getUserStorage?.();
                if (user) {
                    setUserData(user);
                    setEditForm({
                        name: user.name || '',
                        email: user.email || '',
                    });
                }
            } catch (error) {
                toast.error('Failed to load user data');
                console.error('Error loading user data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [isAuthenticated, toast]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        if (userData) {
            setEditForm({
                name: userData.name || '',
                email: userData.email || '',
            });
        }
    }, [userData]);

    const handleSave = useCallback(async () => {
        if (!userData) return;

        try {
            // Here you would typically call an API to update user data
            // For now, we'll just simulate the update
            toast.success('Profile updated successfully!');
            setIsEditing(false);

            // Update local user data
            const updatedUser = { ...userData, ...editForm };
            setUserData(updatedUser);

        } catch (error) {
            toast.error('Failed to update profile');
            console.error('Error updating profile:', error);
        }
    }, [userData, editForm, toast]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        router.push('/');
    }, [router]);

    const formatDate = (date: Date | string) => {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleDisplayName = (role: RoleEnum) => {
        switch (role) {
            case RoleEnum.Admin:
                return 'Administrator';
            case RoleEnum.User:
                return 'User';
            default:
                return role;
        }
    };

    const getRoleBadgeColor = (role: RoleEnum) => {
        switch (role) {
            case RoleEnum.Admin:
                return 'bg-jcoder-gradient text-black';
            case RoleEnum.User:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header isAdmin={true} onLogout={handleLogout} />
                <main className="flex-1 container mx-auto px-4 pt-16 sm:pt-20 pb-8 sm:pb-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-8 sm:py-12">
                            <div className="text-jcoder-muted text-sm sm:text-base">Loading profile...</div>
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

            <main className="flex-1 container mx-auto px-4 pt-16 sm:pt-20 pb-8 sm:pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-jcoder-foreground mb-2">Profile</h1>
                        <p className="text-jcoder-muted text-sm sm:text-base">Manage your account information</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-jcoder-card border border-jcoder rounded-lg overflow-hidden">
                        {/* Profile Header */}
                        <div className="p-4 sm:p-6 border-b border-jcoder bg-jcoder-secondary">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                {/* Profile Image */}
                                <div className="flex items-center gap-4 sm:block">
                                    <div className="relative">
                                        <img
                                            src="/images/profile_picture.jpeg"
                                            alt="Profile"
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-jcoder"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-jcoder-card rounded-full"></div>
                                    </div>

                                    {/* User Info - Mobile Layout */}
                                    <div className="flex-1 sm:hidden">
                                        <h2 className="text-xl font-bold text-jcoder-foreground mb-1">
                                            {userData?.name}
                                        </h2>
                                        <p className="text-jcoder-muted text-sm mb-2">{userData?.email || 'No email'}</p>
                                        <div className="flex flex-col gap-2">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium w-fit ${getRoleBadgeColor(userData?.role || RoleEnum.User)}`}>
                                                {getRoleDisplayName(userData?.role || RoleEnum.User)}
                                            </span>
                                            <span className="text-xs text-jcoder-muted">
                                                Member since {userData?.createdAt ? formatDate(userData.createdAt) : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info - Desktop Layout */}
                                <div className="flex-1 hidden sm:block">
                                    <h2 className="text-2xl font-bold text-jcoder-foreground mb-1">
                                        {userData?.name}
                                    </h2>
                                    <p className="text-jcoder-muted mb-2">{userData?.email || 'No email'}</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userData?.role || RoleEnum.User)}`}>
                                            {getRoleDisplayName(userData?.role || RoleEnum.User)}
                                        </span>
                                        <span className="text-sm text-jcoder-muted">
                                            Member since {userData?.createdAt ? formatDate(userData.createdAt) : 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    {!isEditing ? (
                                        <button
                                            onClick={handleEdit}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-jcoder text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary rounded-lg transition-colors text-sm sm:text-base"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className="hidden sm:inline">Edit Profile</span>
                                            <span className="sm:hidden">Edit</span>
                                        </button>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={handleCancel}
                                                className="px-4 py-2 border border-jcoder text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary rounded-lg transition-colors text-sm sm:text-base"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium text-sm sm:text-base"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                Full Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full px-3 py-3 border border-jcoder rounded-lg bg-jcoder-card text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent text-base"
                                                    placeholder="Enter your full name"
                                                />
                                            ) : (
                                                <p className="text-jcoder-foreground py-2">{userData?.name || 'Not provided'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                Email Address
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                    className="w-full px-3 py-3 border border-jcoder rounded-lg bg-jcoder-card text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent text-base"
                                                    placeholder="Enter your email address"
                                                />
                                            ) : (
                                                <p className="text-jcoder-foreground py-2 break-all">{userData?.email || 'Not provided'}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                User ID
                                            </label>
                                            <p className="text-jcoder-foreground font-mono text-sm py-2 break-all">{userData?.id?.toString() || 'Not available'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">Account Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                Role
                                            </label>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userData?.role || RoleEnum.User)}`}>
                                                {getRoleDisplayName(userData?.role || RoleEnum.User)}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                Account Created
                                            </label>
                                            <p className="text-jcoder-foreground py-2 text-sm sm:text-base">
                                                {userData?.createdAt ? formatDate(userData.createdAt) : 'Not available'}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                Last Updated
                                            </label>
                                            <p className="text-jcoder-foreground py-2 text-sm sm:text-base">
                                                {userData?.updatedAt ? formatDate(userData.updatedAt) : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-jcoder">
                                <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">Security</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                            Password
                                        </label>
                                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 border border-jcoder text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary rounded-lg transition-colors text-sm sm:text-base">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                            Change Password
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                            Two-Factor Authentication
                                        </label>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <span className="text-sm text-jcoder-muted">Not enabled</span>
                                            <button className="w-full sm:w-auto text-sm text-jcoder-primary hover:text-jcoder-accent transition-colors py-2 px-3 border border-jcoder-primary rounded-lg hover:bg-jcoder-secondary">
                                                Enable
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
