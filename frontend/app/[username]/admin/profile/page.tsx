'use client';

import {
    User,
    UserComponentAboutMe,
    WorkLocationTypeEnum,
    UserComponentEducation,
    UserComponentExperience,
    UserComponentCertificate,
    UserComponentExperiencePosition,
} from '@/types';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Canvas } from '@react-three/fiber';
import { useRouter, useParams } from 'next/navigation';
import Hero3D from '@/components/webgl/Hero3D';
import { TableSkeleton } from '@/components/ui';
import { InfoField } from '@/components/profile/InfoField';
import { StatsCard } from '@/components/profile/StatsCard';
import { useToast } from '@/components/toast/ToastContext';
import { SectionCard } from '@/components/profile/SectionCard';
import { TimelineItem } from '@/components/profile/TimelineItem';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import { UsersService } from '@/services/administration-by-user/users.service';
import { useState, useEffect, useCallback, useRef, Suspense, useMemo } from 'react';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';
import { ImagesService } from '@/services/administration-by-user/images.service';

export default function ProfileManagementPage() {
    const toast = useToast();
    const router = useRouter();
    const params = useParams();

    const username = useMemo(() => {
        const raw = params?.username;
        return Array.isArray(raw) ? raw[0] : raw || '';
    }, [params]);

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // WebGL and animation states
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
    const [isVisible, setIsVisible] = useState(false);

    // Refs for mouse position throttling
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    // Component states
    const [aboutMe, setAboutMe] = useState<UserComponentAboutMe | null>(null);
    const [educations, setEducations] = useState<UserComponentEducation[]>([]);
    const [experiences, setExperiences] = useState<UserComponentExperience[]>([]);
    const [certificates, setCertificates] = useState<UserComponentCertificate[]>([]);

    // Edit states
    const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
    const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);
    const [isEditingEducation, setIsEditingEducation] = useState(false);
    const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
    const [isEditingExperience, setIsEditingExperience] = useState(false);
    const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
    const [editingPositionIndex, setEditingPositionIndex] = useState<number | null>(null);
    const [isAddingPosition, setIsAddingPosition] = useState(false);
    const [isEditingCertificate, setIsEditingCertificate] = useState(false);
    const [editingCertificateId, setEditingCertificateId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Profile image upload states
    const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
    const [deletingProfileImage, setDeletingProfileImage] = useState(false);
    const [profileImageTimestamp, setProfileImageTimestamp] = useState(Date.now());
    const profileImageInputRef = useRef<HTMLInputElement>(null);

    // Username availability check
    const [usernameStatus, setUsernameStatus] = useState<{
        checking: boolean;
        available: boolean | null;
    }>({ checking: false, available: null });
    const usernameDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Email availability and verification
    const [emailStatus, setEmailStatus] = useState<{
        checking: boolean;
        available: boolean | null;
    }>({ checking: false, available: null });
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const emailDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Form data
    const [basicInfoForm, setBasicInfoForm] = useState({
        username: '',
        firstName: '',
        fullName: '',
        email: '',
        githubUrl: '',
        linkedinUrl: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [aboutMeForm, setAboutMeForm] = useState({
        occupation: '',
        description: '',
        highlights: [] as Array<{ title: string; subtitle?: string; emoji?: string }>,
    });

    const [educationForm, setEducationForm] = useState({
        institutionName: '',
        courseName: '',
        degree: '',
        startDate: '',
        endDate: '',
        isCurrentlyStudying: false,
    });

    const [experienceForm, setExperienceForm] = useState({
        companyName: '',
    });

    const [positionForm, setPositionForm] = useState({
        position: '',
        startDate: '',
        endDate: '',
        isCurrentPosition: false,
        location: '',
        locationType: '' as WorkLocationTypeEnum | '',
    });

    const [certificateForm, setCertificateForm] = useState({
        certificateName: '',
        registrationNumber: '',
        verificationUrl: '',
        issueDate: '',
        issuedTo: '',
        educationIds: [] as number[],
    });

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        router.push('/');
    }, [router]);

    useEffect(() => {
        setIsVisible(true);

        // Update window size
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Update ref immediately
            mousePositionRef.current = { x: e.clientX, y: e.clientY };

            // Throttle state updates using requestAnimationFrame
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(() => {
                    setMousePosition(mousePositionRef.current);
                    rafRef.current = null;
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/sign-in');
            return;
        }
        setIsAuthenticated(true);
        setCheckingAuth(false);
    }, [router]);

    const loadUserProfile = useCallback(async () => {
        setLoading(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession) {
                toast.error('Failed to load profile. Please try again.');
                handleLogout();
                return;
            }

            // Se o user do localStorage não tiver id, buscar do backend
            let userData = userSession.user;
            if (!userData.id && userSession.user.username) {
                try {
                    userData = await UsersService.getProfile(userSession.user.username);
                } catch (err) {
                    console.error('Error fetching user profile from API:', err);
                    // Usar dados do localStorage mesmo sem id
                }
            }

            setUser(userData);
            // Initialize timestamp from localStorage if available
            const lastUpdate = localStorage.getItem('profileImageUpdated');
            if (lastUpdate) {
                setProfileImageTimestamp(parseInt(lastUpdate, 10));
            }
            setBasicInfoForm({
                username: userData.username || '',
                firstName: userData.firstName || '',
                fullName: userData.fullName || '',
                email: userData.email || '',
                githubUrl: userData.githubUrl || '',
                linkedinUrl: userData.linkedinUrl || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // Load components
            const [aboutMeData, educationsData, experiencesData, certificatesData] = await Promise.all([
                UsersService.getAboutMe(userData.username),
                UsersService.getEducations(userData.username),
                UsersService.getExperiences(userData.username),
                UsersService.getCertificates(userData.username),
            ]);

            setAboutMe(aboutMeData);
            if (aboutMeData) {
                setAboutMeForm({
                    occupation: aboutMeData.occupation || '',
                    description: aboutMeData.description || '',
                    highlights: aboutMeData.highlights?.map(h => ({
                        title: h.title,
                        subtitle: h.subtitle,
                        emoji: h.emoji
                    })) || [],
                });
            }
            setEducations(Array.isArray(educationsData?.data) ? educationsData.data : (Array.isArray(educationsData) ? educationsData : []));
            setExperiences(Array.isArray(experiencesData?.data) ? experiencesData.data : (Array.isArray(experiencesData) ? experiencesData : []));
            setCertificates(Array.isArray(certificatesData?.data) ? certificatesData.data : (Array.isArray(certificatesData) ? certificatesData : []));
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

    // Real-time username availability check
    useEffect(() => {
        if (!isEditingBasicInfo) {
            setUsernameStatus({ checking: false, available: null });
            return;
        }

        if (usernameDebounceTimeoutRef.current) {
            clearTimeout(usernameDebounceTimeoutRef.current);
        }

        const usernameTrimmed = basicInfoForm.username.trim();
        const originalUsername = user?.username || '';

        // If username hasn't changed, no need to check
        if (usernameTrimmed === originalUsername) {
            setUsernameStatus({ checking: false, available: true });
            return;
        }

        if (!usernameTrimmed || usernameTrimmed.length < 3) {
            setUsernameStatus({ checking: false, available: null });
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(usernameTrimmed)) {
            setUsernameStatus({ checking: false, available: null });
            return;
        }

        setUsernameStatus({ checking: true, available: null });
        usernameDebounceTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await PortfolioViewService.checkUsernameAvailability(usernameTrimmed);
                setUsernameStatus({ checking: false, available: result.available });
            } catch (error) {
                setUsernameStatus({ checking: false, available: null });
            }
        }, 500);

        return () => {
            if (usernameDebounceTimeoutRef.current) {
                clearTimeout(usernameDebounceTimeoutRef.current);
            }
        };
    }, [basicInfoForm.username, isEditingBasicInfo, user?.username]);

    // Real-time email availability check
    useEffect(() => {
        if (!isEditingBasicInfo) {
            setEmailStatus({ checking: false, available: null });
            setIsEmailVerified(false);
            setCodeSent(false);
            setVerificationCode('');
            return;
        }

        if (emailDebounceTimeoutRef.current) {
            clearTimeout(emailDebounceTimeoutRef.current);
        }

        const emailTrimmed = (basicInfoForm.email || '').trim();
        const originalEmail = (user?.email || '').trim();

        // If email hasn't changed, no need to check
        if (emailTrimmed === originalEmail && emailTrimmed !== '') {
            setEmailStatus({ checking: false, available: true });
            setIsEmailVerified(true);
            setCodeSent(false);
            setVerificationCode('');
            return;
        }

        if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
            setEmailStatus({ checking: false, available: null });
            setIsEmailVerified(false);
            setCodeSent(false);
            setVerificationCode('');
            return;
        }

        setEmailStatus({ checking: true, available: null });
        setIsEmailVerified(false);
        setCodeSent(false);
        setVerificationCode('');
        emailDebounceTimeoutRef.current = setTimeout(async () => {
            try {
                const result = await PortfolioViewService.checkEmailAvailability(emailTrimmed);
                setEmailStatus({ checking: false, available: result.available });
            } catch (error) {
                setEmailStatus({ checking: false, available: null });
            }
        }, 500);

        return () => {
            if (emailDebounceTimeoutRef.current) {
                clearTimeout(emailDebounceTimeoutRef.current);
            }
        };
    }, [basicInfoForm.email, isEditingBasicInfo, user?.email]);

    const handleBasicInfoInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBasicInfoForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSendVerificationCode = useCallback(async () => {
        if (!basicInfoForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfoForm.email)) {
            toast.error('Please enter a valid email');
            return;
        }

        if (emailStatus.available !== true) {
            toast.error('This email is already in use. Please use another email.');
            return;
        }

        setIsSendingCode(true);
        try {
            await PortfolioViewService.sendEmailVerification(basicInfoForm.email);
            setCodeSent(true);
            setIsEmailVerified(false);
            setVerificationCode('');
            toast.success('Verification code sent! Check your inbox.');
        } catch (err: any) {
            const apiMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to send verification code. Please try again.';
            toast.error(apiMessage);
        } finally {
            setIsSendingCode(false);
        }
    }, [basicInfoForm.email, emailStatus, toast]);

    const handleVerifyCode = useCallback(async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }

        setIsVerifyingCode(true);
        try {
            const result = await PortfolioViewService.verifyEmailCode(basicInfoForm.email, verificationCode);
            if (result.verified) {
                setIsEmailVerified(true);
                toast.success('Email verified successfully!');
            }
        } catch (err: any) {
            const apiMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Invalid or expired code. Please try again.';
            toast.error(apiMessage);
        } finally {
            setIsVerifyingCode(false);
        }
    }, [basicInfoForm.email, verificationCode, toast]);

    const handleAboutMeInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAboutMeForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSaveBasicInfo = useCallback(async () => {
        if (!user) return;

        // Validate username if changed
        const usernameChanged = basicInfoForm.username.trim() !== (user.username || '');
        if (usernameChanged) {
            if (!basicInfoForm.username.trim() || basicInfoForm.username.trim().length < 3) {
                toast.error('Username must be at least 3 characters long');
                return;
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(basicInfoForm.username.trim())) {
                toast.error('Username can only contain letters, numbers, underscores and hyphens');
                return;
            }
            if (usernameStatus.available !== true) {
                toast.error('Please choose an available username');
                return;
            }
        }

        // Validate email if changed
        const emailChanged = basicInfoForm.email.trim() !== (user.email || '');
        if (emailChanged) {
            if (!basicInfoForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfoForm.email.trim())) {
                toast.error('Please enter a valid email');
                return;
            }
            if (emailStatus.available !== true) {
                toast.error('Please use an available email');
                return;
            }
            if (!isEmailVerified) {
                toast.error('Please verify your email before saving');
                return;
            }
        }

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
            const userSession = UsersService.getUserSession();
            if (!userSession) {
                toast.error('Failed to load profile. Please try again.');
                handleLogout();
                return;
            }
            const updateData: any = {
                firstName: basicInfoForm.firstName,
                fullName: basicInfoForm.fullName,
                githubUrl: basicInfoForm.githubUrl || undefined,
                linkedinUrl: basicInfoForm.linkedinUrl || undefined,
            };

            // Only include username if it changed
            if (usernameChanged) {
                updateData.username = basicInfoForm.username.trim();
            }

            // Only include email if it changed
            if (emailChanged) {
                updateData.email = basicInfoForm.email.trim();
            }

            if (basicInfoForm.newPassword) {
                updateData.currentPassword = basicInfoForm.currentPassword;
                updateData.newPassword = basicInfoForm.newPassword;
            }

            const updatedUser = await UsersService.updateProfile(userSession?.user.username, updateData);
            setUser(updatedUser);
            setIsEditingBasicInfo(false);

            // Reset verification states
            setUsernameStatus({ checking: false, available: null });
            setEmailStatus({ checking: false, available: null });
            setIsEmailVerified(false);
            setCodeSent(false);
            setVerificationCode('');

            // Update form with new values and clear password fields
            setBasicInfoForm({
                username: updatedUser.username || '',
                firstName: updatedUser.firstName || '',
                fullName: updatedUser.fullName || '',
                email: updatedUser.email || '',
                githubUrl: updatedUser.githubUrl || '',
                linkedinUrl: updatedUser.linkedinUrl || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            // If username changed, update localStorage and redirect
            if (usernameChanged && updatedUser.username) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
                toast.success('Profile updated successfully! Redirecting...');
                setTimeout(() => {
                    router.push(`/${updatedUser.username}/admin/profile`);
                }, 1500);
            } else {
                toast.success('Profile updated successfully!');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [user, basicInfoForm, usernameStatus, emailStatus, isEmailVerified, toast, handleLogout, router]);

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
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const result = await UsersService.updateAboutMe(userSession.user.username, {
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
                username: user.username || '',
                firstName: user.firstName || '',
                fullName: user.fullName || '',
                email: user.email || '',
                githubUrl: user.githubUrl || '',
                linkedinUrl: user.linkedinUrl || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        }
        setIsEditingBasicInfo(false);
        setUsernameStatus({ checking: false, available: null });
        setEmailStatus({ checking: false, available: null });
        setIsEmailVerified(false);
        setCodeSent(false);
        setVerificationCode('');
    }, [user]);

    const handleCancelAboutMe = useCallback(() => {
        if (aboutMe) {
            setAboutMeForm({
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

    const handleEducationInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setEducationForm(prev => ({ ...prev, [name]: checked }));
        } else {
            setEducationForm(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleAddEducation = useCallback(() => {
        setEducationForm({
            institutionName: '',
            courseName: '',
            degree: '',
            startDate: '',
            endDate: '',
            isCurrentlyStudying: false,
        });
        setEditingEducationId(null);
        setIsEditingEducation(true);
    }, []);

    const handleEditEducation = useCallback((education: UserComponentEducation) => {
        setEducationForm({
            institutionName: education.institutionName || '',
            courseName: education.courseName || '',
            degree: education.degree || '',
            startDate: education.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
            endDate: education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '',
            isCurrentlyStudying: education.isCurrentlyStudying || false,
        });
        setEditingEducationId(education.id || null);
        setIsEditingEducation(true);
    }, []);

    const handleCancelEducation = useCallback(() => {
        setIsEditingEducation(false);
        setEditingEducationId(null);
        setEducationForm({
            institutionName: '',
            courseName: '',
            degree: '',
            startDate: '',
            endDate: '',
            isCurrentlyStudying: false,
        });
    }, []);

    const handleSaveEducation = useCallback(async () => {
        // Validate form
        if (!educationForm.institutionName.trim()) {
            toast.error('Institution name is required.');
            return;
        }
        if (!educationForm.courseName.trim()) {
            toast.error('Course name is required.');
            return;
        }
        if (!educationForm.startDate) {
            toast.error('Start date is required.');
            return;
        }
        if (!educationForm.isCurrentlyStudying && !educationForm.endDate) {
            toast.error('End date is required when not currently studying.');
            return;
        }
        if (educationForm.endDate && educationForm.startDate && new Date(educationForm.endDate) < new Date(educationForm.startDate)) {
            toast.error('End date must be after start date.');
            return;
        }
        if (educationForm.isCurrentlyStudying && educationForm.endDate && new Date(educationForm.endDate) < new Date()) {
            toast.error('If currently studying, end date must be in the future.');
            return;
        }

        setIsSaving(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const educationData: any = {
                institutionName: educationForm.institutionName,
                courseName: educationForm.courseName,
                degree: educationForm.degree || undefined,
                startDate: new Date(educationForm.startDate).toISOString(),
                isCurrentlyStudying: educationForm.isCurrentlyStudying,
            };

            if (!educationForm.isCurrentlyStudying && educationForm.endDate) {
                educationData.endDate = new Date(educationForm.endDate).toISOString();
            } else if (educationForm.isCurrentlyStudying) {
                educationData.endDate = null;
            }

            let updatedEducation: UserComponentEducation;
            if (editingEducationId) {
                updatedEducation = await UsersService.updateEducation(userSession.user.username, editingEducationId, educationData);
                setEducations(prev => prev.map(edu => edu.id === editingEducationId ? updatedEducation : edu));
            } else {
                updatedEducation = await UsersService.createEducation(userSession.user.username, educationData);
                setEducations(prev => [...prev, updatedEducation]);
            }

            setIsEditingEducation(false);
            setEditingEducationId(null);
            toast.success(`Education ${editingEducationId ? 'updated' : 'created'} successfully!`);
        } catch (err: any) {
            toast.error(err.message || `Failed to ${editingEducationId ? 'update' : 'create'} education. Please try again.`);
        } finally {
            setIsSaving(false);
        }
    }, [educationForm, editingEducationId, toast]);

    const handleDeleteEducation = useCallback(async (educationId: number) => {
        const confirmed = await toast.confirm(
            'Are you sure you want to delete this education record?',
            {
                confirmText: 'Delete',
                cancelText: 'Cancel',
            }
        );

        if (!confirmed) {
            return;
        }

        setIsSaving(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await UsersService.deleteEducation(userSession.user.username, educationId);
            setEducations(prev => prev.filter(edu => edu.id !== educationId));
            toast.success('Education deleted successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete education. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Experience handlers
    const handleExperienceInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setExperienceForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handlePositionInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setPositionForm(prev => ({ ...prev, [name]: checked }));
        } else {
            setPositionForm(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleAddExperience = useCallback(() => {
        setExperienceForm({ companyName: '' });
        setEditingExperienceId(null);
        setIsEditingExperience(true);
        setEditingPositionIndex(null);
        setIsAddingPosition(false);
        setPositionForm({
            position: '',
            startDate: '',
            endDate: '',
            isCurrentPosition: false,
            location: '',
            locationType: '',
        });
    }, []);

    const handleEditExperience = useCallback((experience: UserComponentExperience) => {
        setExperienceForm({
            companyName: experience.companyName || '',
        });
        setEditingExperienceId(experience.id);
        setIsEditingExperience(true);
        setEditingPositionIndex(null);
        setIsAddingPosition(false);
        setPositionForm({
            position: '',
            startDate: '',
            endDate: '',
            isCurrentPosition: false,
            location: '',
            locationType: '',
        });
    }, []);

    const handleCancelExperience = useCallback(() => {
        setIsEditingExperience(false);
        setEditingExperienceId(null);
        setEditingPositionIndex(null);
        setIsAddingPosition(false);
        setExperienceForm({ companyName: '' });
        setPositionForm({
            position: '',
            startDate: '',
            endDate: '',
            isCurrentPosition: false,
            location: '',
            locationType: '',
        });
    }, []);

    const handleSaveExperience = useCallback(async () => {
        if (!experienceForm.companyName.trim()) {
            toast.error('Company name is required.');
            return;
        }

        setIsSaving(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const experienceData: any = {
                companyName: experienceForm.companyName,
            };

            // Get positions from the current editing experience if editing
            let positionsToSave: UserComponentExperiencePosition[] = [];
            if (editingExperienceId) {
                const currentExp = experiences.find(e => e.id === editingExperienceId);
                if (currentExp?.positions) {
                    positionsToSave = currentExp.positions;
                }
            }

            let updatedExperience: UserComponentExperience;
            if (editingExperienceId) {
                experienceData.positions = positionsToSave.map(p => ({
                    position: p.position || '',
                    startDate: p.startDate ? (typeof p.startDate === 'string' ? p.startDate : new Date(p.startDate).toISOString()) : undefined,
                    endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : new Date(p.endDate).toISOString()) : (p.isCurrentPosition ? null : undefined),
                    isCurrentPosition: p.isCurrentPosition,
                    location: p.location,
                    locationType: p.locationType,
                }));
                updatedExperience = await UsersService.updateExperience(userSession.user.username, editingExperienceId, experienceData);
                setExperiences(prev => prev.map(exp => exp.id === editingExperienceId ? updatedExperience : exp));
            } else {
                updatedExperience = await UsersService.createExperience(userSession.user.username, experienceData);
                setExperiences(prev => [...prev, updatedExperience]);
                // After creating, keep editing mode to allow adding positions
                setEditingExperienceId(updatedExperience.id);
            }

            // Don't exit edit mode automatically - let user manage positions first
            // setIsEditingExperience(false);
            // setEditingExperienceId(null);
            toast.success(`Experience ${editingExperienceId ? 'updated' : 'created'} successfully!`);
        } catch (err: any) {
            toast.error(err.message || `Failed to ${editingExperienceId ? 'update' : 'create'} experience. Please try again.`);
        } finally {
            setIsSaving(false);
        }
    }, [experienceForm, editingExperienceId, experiences, toast]);

    const handleDeleteExperience = useCallback(async (experienceId: number) => {
        const confirmed = await toast.confirm(
            'Are you sure you want to delete this experience? All positions associated with it will also be deleted.',
            {
                confirmText: 'Delete',
                cancelText: 'Cancel',
            }
        );

        if (!confirmed) {
            return;
        }

        setIsSaving(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await UsersService.deleteExperience(userSession.user.username, experienceId);
            setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
            toast.success('Experience deleted successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete experience. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    // Position handlers
    const handleAddPosition = useCallback((experienceId: number) => {
        if (!editingExperienceId || editingExperienceId !== experienceId) {
            toast.error('Please save the company first before adding positions.');
            return;
        }
        setPositionForm({
            position: '',
            startDate: '',
            endDate: '',
            isCurrentPosition: false,
            location: '',
            locationType: '',
        });
        setEditingPositionIndex(null);
        setIsAddingPosition(true);
    }, [editingExperienceId, toast]);

    const handleEditPosition = useCallback((experienceId: number, positionIndex: number) => {
        if (!editingExperienceId || editingExperienceId !== experienceId) {
            toast.error('Please save the company first before editing positions.');
            return;
        }
        const currentExp = experiences.find(e => e.id === experienceId);
        if (!currentExp?.positions?.[positionIndex]) {
            toast.error('Position not found.');
            return;
        }
        const position = currentExp.positions[positionIndex];
        setPositionForm({
            position: position.position || '',
            startDate: position.startDate ? new Date(position.startDate).toISOString().split('T')[0] : '',
            endDate: position.endDate ? new Date(position.endDate).toISOString().split('T')[0] : '',
            isCurrentPosition: position.isCurrentPosition || false,
            location: position.location || '',
            locationType: position.locationType || '',
        });
        setEditingPositionIndex(positionIndex);
        setIsAddingPosition(false);
    }, [editingExperienceId, experiences, toast]);

    const handleCancelPosition = useCallback(() => {
        setEditingPositionIndex(null);
        setIsAddingPosition(false);
        setPositionForm({
            position: '',
            startDate: '',
            endDate: '',
            isCurrentPosition: false,
            location: '',
            locationType: '',
        });
    }, []);

    const handleSavePosition = useCallback(async (experienceId: number) => {
        if (!positionForm.position.trim()) {
            toast.error('Position title is required.');
            return;
        }
        if (!positionForm.startDate) {
            toast.error('Start date is required.');
            return;
        }
        if (!positionForm.isCurrentPosition && !positionForm.endDate) {
            toast.error('End date is required when not current position.');
            return;
        }
        if (positionForm.endDate && positionForm.startDate && new Date(positionForm.endDate) < new Date(positionForm.startDate)) {
            toast.error('End date must be after start date.');
            return;
        }

        const currentExp = experiences.find(e => e.id === experienceId);
        if (!currentExp) {
            toast.error('Experience not found.');
            return;
        }

        setIsSaving(true);
        try {
            const newPosition: any = {
                position: positionForm.position,
                startDate: new Date(positionForm.startDate).toISOString(),
                endDate: positionForm.isCurrentPosition ? undefined : (positionForm.endDate ? new Date(positionForm.endDate).toISOString() : undefined),
                isCurrentPosition: positionForm.isCurrentPosition,
                location: positionForm.location?.trim() || undefined,
                locationType: positionForm.locationType?.trim() || undefined,
            };

            let updatedPositions = [...(currentExp.positions || [])];
            if (editingPositionIndex !== null) {
                updatedPositions[editingPositionIndex] = {
                    ...updatedPositions[editingPositionIndex],
                    ...newPosition,
                };
            } else {
                updatedPositions.push(newPosition);
            }

            // Update experience with new positions
            const experienceData: any = {
                companyName: currentExp.companyName,
                positions: updatedPositions.map(p => ({
                    position: p.position || '',
                    startDate: p.startDate ? (typeof p.startDate === 'string' ? p.startDate : new Date(p.startDate).toISOString()) : undefined,
                    endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : new Date(p.endDate).toISOString()) : undefined,
                    isCurrentPosition: p.isCurrentPosition,
                    location: p.location?.trim() || undefined,
                    locationType: p.locationType?.trim() || undefined,
                })),
            };

            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const updatedExperience = await UsersService.updateExperience(userSession.user.username, experienceId, experienceData);
            setExperiences(prev => prev.map(exp => exp.id === experienceId ? updatedExperience : exp));

            setEditingPositionIndex(null);
            setIsAddingPosition(false);
            setPositionForm({
                position: '',
                startDate: '',
                endDate: '',
                isCurrentPosition: false,
                location: '',
                locationType: '',
            });
            toast.success(`Position ${editingPositionIndex !== null ? 'updated' : 'added'} successfully!`);
        } catch (err: any) {
            toast.error(err.message || `Failed to ${editingPositionIndex !== null ? 'update' : 'add'} position. Please try again.`);
        } finally {
            setIsSaving(false);
        }
    }, [positionForm, editingPositionIndex, experiences, toast]);

    const handleDeletePosition = useCallback(async (experienceId: number, positionIndex: number) => {
        const confirmed = await toast.confirm(
            'Are you sure you want to delete this position?',
            {
                confirmText: 'Delete',
                cancelText: 'Cancel',
            }
        );

        if (!confirmed) {
            return;
        }

        const currentExp = experiences.find(e => e.id === experienceId);
        if (!currentExp?.positions) {
            toast.error('Position not found.');
            return;
        }

        setIsSaving(true);
        try {
            const updatedPositions = currentExp.positions.filter((_, idx) => idx !== positionIndex);

            const experienceData: any = {
                companyName: currentExp.companyName,
                positions: updatedPositions.map(p => ({
                    position: p.position || '',
                    startDate: p.startDate ? (typeof p.startDate === 'string' ? p.startDate : new Date(p.startDate).toISOString()) : undefined,
                    endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : new Date(p.endDate).toISOString()) : undefined,
                    isCurrentPosition: p.isCurrentPosition,
                    location: p.location?.trim() || undefined,
                    locationType: p.locationType?.trim() || undefined,
                })),
            };

            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const updatedExperience = await UsersService.updateExperience(userSession.user.username, experienceId, experienceData);
            setExperiences(prev => prev.map(exp => exp.id === experienceId ? updatedExperience : exp));

            toast.success('Position deleted successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete position. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [experiences, toast]);

    // Certificate handlers
    const handleCertificateInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCertificateForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAddCertificate = useCallback(() => {
        setCertificateForm({
            certificateName: '',
            registrationNumber: '',
            verificationUrl: '',
            issueDate: '',
            issuedTo: user?.fullName || user?.firstName || '',
            educationIds: [],
        });
        setEditingCertificateId(null);
        setIsEditingCertificate(true);
    }, [user]);

    const handleEditCertificate = useCallback((certificate: UserComponentCertificate) => {
        const educationIds = certificate.educations?.map(e => e.id).filter((id): id is number => id !== undefined) || [];
        setCertificateForm({
            certificateName: certificate.certificateName || '',
            registrationNumber: certificate.registrationNumber || '',
            verificationUrl: certificate.verificationUrl || '',
            issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : '',
            issuedTo: certificate.issuedTo || '',
            educationIds,
        });
        const certId = certificate.id;
        setEditingCertificateId(certId ?? null);
        setIsEditingCertificate(true);
    }, []);

    const handleCancelCertificate = useCallback(() => {
        setIsEditingCertificate(false);
        setEditingCertificateId(null);
        setCertificateForm({
            certificateName: '',
            registrationNumber: '',
            verificationUrl: '',
            issueDate: '',
            issuedTo: '',
            educationIds: [],
        });
    }, []);

    const handleSaveCertificate = useCallback(async () => {
        if (!certificateForm.certificateName.trim()) {
            toast.error('Certificate name is required.');
            return;
        }
        if (!certificateForm.issuedTo.trim()) {
            toast.error('Issued to is required.');
            return;
        }
        if (!certificateForm.issueDate) {
            toast.error('Issue date is required.');
            return;
        }

        setIsSaving(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const certificateData: any = {
                certificateName: certificateForm.certificateName,
                issuedTo: certificateForm.issuedTo,
                issueDate: new Date(certificateForm.issueDate).toISOString(),
                registrationNumber: certificateForm.registrationNumber?.trim() || undefined,
                verificationUrl: certificateForm.verificationUrl?.trim() || undefined,
                // Always send the array, even if empty, to allow removing links
                educationIds: certificateForm.educationIds,
            };

            let updatedCertificate: UserComponentCertificate;
            if (editingCertificateId) {
                updatedCertificate = await UsersService.updateCertificate(userSession.user.username, editingCertificateId, certificateData);
                setCertificates(prev => prev.map(cert => {
                    const certId = cert.id;
                    return certId === editingCertificateId ? updatedCertificate : cert;
                }));
            } else {
                updatedCertificate = await UsersService.createCertificate(userSession.user.username, certificateData);
                setCertificates(prev => [...prev, updatedCertificate]);
            }

            setIsEditingCertificate(false);
            setEditingCertificateId(null);
            toast.success(`Certificate ${editingCertificateId ? 'updated' : 'created'} successfully!`);
        } catch (err: any) {
            toast.error(err.message || `Failed to ${editingCertificateId ? 'update' : 'create'} certificate. Please try again.`);
        } finally {
            setIsSaving(false);
        }
    }, [certificateForm, editingCertificateId, toast]);

    const handleDeleteCertificate = useCallback(async (certificateId: number) => {
        const confirmed = await toast.confirm(
            'Are you sure you want to delete this certificate?',
            {
                confirmText: 'Delete',
                cancelText: 'Cancel',
            }
        );

        if (!confirmed) {
            return;
        }

        setIsSaving(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await UsersService.deleteCertificate(userSession.user.username, certificateId);
            setCertificates(prev => prev.filter(cert => {
                const certId = cert.id;
                return certId !== certificateId;
            }));
            toast.success('Certificate deleted successfully!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete certificate. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [toast]);

    const handleEducationToggle = useCallback((educationId: number) => {
        setCertificateForm(prev => {
            const isSelected = prev.educationIds.includes(educationId);
            return {
                ...prev,
                educationIds: isSelected
                    ? prev.educationIds.filter(id => id !== educationId)
                    : [...prev.educationIds, educationId],
            };
        });
    }, []);

    // Profile image handlers
    const handleProfileImageClick = useCallback(() => {
        if (!uploadingProfileImage && !deletingProfileImage && user?.id) {
            profileImageInputRef.current?.click();
        }
    }, [uploadingProfileImage, deletingProfileImage, user?.id]);

    const handleProfileImageFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.id) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File too large. Maximum size is 5MB.');
            return;
        }

        setUploadingProfileImage(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const updatedUser = await ImagesService.uploadUserProfileImage(userSession.user.username, user.id, file);
            const timestamp = Date.now();
            setUser(updatedUser);
            setProfileImageTimestamp(timestamp);
            // Update localStorage with complete user data
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Add timestamp to force cache invalidation
            localStorage.setItem('profileImageUpdated', timestamp.toString());
            // Dispatch custom event to notify other components (like Header)
            window.dispatchEvent(new CustomEvent('profileImageUpdated', { 
              detail: { profileImage: updatedUser.profileImage, timestamp }
            }));
            toast.success('Profile image updated successfully!');
        } catch (err: any) {
            console.error('Error uploading profile image:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to upload profile image. Please try again.';
            toast.error(errorMessage);
        } finally {
            setUploadingProfileImage(false);
            // Reset input
            if (profileImageInputRef.current) {
                profileImageInputRef.current.value = '';
            }
        }
    }, [user?.id, toast]);

    const handleDeleteProfileImage = useCallback(async () => {
        if (!user?.profileImage || !user?.id) return;

        const confirmed = await toast.confirm(
            'Are you sure you want to remove your profile image?',
            {
                confirmText: 'Remove',
                cancelText: 'Cancel',
            }
        );

        if (!confirmed) return;

        setDeletingProfileImage(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await ImagesService.deleteUserProfileImage(userSession.user.username, user.id);
            const updatedUser = { ...user, profileImage: undefined };
            const timestamp = Date.now();
            setUser(updatedUser);
            setProfileImageTimestamp(timestamp);
            // Update localStorage with complete user data
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Add timestamp to force cache invalidation
            localStorage.setItem('profileImageUpdated', timestamp.toString());
            // Dispatch custom event to notify other components (like Header)
            window.dispatchEvent(new CustomEvent('profileImageUpdated', { 
              detail: { profileImage: undefined, timestamp }
            }));
            toast.success('Profile image removed successfully!');
        } catch (err: any) {
            console.error('Error removing profile image:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to remove profile image. Please try again.';
            toast.error(errorMessage);
        } finally {
            setDeletingProfileImage(false);
        }
    }, [user, toast]);

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'Present';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    // Helper para obter inicial do nome
    const getInitial = () => {
        if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
        if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
        if (user?.username) return user.username.charAt(0).toUpperCase();
        return 'U';
    };

    if (checkingAuth || !isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
                {/* WebGL Background - Animated 3D mesh - Hidden on mobile for performance */}
                <div className="hidden md:block">
                    <Suspense fallback={null}>
                        <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
                    </Suspense>
                </div>

                {/* Animated Background - CSS layers for depth */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Gradient Orbs - Smaller on mobile */}
                    <div
                        className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-cyan/20 rounded-full blur-3xl animate-pulse"
                        style={{
                            left: `${mousePosition.x / 20}px`,
                            top: `${mousePosition.y / 20}px`,
                            transition: 'all 0.3s ease-out',
                        }}
                    />
                    <div
                        className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-blue/20 rounded-full blur-3xl animate-pulse delay-1000"
                        style={{
                            right: `${mousePosition.x / 25}px`,
                            bottom: `${mousePosition.y / 25}px`,
                            transition: 'all 0.3s ease-out',
                        }}
                    />

                    {/* Grid Pattern - Smaller on mobile */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
                </div>

                <Header isAdmin={true} onLogout={handleLogout} />
                <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <TableSkeleton />
                    </div>
                </main>
                <Footer user={user} username={user?.username} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
            {/* WebGL Background - Animated 3D mesh - Hidden on mobile for performance */}
            <div className="hidden md:block">
                <Suspense fallback={null}>
                    <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
                </Suspense>
            </div>

            {/* Animated Background - CSS layers for depth */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Gradient Orbs - Smaller on mobile */}
                <div
                    className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-cyan/20 rounded-full blur-3xl animate-pulse"
                    style={{
                        left: `${mousePosition.x / 20}px`,
                        top: `${mousePosition.y / 20}px`,
                        transition: 'all 0.3s ease-out',
                    }}
                />
                <div
                    className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-blue/20 rounded-full blur-3xl animate-pulse delay-1000"
                    style={{
                        right: `${mousePosition.x / 25}px`,
                        bottom: `${mousePosition.y / 25}px`,
                        transition: 'all 0.3s ease-out',
                    }}
                />

                {/* Grid Pattern - Smaller on mobile */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
            </div>

            <Header isAdmin={true} onLogout={handleLogout} />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
                {/* 3D Particles in Background - Hidden on mobile for performance */}
                <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
                    <Suspense fallback={null}>
                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 75 }}
                            gl={{ alpha: true, antialias: true }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <FloatingParticles3D />
                        </Canvas>
                    </Suspense>
                </div>

                {/* 3D Logo Element (optional, subtle) - Desktop only */}
                <div className="absolute top-20 right-10 w-32 h-32 pointer-events-none opacity-20 hidden lg:block">
                    <Suspense fallback={null}>
                        <Canvas
                            camera={{ position: [0, 0, 3], fov: 75 }}
                            gl={{ alpha: true, antialias: true }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Hero3D mouse={mousePosition} windowSize={windowSize} />
                        </Canvas>
                    </Suspense>
                </div>

                <div className={`max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Breadcrumb */}
                    <nav className="mb-4 px-4 mt-4 md:mt-0">
                        <ol className="flex items-center gap-2 text-sm text-jcoder-muted">
                            <li>
                                <button onClick={() => router.push(`/${username}/admin`)} className="hover:text-jcoder-primary transition-colors group">
                                    <span className="group-hover:underline">Admin</span>
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
                    <div className="mb-2 sm:mb-4 md:mb-6 px-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-jcoder-foreground">
                                My Profile
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm md:text-base text-jcoder-muted mt-1 sm:mt-2">Manage your profile and portfolio information</p>
                    </div>

                    {/* Profile Header Card */}
                    <div
                        className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl overflow-hidden mb-4 sm:mb-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 md:hover:shadow-2xl md:hover:shadow-jcoder-primary/20 md:hover:-translate-y-1"
                        style={{
                            transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
                        }}
                    >
                        {/* Gradient Header */}
                        <div className="h-20 sm:h-24 md:h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"></div>

                        <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 sm:-mt-14 md:-mt-16 mb-4 sm:mb-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 mb-4 md:mb-0">
                                    <div className="relative group">
                                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-jcoder-card bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-jcoder-primary/50"
                                            onClick={handleProfileImageClick}
                                            title={user?.profileImage ? 'Click to change photo' : 'Click to upload photo'}
                                        >
                                        {user?.profileImage && user?.id ? (
                                            <ProfileImage
                                                src={`${ImagesService.getUserProfileImageUrl(username, user.id)}?t=${profileImageTimestamp}&v=${user.profileImage}`}
                                                alt={user.fullName || user.firstName || username}
                                                fallback={getInitial()}
                                            />
                                        ) : (
                                                <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">
                                                    {getInitial()}
                                                </span>
                                            )}
                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
                                                <div className="text-center">
                                                    {uploadingProfileImage ? (
                                                        <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    )}
                                                    <p className="text-xs text-white mt-1 font-medium">
                                                        {uploadingProfileImage ? 'Uploading...' : user?.profileImage ? 'Change' : 'Upload'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Action buttons */}
                                        {user?.profileImage && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProfileImage();
                                                }}
                                                disabled={deletingProfileImage || uploadingProfileImage}
                                                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed z-10"
                                                title="Remove profile image"
                                            >
                                                {deletingProfileImage ? (
                                                    <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground">
                                            {user?.fullName || user?.firstName || 'User'}
                                        </h2>
                                        <p className="text-xs sm:text-sm md:text-base text-jcoder-muted">{user?.email}</p>
                                        {aboutMe?.occupation && (
                                            <p className="text-xs sm:text-sm md:text-base text-jcoder-primary font-medium mt-1">
                                                {aboutMe.occupation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
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
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Username</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="username"
                                                    value={basicInfoForm.username}
                                                    onChange={handleBasicInfoInputChange}
                                                    placeholder="johndoe"
                                                    className={`w-full px-4 py-2 pr-10 bg-jcoder-secondary border rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none ${basicInfoForm.username.trim() !== (user?.username || '') && basicInfoForm.username.trim().length >= 3
                                                        ? usernameStatus.available === true
                                                            ? 'border-green-400'
                                                            : usernameStatus.available === false
                                                                ? 'border-red-400'
                                                                : 'border-jcoder'
                                                        : 'border-jcoder'
                                                        }`}
                                                />
                                                {basicInfoForm.username.trim() !== (user?.username || '') && basicInfoForm.username.trim().length >= 3 && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        {usernameStatus.checking ? (
                                                            <svg className="animate-spin h-5 w-5 text-jcoder-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : usernameStatus.available === true ? (
                                                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : usernameStatus.available === false ? (
                                                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                            {basicInfoForm.username.trim() !== (user?.username || '') && (
                                                <>
                                                    {usernameStatus.available === true && basicInfoForm.username.trim().length >= 3 && (
                                                        <p className="mt-1 text-sm text-green-400">Username available!</p>
                                                    )}
                                                    {usernameStatus.available === false && (
                                                        <p className="mt-1 text-sm text-red-400">This username is already in use</p>
                                                    )}
                                                    <p className="mt-1 text-xs text-jcoder-muted">
                                                        Minimum of 3 characters. Only letters, numbers, underscores and hyphens.
                                                    </p>
                                                </>
                                            )}
                                        </div>
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
                                                name="fullName"
                                                value={basicInfoForm.fullName}
                                                onChange={handleBasicInfoInputChange}
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Email</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={basicInfoForm.email || ''}
                                                    onChange={handleBasicInfoInputChange}
                                                    className={`w-full px-4 py-2 pr-10 bg-jcoder-secondary border rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none ${basicInfoForm.email.trim() !== (user?.email || '') && basicInfoForm.email.trim()
                                                        ? emailStatus.available === true
                                                            ? 'border-green-400'
                                                            : emailStatus.available === false
                                                                ? 'border-red-400'
                                                                : 'border-jcoder'
                                                        : 'border-jcoder'
                                                        }`}
                                                />
                                                {basicInfoForm.email.trim() !== (user?.email || '') && basicInfoForm.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfoForm.email.trim()) && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        {emailStatus.checking ? (
                                                            <svg className="animate-spin h-5 w-5 text-jcoder-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : emailStatus.available === true ? (
                                                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : emailStatus.available === false ? (
                                                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        ) : null}
                                                    </div>
                                                )}
                                                {isEmailVerified && basicInfoForm.email.trim() === (user?.email || '') && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-h-[60px]">
                                                {basicInfoForm.email.trim() !== (user?.email || '') && (
                                                    <>
                                                        {emailStatus.available === true && basicInfoForm.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfoForm.email.trim()) && (
                                                            <p className="mt-1 text-sm text-green-400">Email available!</p>
                                                        )}
                                                        {emailStatus.available === false && (
                                                            <p className="mt-1 text-sm text-red-400">This email is already in use</p>
                                                        )}
                                                    </>
                                                )}
                                                {isEmailVerified && basicInfoForm.email.trim() === (user?.email || '') && (
                                                    <p className="mt-1 text-sm text-green-400">Email verified</p>
                                                )}

                                                {/* Email Verification Section - Compact */}
                                                {basicInfoForm.email.trim() !== (user?.email || '') && emailStatus.available === true && (
                                                    <div className="mt-3 space-y-2">
                                                        {!isEmailVerified && (
                                                            <>
                                                                {!codeSent ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleSendVerificationCode}
                                                                        disabled={isSendingCode || emailStatus.available !== true}
                                                                        className="text-sm px-3 py-1.5 bg-jcoder-primary/10 text-jcoder-primary rounded-lg hover:bg-jcoder-primary/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        {isSendingCode ? 'Sending...' : 'Send code'}
                                                                    </button>
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        <div className="flex gap-2 items-center">
                                                                            <input
                                                                                type="text"
                                                                                value={verificationCode}
                                                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                                                                placeholder="000000"
                                                                                maxLength={6}
                                                                                disabled={isVerifyingCode || isEmailVerified}
                                                                                className="w-36 px-3 py-1.5 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none disabled:opacity-60 text-center text-lg tracking-widest"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleVerifyCode}
                                                                                disabled={isVerifyingCode || verificationCode.length !== 6 || isEmailVerified}
                                                                                className="px-3 py-1.5 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                                            >
                                                                                {isVerifyingCode ? 'Verifying...' : 'Verify'}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleSendVerificationCode}
                                                                                disabled={isSendingCode}
                                                                                className="text-xs text-jcoder-primary hover:text-jcoder-accent transition-colors disabled:opacity-50"
                                                                            >
                                                                                {isSendingCode ? 'Sending...' : 'Resend'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        {isEmailVerified && (
                                                            <div className="flex items-center gap-1.5 text-xs text-green-400">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span>Email verified</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleCancelBasicInfo}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveBasicInfo}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <InfoField
                                        label="Username"
                                        value={user?.username}
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                    />
                                    <InfoField
                                        label="First Name"
                                        value={user?.firstName}
                                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                    />
                                    <InfoField
                                        label="Full Name"
                                        value={user?.fullName}
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
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleCancelAboutMe}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveAboutMe}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : aboutMe ? (
                                <div className="space-y-4">
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
                            action={
                                !isEditingEducation && (
                                    <button
                                        onClick={handleAddEducation}
                                        className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                    >
                                        Add Education
                                    </button>
                                )
                            }
                            collapsible={true}
                            isEmpty={educations.length === 0 && !isEditingEducation}
                            emptyMessage="No education records added yet"
                        >
                            {isEditingEducation ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Institution Name *</label>
                                            <input
                                                type="text"
                                                name="institutionName"
                                                value={educationForm.institutionName}
                                                onChange={handleEducationInputChange}
                                                placeholder="e.g., University of Technology"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Course Name *</label>
                                            <input
                                                type="text"
                                                name="courseName"
                                                value={educationForm.courseName}
                                                onChange={handleEducationInputChange}
                                                placeholder="e.g., Computer Science"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Degree (Optional)</label>
                                            <input
                                                type="text"
                                                name="degree"
                                                value={educationForm.degree}
                                                onChange={handleEducationInputChange}
                                                placeholder="e.g., Bachelor's Degree"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Start Date *</label>
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={educationForm.startDate}
                                                onChange={handleEducationInputChange}
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">
                                                End Date {educationForm.isCurrentlyStudying ? '(Optional)' : '*'}
                                            </label>
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={educationForm.endDate}
                                                onChange={handleEducationInputChange}
                                                disabled={educationForm.isCurrentlyStudying}
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="isCurrentlyStudying"
                                                    checked={educationForm.isCurrentlyStudying}
                                                    onChange={handleEducationInputChange}
                                                    className="w-4 h-4 text-jcoder-primary bg-jcoder-secondary border-jcoder rounded focus:ring-jcoder-primary"
                                                />
                                                <span className="text-sm font-medium text-jcoder-foreground">Currently studying</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleCancelEducation}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveEducation}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            {isSaving ? 'Saving...' : editingEducationId ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {educations.map((edu, index) => {
                                        const educationId = edu.id;
                                        return (
                                            <div key={educationId || index} className="group relative">
                                                <TimelineItem
                                                    title={edu.courseName}
                                                    subtitle={edu.institutionName}
                                                    period={`${formatDate(edu.startDate)} - ${edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}`}
                                                    isActive={edu.isCurrentlyStudying}
                                                    tags={edu.degree ? [edu.degree] : undefined}
                                                />
                                                <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditEducation(edu)}
                                                        className="p-2 bg-jcoder-secondary border border-jcoder rounded-lg hover:border-jcoder-primary transition-colors"
                                                        title="Edit education"
                                                    >
                                                        <svg className="w-4 h-4 text-jcoder-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {educationId && (
                                                        <button
                                                            onClick={() => handleDeleteEducation(educationId)}
                                                            className="p-2 bg-jcoder-secondary border border-red-500/50 rounded-lg hover:border-red-500 transition-colors"
                                                            title="Delete education"
                                                        >
                                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </SectionCard>

                        {/* Experience Section */}
                        <SectionCard
                            title="Professional Experience"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            action={
                                !isEditingExperience && (
                                    <button
                                        onClick={handleAddExperience}
                                        className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                    >
                                        Add Experience
                                    </button>
                                )
                            }
                            collapsible={true}
                            isEmpty={experiences.length === 0 && !isEditingExperience}
                            emptyMessage="No professional experience added yet"
                        >
                            {isEditingExperience ? (
                                <div className="space-y-6">
                                    {/* Company Form */}
                                    <div className="p-4 bg-jcoder-secondary rounded-lg border border-jcoder">
                                        <h4 className="text-base font-semibold text-jcoder-foreground mb-4">
                                            {editingExperienceId ? 'Edit Company' : 'Add Company'}
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-jcoder-muted mb-2">Company Name *</label>
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    value={experienceForm.companyName}
                                                    onChange={handleExperienceInputChange}
                                                    placeholder="e.g., Tech Company Inc."
                                                    className="w-full px-4 py-2 bg-jcoder-background border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                                />
                                            </div>

                                            {/* Action Buttons for Company */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-jcoder">
                                                <button
                                                    onClick={handleCancelExperience}
                                                    disabled={isSaving}
                                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors text-sm sm:text-base"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveExperience}
                                                    disabled={isSaving}
                                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm sm:text-base"
                                                >
                                                    {isSaving ? 'Saving...' : editingExperienceId ? 'Update Company' : 'Create Company'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Positions Management - Only show if company is saved/being edited */}
                                    {editingExperienceId && (
                                        <div className="p-4 bg-jcoder-secondary rounded-lg border border-jcoder">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-base font-semibold text-jcoder-foreground">Positions</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddPosition(editingExperienceId)}
                                                    className="px-3 py-1.5 text-sm bg-jcoder-primary/10 text-jcoder-primary rounded-lg hover:bg-jcoder-primary/20 transition-colors font-medium flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add Position
                                                </button>
                                            </div>

                                            {/* Position Form - Show when adding or editing a position */}
                                            {(isAddingPosition || editingPositionIndex !== null) && (
                                                <div className="mb-4 p-4 bg-jcoder-background rounded-lg border border-jcoder">
                                                    <h5 className="text-sm font-semibold text-jcoder-foreground mb-3">
                                                        {editingPositionIndex !== null ? 'Edit Position' : 'New Position'}
                                                    </h5>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-jcoder-muted mb-1">Position Title *</label>
                                                            <input
                                                                type="text"
                                                                name="position"
                                                                value={positionForm.position}
                                                                onChange={handlePositionInputChange}
                                                                placeholder="e.g., Senior Software Engineer"
                                                                className="w-full px-3 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none text-sm"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-jcoder-muted mb-1">Start Date *</label>
                                                                <input
                                                                    type="date"
                                                                    name="startDate"
                                                                    value={positionForm.startDate}
                                                                    onChange={handlePositionInputChange}
                                                                    className="w-full px-3 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-jcoder-muted mb-1">
                                                                    End Date {positionForm.isCurrentPosition ? '(Optional)' : '*'}
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    name="endDate"
                                                                    value={positionForm.endDate}
                                                                    onChange={handlePositionInputChange}
                                                                    disabled={positionForm.isCurrentPosition}
                                                                    className="w-full px-3 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-jcoder-muted mb-1">Location (Optional)</label>
                                                                <input
                                                                    type="text"
                                                                    name="location"
                                                                    value={positionForm.location}
                                                                    onChange={handlePositionInputChange}
                                                                    placeholder="e.g., São Paulo, Brazil"
                                                                    className="w-full px-3 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none text-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-jcoder-muted mb-1">Location Type (Optional)</label>
                                                                <select
                                                                    name="locationType"
                                                                    value={positionForm.locationType}
                                                                    onChange={handlePositionInputChange}
                                                                    className="w-full px-3 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none text-sm"
                                                                >
                                                                    <option value="">Select type</option>
                                                                    <option value={WorkLocationTypeEnum.REMOTE}>Remote</option>
                                                                    <option value={WorkLocationTypeEnum.HYBRID}>Hybrid</option>
                                                                    <option value={WorkLocationTypeEnum.IN_PERSON}>In Person</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    name="isCurrentPosition"
                                                                    checked={positionForm.isCurrentPosition}
                                                                    onChange={handlePositionInputChange}
                                                                    className="w-4 h-4 text-jcoder-primary bg-jcoder-secondary border-jcoder rounded focus:ring-jcoder-primary"
                                                                />
                                                                <span className="text-xs font-medium text-jcoder-foreground">Currently working in this position</span>
                                                            </label>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                                                            <button
                                                                onClick={handleCancelPosition}
                                                                disabled={isSaving}
                                                                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleSavePosition(editingExperienceId)}
                                                                disabled={isSaving}
                                                                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                                                            >
                                                                {isSaving ? 'Saving...' : editingPositionIndex !== null ? 'Update' : 'Add'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Existing Positions List */}
                                            {(() => {
                                                const currentExp = experiences.find(e => e.id === editingExperienceId);
                                                const positions = currentExp?.positions || [];
                                                if (positions.length === 0 && !isAddingPosition && editingPositionIndex === null) {
                                                    return (
                                                        <p className="text-sm text-jcoder-muted italic">No positions added yet. Click "Add Position" to get started.</p>
                                                    );
                                                }
                                                return (
                                                    <div className="space-y-3">
                                                        {positions.map((position, pIndex) => (
                                                            <div key={pIndex} className="group relative p-3 bg-jcoder-background rounded-lg border border-jcoder">
                                                                {editingPositionIndex === pIndex ? null : (
                                                                    <>
                                                                        <div className="flex items-start justify-between mb-2">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <h5 className="text-sm font-semibold text-jcoder-foreground">
                                                                                        {position.position}
                                                                                    </h5>
                                                                                    {position.isCurrentPosition && (
                                                                                        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded-full">Current</span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-xs text-jcoder-muted mt-1">
                                                                                    {formatDate(position.startDate)} - {position.isCurrentPosition ? 'Present' : formatDate(position.endDate)}
                                                                                </p>
                                                                                {position.location && (
                                                                                    <p className="text-xs text-jcoder-muted mt-1">
                                                                                        {position.location} {position.locationType && `• ${position.locationType}`}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button
                                                                                    onClick={() => handleEditPosition(editingExperienceId, pIndex)}
                                                                                    className="p-1.5 bg-jcoder-secondary border border-jcoder rounded hover:border-jcoder-primary transition-colors"
                                                                                    title="Edit position"
                                                                                >
                                                                                    <svg className="w-3.5 h-3.5 text-jcoder-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                    </svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeletePosition(editingExperienceId, pIndex)}
                                                                                    className="p-1.5 bg-jcoder-secondary border border-red-500/50 rounded hover:border-red-500 transition-colors"
                                                                                    title="Delete position"
                                                                                >
                                                                                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {experiences.map((exp, index) => (
                                        <div key={exp.id || index} className="group relative">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="text-lg font-semibold text-jcoder-foreground">{exp.companyName}</h4>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditExperience(exp)}
                                                        className="p-2 bg-jcoder-secondary border border-jcoder rounded-lg hover:border-jcoder-primary transition-colors"
                                                        title="Edit experience"
                                                    >
                                                        <svg className="w-4 h-4 text-jcoder-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExperience(exp.id)}
                                                        className="p-2 bg-jcoder-secondary border border-red-500/50 rounded-lg hover:border-red-500 transition-colors"
                                                        title="Delete experience"
                                                    >
                                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            {exp.positions && exp.positions.length > 0 ? (
                                                <div className="space-y-3">
                                                    {exp.positions.map((position, pIndex) => (
                                                        <TimelineItem
                                                            key={pIndex}
                                                            title={position.position || 'Position'}
                                                            period={`${formatDate(position.startDate)} - ${position.isCurrentPosition ? 'Present' : formatDate(position.endDate)}`}
                                                            isActive={position.isCurrentPosition}
                                                            tags={position.location ? [position.location, position.locationType].filter((t): t is string => Boolean(t)) : undefined}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-jcoder-muted italic">No positions added for this company yet.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        {/* Certificates Section */}
                        <SectionCard
                            title="Certifications"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                            action={
                                !isEditingCertificate && (
                                    <button
                                        onClick={handleAddCertificate}
                                        className="px-3 py-1.5 md:px-4 md:py-2 text-sm bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                    >
                                        Add Certificate
                                    </button>
                                )
                            }
                            collapsible={true}
                            isEmpty={certificates.length === 0 && !isEditingCertificate}
                            emptyMessage="No certificates added yet"
                        >
                            {isEditingCertificate ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Certificate Name *</label>
                                            <input
                                                type="text"
                                                name="certificateName"
                                                value={certificateForm.certificateName}
                                                onChange={handleCertificateInputChange}
                                                placeholder="e.g., AWS Certified Solutions Architect"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Issued To *</label>
                                            <input
                                                type="text"
                                                name="issuedTo"
                                                value={certificateForm.issuedTo}
                                                onChange={handleCertificateInputChange}
                                                placeholder="e.g., John Doe"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Issue Date *</label>
                                            <input
                                                type="date"
                                                name="issueDate"
                                                value={certificateForm.issueDate}
                                                onChange={handleCertificateInputChange}
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Registration Number (Optional)</label>
                                            <input
                                                type="text"
                                                name="registrationNumber"
                                                value={certificateForm.registrationNumber}
                                                onChange={handleCertificateInputChange}
                                                placeholder="e.g., AWS-1234567890"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-jcoder-muted mb-2">Verification URL (Optional)</label>
                                            <input
                                                type="url"
                                                name="verificationUrl"
                                                value={certificateForm.verificationUrl}
                                                onChange={handleCertificateInputChange}
                                                placeholder="https://verify.credential.com/certificate/123456"
                                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:border-jcoder-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Education Link Section */}
                                    {educations.length > 0 && (
                                        <div className="pt-4 border-t border-jcoder">
                                            <h4 className="text-base font-semibold text-jcoder-foreground mb-3">Link to Education (Optional)</h4>
                                            <p className="text-sm text-jcoder-muted mb-3">Select education records to link this certificate to:</p>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {educations.map((edu) => {
                                                    const educationId = edu.id;
                                                    if (educationId === undefined) return null;
                                                    const isSelected = certificateForm.educationIds.includes(educationId);
                                                    return (
                                                        <label
                                                            key={educationId}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                                ? 'bg-jcoder-primary/10 border-jcoder-primary'
                                                                : 'bg-jcoder-secondary border-jcoder hover:border-jcoder-primary/50'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleEducationToggle(educationId)}
                                                                className="w-4 h-4 text-jcoder-primary bg-jcoder-secondary border-jcoder rounded focus:ring-jcoder-primary"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-jcoder-foreground">{edu.courseName}</p>
                                                                <p className="text-xs text-jcoder-muted">{edu.institutionName}</p>
                                                                {edu.degree && (
                                                                    <p className="text-xs text-jcoder-muted">{edu.degree}</p>
                                                                )}
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                                        <button
                                            onClick={handleCancelCertificate}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveCertificate}
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 text-sm sm:text-base"
                                        >
                                            {isSaving ? 'Saving...' : editingCertificateId ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certificates.map((cert, index) => {
                                        const certificateId = cert.id;
                                        return (
                                            <div key={certificateId || index} className="group relative p-4 bg-jcoder-secondary rounded-lg border border-jcoder hover:border-jcoder-primary transition-all">
                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditCertificate(cert)}
                                                        className="p-2 bg-jcoder-background border border-jcoder rounded-lg hover:border-jcoder-primary transition-colors"
                                                        title="Edit certificate"
                                                    >
                                                        <svg className="w-4 h-4 text-jcoder-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    {certificateId && (
                                                        <button
                                                            onClick={() => handleDeleteCertificate(certificateId)}
                                                            className="p-2 bg-jcoder-background border border-red-500/50 rounded-lg hover:border-red-500 transition-colors"
                                                            title="Delete certificate"
                                                        >
                                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                                <h4 className="text-base font-semibold text-jcoder-foreground mb-2 pr-12">{cert.certificateName}</h4>
                                                <p className="text-sm text-jcoder-muted mb-2">Issued to: {cert.issuedTo}</p>
                                                <p className="text-xs text-jcoder-muted mb-2">Issued: {formatDate(cert.issueDate)}</p>
                                                {cert.registrationNumber && (
                                                    <p className="text-xs text-jcoder-muted mb-2">Registration: {cert.registrationNumber}</p>
                                                )}
                                                {cert.educations && cert.educations.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-xs font-medium text-jcoder-muted mb-1">Linked to Education:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {cert.educations.map((edu, eduIndex) => (
                                                                <span key={eduIndex} className="px-2 py-0.5 text-xs bg-jcoder-primary/10 text-jcoder-primary rounded-full">
                                                                    {edu.institutionName}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {cert.verificationUrl && (
                                                    <a
                                                        href={cert.verificationUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-jcoder-primary hover:underline mt-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        Verify Certificate
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>
            </main>

            <Footer user={user} username={user?.username} />

            {/* Hidden file input for profile image */}
            <input
                ref={profileImageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleProfileImageFileSelect}
                className="hidden"
                disabled={uploadingProfileImage || deletingProfileImage}
            />

            <style jsx>{`
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
}

// Profile Image Component - Same implementation as portfolio page
interface ProfileImageProps {
    src: string;
    alt: string;
    fallback: string;
}

function ProfileImage({ src, alt, fallback }: ProfileImageProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);

    // Debug: Log when component mounts and src changes
    useEffect(() => {
        console.log('[ProfileImage] Component mounted/updated:', {
            src,
            hasError,
            isLoading
        });

        // Reset states
        setHasError(false);
        setIsLoading(true);

        // Force image reload if src changes by setting src to empty first, then to new src
        // This ensures the browser doesn't use cached version
        if (imgRef.current && src) {
            // Clear src first to force reload
            imgRef.current.src = '';
            // Use setTimeout to ensure the clear happens before setting new src
            setTimeout(() => {
                if (imgRef.current) {
                    imgRef.current.src = src;
                }
            }, 0);
        }
    }, [src]);

    const handleLoad = () => {
        console.log('[ProfileImage] Image loaded successfully:', src);
        setIsLoading(false);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error('[ProfileImage] Image failed to load:', {
            src,
            error: e,
            target: e.currentTarget,
            naturalWidth: e.currentTarget.naturalWidth,
            naturalHeight: e.currentTarget.naturalHeight
        });
        setIsLoading(false);
        setHasError(true);
    };

    // Show fallback if error occurred
    if (hasError) {
        console.log('[ProfileImage] Showing fallback for:', fallback);
        return (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-jcoder-gradient rounded-full z-10">
                <span className="text-black font-bold text-4xl">
                    {fallback}
                </span>
            </div>
        );
    }

    return (
        <>
            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 bg-jcoder-secondary animate-pulse rounded-full z-0" />
            )}

            {/* Actual image */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className={`absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-300 z-10 ${isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                onLoad={handleLoad}
                onError={handleError}
                loading="eager"
                decoding="async"
                crossOrigin="anonymous"
            />
        </>
    );
}
