'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from '@/components/ui';
import { User } from '@/types/entities/user.entity';
import { UsersService } from '@/services/users.service';
import { useState, useEffect, useCallback } from 'react';
import { InfoField } from '@/components/profile/InfoField';
import { StatsCard } from '@/components/profile/StatsCard';
import { useToast } from '@/components/toast/ToastContext';
import { SectionCard } from '@/components/profile/SectionCard';
import { TimelineItem } from '@/components/profile/TimelineItem';
import { UserComponentsService } from '@/services/user-components.service';
import { ProfileImageUploader } from '@/components/profile/ProfileImageUploader';
import { UserComponentAboutMe } from '@/types/entities/user-component-about-me.entity';
import { UserComponentEducation } from '@/types/entities/user-component-education.entity';
import { UserComponentExperience } from '@/types/entities/user-component-experience.entity';
import { UserComponentCertificate } from '@/types/entities/user-component-certificate.entity';

export default function ProfileManagementPage() {
    const toast = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // Component states
    const [aboutMe, setAboutMe] = useState<UserComponentAboutMe | null>(null);
    const [educations, setEducations] = useState<UserComponentEducation[]>([]);
    const [experiences, setExperiences] = useState<UserComponentExperience[]>([]);
    const [certificates, setCertificates] = useState<UserComponentCertificate[]>([]);

    // Edit states
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form data
    const [basicInfoForm, setBasicInfoForm] = useState({
        firstName: '',
        name: '',
        email: '',
        githubUrl: '',
        linkedinUrl: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [aboutMeForm, setAboutMeForm] = useState({
        fullName: '',
        occupation: '',
        description: '',
        highlights: [] as Array<{ title: string; subtitle?: string; emoji?: string }>,
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

    const loadUserProfile = useCallback(async () => {
        setLoading(true);
        try {
            const userData = UsersService.getUserStorage();
            if (!userData) {
                toast.error('Failed to load profile. Please try again.');
                handleLogout();
                return;
            }
            setUser(userData);
            setBasicInfoForm({
                firstName: userData.firstName || '',
                name: userData.name || '',
                email: userData.email || '',
                githubUrl: userData.githubUrl || '',
                linkedinUrl: userData.linkedinUrl || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // Load components
            const [aboutMeData, educationsData, experiencesData, certificatesData] = await Promise.all([
                UserComponentsService.getAboutMe(),
                UserComponentsService.getEducations(),
                UserComponentsService.getExperiences(),
                UserComponentsService.getCertificates(),
            ]);

            setAboutMe(aboutMeData);
            if (aboutMeData) {
                setAboutMeForm({
                    fullName: aboutMeData.fullName || '',
                    occupation: aboutMeData.occupation || '',
                    description: aboutMeData.description || '',
                    highlights: aboutMeData.highlights?.map(h => ({
                        title: h.title,
                        subtitle: h.subtitle,
                        emoji: h.emoji
                    })) || [],
                });
            }
            setEducations(Array.isArray(educationsData) ? educationsData : []);
            setExperiences(Array.isArray(experiencesData) ? experiencesData : []);
            setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
        } catch (err: any) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    }, [toast, handleLogout]);

    useEffect(() => {
        if (!isAuthenticated) return;
        loadUserProfile();
    }, [isAuthenticated, loadUserProfile]);

    const handleBasicInfoInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBasicInfoForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAboutMeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAboutMeForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSaveBasicInfo = useCallback(async () => {
        if (!user) return;

        // Validate password change if attempting to change password
        if (basicInfoForm.newPassword) {
            if (!basicInfoForm.currentPassword) {
                toast.error('Current password is required to set a new password.');
                return;
            }
            if (basicInfoForm.newPassword !== basicInfoForm.confirmPassword) {
                toast.error('New password and confirmation do not match.');
                return;
            }
            if (basicInfoForm.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters long.');
                return;
            }
        }

        setIsSaving(true);
        try {
            const updateData: any = {
                firstName: basicInfoForm.firstName,
                name: basicInfoForm.name,
                email: basicInfoForm.email,
                githubUrl: basicInfoForm.githubUrl || undefined,
                linkedinUrl: basicInfoForm.linkedinUrl || undefined,
            };

            if (basicInfoForm.newPassword) {
                updateData.currentPassword = basicInfoForm.currentPassword;
                updateData.newPassword = basicInfoForm.newPassword;
            }

            const updatedUser = await UsersService.updateProfile(updateData);
            setUser(updatedUser);
            setIsEditingBasicInfo(false);

            // Update form with new values and clear password fields
            setBasicInfoForm({
                firstName: updatedUser.firstName || '',
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                githubUrl: updatedUser.githubUrl || '',
                linkedinUrl: updatedUser.linkedinUrl || '',
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
    }, [user, basicInfoForm, toast]);

    const handleSaveAboutMe = useCallback(async () => {
        // Validate highlights
        const hasInvalidHighlights = aboutMeForm.highlights.some(h => h.title.trim() === '');
        if (hasInvalidHighlights) {
            toast.error('Please fill in all highlight titles or remove empty highlights.');
            return;
        }

        setIsSaving(true);
        try {
            // Always use createOrUpdateAboutMe - the backend handles create vs update
            const result = await UserComponentsService.createOrUpdateAboutMe({
                fullName: aboutMeForm.fullName,
                occupation: aboutMeForm.occupation,
                description: aboutMeForm.description,
                highlights: aboutMeForm.highlights as any, // Type cast needed as backend will assign id and aboutMeId
            });
            setAboutMe(result);
            setIsEditingAboutMe(false);
            toast.success('About Me updated successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update About Me. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [aboutMeForm, toast]);

    const handleCancelBasicInfo = useCallback(() => {
        if (user) {
            setBasicInfoForm({
                firstName: user.firstName || '',
                name: user.name || '',
                email: user.email || '',
                githubUrl: user.githubUrl || '',
                linkedinUrl: user.linkedinUrl || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        }
        setIsEditingBasicInfo(false);
    }, [user]);

    const handleCancelAboutMe = useCallback(() => {
        if (aboutMe) {
            setAboutMeForm({
                fullName: aboutMe.fullName || '',
                occupation: aboutMe.occupation || '',
                description: aboutMe.description || '',
                highlights: aboutMe.highlights?.map(h => ({
                    title: h.title,
                    subtitle: h.subtitle,
                    emoji: h.emoji
                })) || [],
            });
        }
        setIsEditingAboutMe(false);
    }, [aboutMe]);

    const handleAddHighlight = useCallback(() => {
        setAboutMeForm(prev => ({
            ...prev,
            highlights: [...prev.highlights, { title: '', subtitle: '', emoji: '' }]
        }));
    }, []);

    const handleRemoveHighlight = useCallback((index: number) => {
        setAboutMeForm(prev => ({
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index)
        }));
    }, []);

    const handleHighlightChange = useCallback((index: number, field: 'title' | 'subtitle' | 'emoji', value: string) => {
        setAboutMeForm(prev => ({
            ...prev,
            highlights: prev.highlights.map((h, i) =>
                i === index ? { ...h, [field]: value } : h
            )
        }));
    }, []);

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'Present';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    if (checkingAuth || !isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header isAdmin={true} onLogout={handleLogout} />
                <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                    <div className="max-w-6xl mx-auto">
                        <TableSkeleton />
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
                <div className="max-w-6xl mx-auto">
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
                        <h1 className="text-2xl md:text-3xl font-bold text-jcoder-foreground mb-2">My Profile</h1>
                        <p className="text-sm md:text-base text-jcoder-muted">Manage your profile and portfolio information</p>
                    </div>

                    {/* Profile Header Card */}
                    <div className="bg-jcoder-card border border-jcoder rounded-lg overflow-hidden mb-6">
                        {/* Gradient Header */}
                        <div className="h-24 md:h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"></div>

                        <div className="px-4 md:px-8 pb-6 md:pb-8">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-4 md:mb-0">
                                    <ProfileImageUploader
                                        userId={user?.id || 0}
                                        currentImage={user?.profileImage}
                                        userName={user?.name || user?.firstName}
                                        onImageUpdate={(url) => {
                                            if (user) {
                                                setUser({ ...user, profileImage: url });
                                            }
                                        }}
                                    />
                                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                                        <h2 className="text-xl md:text-2xl font-bold text-jcoder-foreground">
                                            {user?.name || user?.firstName || 'User'}
                                        </h2>
                                        <p className="text-sm md:text-base text-jcoder-muted">{user?.email}</p>
                                        {aboutMe?.occupation && (
                                            <p className="text-sm md:text-base text-jcoder-primary font-medium mt-1">
                                                {aboutMe.occupation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                <StatsCard
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                                    label="Education"
                                    value={educations.length}
                                    color="blue"
                                />
                                <StatsCard
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                    label="Experience"
                                    value={experiences.length}
                                    color="purple"
                                />
                                <StatsCard
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                                    label="Certificates"
                                    value={certificates.length}
                                    color="green"
                                />
                                <StatsCard
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                    label="Highlights"
                                    value={aboutMe?.highlights?.length || 0}
                                    color="orange"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Basic Information Section */}
                        <SectionCard
                            title="Basic Information"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                            action={
                                !isEditingBasicInfo && (
                                    <button
                                        onClick={() => setIsEditingBasicInfo(true)}
                                        className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                    >
                                        Edit
                                    </button>
                                )
                            }
                        >
                            {isEditingBasicInfo ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={basicInfoForm.firstName}
                                                onChange={handleBasicInfoInputChange}
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={basicInfoForm.name}
                                                onChange={handleBasicInfoInputChange}
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={basicInfoForm.email}
                                                onChange={handleBasicInfoInputChange}
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">GitHub URL</label>
                                            <input
                                                type="url"
                                                name="githubUrl"
                                                value={basicInfoForm.githubUrl}
                                                onChange={handleBasicInfoInputChange}
                                                placeholder="https://github.com/username"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">LinkedIn URL</label>
                                            <input
                                                type="url"
                                                name="linkedinUrl"
                                                value={basicInfoForm.linkedinUrl}
                                                onChange={handleBasicInfoInputChange}
                                                placeholder="https://linkedin.com/in/username"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Change */}
                                    <div className="pt-4 border-t border-jcoder">
                                        <h4 className="text-base font-semibold text-jcoder-foreground mb-4">Change Password (Optional)</h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-jcoder-muted mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={basicInfoForm.currentPassword}
                                                    onChange={handleBasicInfoInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-jcoder-muted mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={basicInfoForm.newPassword}
                                                    onChange={handleBasicInfoInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-jcoder-muted mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={basicInfoForm.confirmPassword}
                                                    onChange={handleBasicInfoInputChange}
                                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleCancelBasicInfo}
                                            disabled={isSaving}
                                            className="px-4 py-2 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors text-sm md:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveBasicInfo}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm md:text-base"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <InfoField
                                        label="First Name"
                                        value={user?.firstName}
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                    />
                                    <InfoField
                                        label="Full Name"
                                        value={user?.name}
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                    />
                                    <InfoField
                                        label="Email"
                                        value={user?.email}
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                    />
                                    <InfoField
                                        label="GitHub"
                                        value={user?.githubUrl ? (
                                            <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-jcoder-primary hover:underline break-all">
                                                {user.githubUrl}
                                            </a>
                                        ) : undefined}
                                        icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>}
                                    />
                                    <InfoField
                                        label="LinkedIn"
                                        value={user?.linkedinUrl ? (
                                            <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-jcoder-primary hover:underline break-all">
                                                {user.linkedinUrl}
                                            </a>
                                        ) : undefined}
                                        icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>}
                                    />
                                </div>
                            )}
                        </SectionCard>

                        {/* About Me Section */}
                        <SectionCard
                            title="About Me"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            action={
                                !isEditingAboutMe && (
                                    <button
                                        onClick={() => setIsEditingAboutMe(true)}
                                        className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                    >
                                        {aboutMe ? 'Edit' : 'Add'}
                                    </button>
                                )
                            }
                            isEmpty={!aboutMe && !isEditingAboutMe}
                            emptyMessage="Add information about yourself to showcase on your profile"
                        >
                            {isEditingAboutMe ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-jcoder-muted mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={aboutMeForm.fullName}
                                            onChange={handleAboutMeInputChange}
                                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-jcoder-muted mb-2">Occupation/Title</label>
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={aboutMeForm.occupation}
                                            onChange={handleAboutMeInputChange}
                                            placeholder="e.g., Senior Software Engineer"
                                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-jcoder-muted mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={aboutMeForm.description}
                                            onChange={handleAboutMeInputChange}
                                            rows={6}
                                            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none resize-none"
                                        />
                                    </div>

                                    {/* Highlights Section */}
                                    <div className="pt-4 border-t border-jcoder">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-base font-semibold text-jcoder-foreground">Highlights</h4>
                                            <button
                                                type="button"
                                                onClick={handleAddHighlight}
                                                className="px-3 py-1.5 text-sm bg-jcoder-primary/10 text-jcoder-primary rounded-lg hover:bg-jcoder-primary/20 transition-colors font-medium flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Highlight
                                            </button>
                                        </div>

                                        {aboutMeForm.highlights.length === 0 ? (
                                            <p className="text-sm text-jcoder-muted italic">No highlights added yet. Click "Add Highlight" to get started.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {aboutMeForm.highlights.map((highlight, index) => (
                                                    <div key={index} className="p-4 bg-jcoder-secondary border border-jcoder rounded-lg">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <span className="text-sm font-medium text-jcoder-muted">Highlight #{index + 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveHighlight(index)}
                                                                className="text-red-500 hover:text-red-600 transition-colors"
                                                                title="Remove highlight"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <div className="sm:col-span-2">
                                                                    <label className="block text-xs font-medium text-jcoder-muted mb-1">Title *</label>
                                                                    <input
                                                                        type="text"
                                                                        value={highlight.title}
                                                                        onChange={(e) => handleHighlightChange(index, 'title', e.target.value)}
                                                                        placeholder="e.g., 10+ Years Experience"
                                                                        className="w-full px-3 py-2 bg-jcoder-background border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none text-sm"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-jcoder-muted mb-1">Subtitle (Optional)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={highlight.subtitle || ''}
                                                                        onChange={(e) => handleHighlightChange(index, 'subtitle', e.target.value)}
                                                                        placeholder="e.g., Building amazing software"
                                                                        className="w-full px-3 py-2 bg-jcoder-background border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none text-sm"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-jcoder-muted mb-1">Emoji (Optional)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={highlight.emoji || ''}
                                                                        onChange={(e) => handleHighlightChange(index, 'emoji', e.target.value)}
                                                                        placeholder="e.g., 🚀"
                                                                        maxLength={2}
                                                                        className="w-full px-3 py-2 bg-jcoder-background border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none text-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleCancelAboutMe}
                                            disabled={isSaving}
                                            className="px-4 py-2 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors text-sm md:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveAboutMe}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm md:text-base"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : aboutMe ? (
                                <div className="space-y-4">
                                    <InfoField label="Full Name" value={aboutMe.fullName} />
                                    <InfoField label="Occupation" value={aboutMe.occupation} />
                                    <InfoField
                                        label="Description"
                                        value={
                                            <div
                                                className="text-sm md:text-base text-jcoder-foreground mt-2 prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: aboutMe.description || '' }}
                                            />
                                        }
                                    />
                                    {aboutMe.highlights && aboutMe.highlights.length > 0 && (
                                        <div className="pt-4">
                                            <h4 className="text-base font-semibold text-jcoder-foreground mb-3">Highlights</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {aboutMe.highlights.map((highlight, index) => (
                                                    <div key={index} className="p-3 bg-jcoder-secondary rounded-lg border border-jcoder hover:border-jcoder-primary transition-all">
                                                        <div className="flex items-start gap-2">
                                                            {highlight.emoji && (
                                                                <span className="text-2xl flex-shrink-0">{highlight.emoji}</span>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-jcoder-foreground">{highlight.title}</p>
                                                                {highlight.subtitle && (
                                                                    <p className="text-xs text-jcoder-muted mt-1">{highlight.subtitle}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </SectionCard>

                        {/* Education Section */}
                        <SectionCard
                            title="Education"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                            collapsible={true}
                            isEmpty={educations.length === 0}
                            emptyMessage="No education records added yet"
                        >
                            {educations.map((edu, index) => (
                                <TimelineItem
                                    key={index}
                                    title={edu.courseName}
                                    subtitle={edu.institutionName}
                                    period={`${formatDate(edu.startDate)} - ${edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}`}
                                    isActive={edu.isCurrentlyStudying}
                                    tags={edu.degree ? [edu.degree] : undefined}
                                />
                            ))}
                        </SectionCard>

                        {/* Experience Section */}
                        <SectionCard
                            title="Professional Experience"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            collapsible={true}
                            isEmpty={experiences.length === 0}
                            emptyMessage="No professional experience added yet"
                        >
                            {experiences.map((exp, index) => (
                                <div key={index} className="mb-6 last:mb-0">
                                    <h4 className="text-lg font-semibold text-jcoder-foreground mb-4">{exp.companyName}</h4>
                                    {exp.positions && exp.positions.map((position, pIndex) => (
                                        <TimelineItem
                                            key={pIndex}
                                            title={position.positionName}
                                            period={`${formatDate(position.startDate)} - ${position.isCurrentPosition ? 'Present' : formatDate(position.endDate)}`}
                                            description={position.description}
                                            isActive={position.isCurrentPosition}
                                        />
                                    ))}
                                </div>
                            ))}
                        </SectionCard>

                        {/* Certificates Section */}
                        <SectionCard
                            title="Certifications"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                            collapsible={true}
                            isEmpty={certificates.length === 0}
                            emptyMessage="No certificates added yet"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {certificates.map((cert, index) => (
                                    <div key={index} className="p-4 bg-jcoder-secondary rounded-lg border border-jcoder hover:border-jcoder-primary transition-all">
                                        <h4 className="text-base font-semibold text-jcoder-foreground mb-2">{cert.certificateName}</h4>
                                        <p className="text-sm text-jcoder-muted mb-2">Issued to: {cert.issuedTo}</p>
                                        <p className="text-xs text-jcoder-muted mb-2">Issued: {formatDate(cert.issueDate)}</p>
                                        {cert.registrationNumber && (
                                            <p className="text-xs text-jcoder-muted mb-2">Registration: {cert.registrationNumber}</p>
                                        )}
                                        {cert.verificationUrl && (
                                            <a
                                                href={cert.verificationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-jcoder-primary hover:underline"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                Verify Certificate
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
