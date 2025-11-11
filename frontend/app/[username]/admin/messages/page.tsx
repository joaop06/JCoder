'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { ConversationResponseDto, Message } from '@/types/api/messages';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from 'react';
import { UsersService } from '@/services/administration-by-user/users.service';
import { MessagesService } from '@/services/administration-by-user/messages.service';
import { Canvas } from '@react-three/fiber';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';

export default function MessagesManagementPage() {
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
    const [conversations, setConversations] = useState<ConversationResponseDto[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ConversationResponseDto | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState(false);

    // Mobile view state - show conversations list or messages view
    const [mobileView, setMobileView] = useState<'conversations' | 'messages'>('conversations');

    // WebGL and animation states
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
    const [isVisible, setIsVisible] = useState(false);

    // Refs for mouse position throttling
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toast = useToast();

    useEffect(() => {
        setIsVisible(true);

        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePositionRef.current = { x: e.clientX, y: e.clientY };

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

        const loadUserProfile = async () => {
            try {
                if (username) {
                    const userProfile = await UsersService.getProfile(username);
                    setUser(userProfile);
                } else {
                    const userSession = UsersService.getUserSession();
                    if (userSession?.user) {
                        setUser(userSession.user);
                    }
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
                const userSession = UsersService.getUserSession();
                if (userSession?.user) {
                    setUser(userSession.user);
                }
            }
        };

        setIsAuthenticated(true);
        setCheckingAuth(false);
        loadUserProfile();
    }, [router, username]);

    const fetchConversations = useCallback(async () => {
        setLoading(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const data = await MessagesService.findAllConversations(userSession.user.username);
            // Ensure data is always an array
            setConversations(Array.isArray(data) ? data : []);
        } catch (err: any) {
            const errorMessage = 'Failed to load conversations. Please try again.';
            toast.error(errorMessage);
            console.error('Error fetching conversations:', err);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchMessages = useCallback(async (conversationId: number) => {
        setLoadingMessages(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const data = await MessagesService.findMessagesByConversation(
                userSession.user.username,
                conversationId,
            );
            // Ensure data is always an array
            setMessages(Array.isArray(data) ? data : []);

            // Auto-scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err: any) {
            toast.error('Failed to load messages. Please try again.');
            console.error('Error fetching messages:', err);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, [toast]);

    const markAsRead = useCallback(async (conversationId: number) => {
        if (markingAsRead) return;

        setMarkingAsRead(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await MessagesService.markMessagesAsRead(userSession.user.username, conversationId);
            
            // Refresh conversations to update unread count
            await fetchConversations();
            
            // Update local messages state
            setMessages(prev => prev.map(msg => ({
                ...msg,
                readAt: msg.readAt || new Date().toISOString(),
            })));
        } catch (err: any) {
            toast.error('Failed to mark messages as read.');
            console.error('Error marking messages as read:', err);
        } finally {
            setMarkingAsRead(false);
        }
    }, [toast, fetchConversations, markingAsRead]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchConversations();
    }, [isAuthenticated, fetchConversations]);

    const handleSelectConversation = useCallback(async (conversation: ConversationResponseDto) => {
        setSelectedConversation(conversation);
        await fetchMessages(conversation.id);
        
        // Mark as read if there are unread messages
        if (conversation.unreadCount > 0) {
            await markAsRead(conversation.id);
        }

        // On mobile, switch to messages view
        if (windowSize.width < 768) {
            setMobileView('messages');
        }
    }, [fetchMessages, markAsRead, windowSize.width]);

    const handleBackToConversations = useCallback(() => {
        setMobileView('conversations');
        setSelectedConversation(null);
        setMessages([]);
    }, []);

    const formatDate = useCallback((date: Date | string | undefined): string => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.getTime() === today.getTime()) {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
        }
    }, []);

    const formatMessageTime = useCallback((date: Date | string | undefined): string => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }, []);

    const getInitials = useCallback((name: string): string => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        router.push('/');
    }, [router]);

    if (checkingAuth || !isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
                <div className="hidden md:block">
                    <Suspense fallback={null}>
                        <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
                    </Suspense>
                </div>

                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
                </div>

                <Header isAdmin={true} onLogout={handleLogout} />
                <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-8 sm:h-10 w-48 sm:w-64 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                        <div className="h-3 sm:h-4 w-64 sm:w-96 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                    </div>
                </main>
                <Footer user={user} username={username || user?.username} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
            {/* WebGL Background - Hidden on mobile */}
            <div className="hidden md:block">
                <Suspense fallback={null}>
                    <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
                </Suspense>
            </div>

            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
            </div>

            <Header isAdmin={true} onLogout={handleLogout} />

            <main className="flex-1 container mx-auto px-0 sm:px-4 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
                <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Breadcrumb - Desktop only */}
                    <nav className="hidden md:block mb-4 px-4">
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
                            <li className="text-jcoder-foreground font-medium">Messages</li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-4 sm:mb-6 px-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient">
                                Messages
                            </h1>
                            {conversations.length > 0 && (() => {
                                const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
                                return totalUnread > 0 ? (
                                    <span className="px-2.5 py-1 rounded-full bg-jcoder-primary text-black text-xs font-bold">
                                        {totalUnread > 99 ? '99+' : totalUnread}
                                    </span>
                                ) : null;
                            })()}
                        </div>
                        <p className="text-xs sm:text-sm md:text-base text-jcoder-muted mt-1 sm:mt-2">Manage and view messages from your portfolio visitors</p>
                    </div>

                    {/* Messages Container - WhatsApp-like layout */}
                    <div className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl overflow-hidden shadow-xl shadow-jcoder-primary/10 h-[calc(100vh-12rem)] sm:h-[calc(100vh-14rem)] md:h-[calc(100vh-16rem)] flex flex-col">
                        {/* Desktop: Side-by-side layout */}
                        <div className="hidden md:flex flex-1 overflow-hidden">
                            {/* Conversations Sidebar */}
                            <div className="w-80 border-r border-jcoder flex flex-col bg-jcoder-secondary/30">
                                {/* Conversations Header */}
                                <div className="p-4 border-b border-jcoder bg-jcoder-card/50">
                                    <h2 className="text-lg font-semibold text-jcoder-foreground">Conversations</h2>
                                    <p className="text-xs text-jcoder-muted mt-1">
                                        {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                                    </p>
                                </div>

                                {/* Conversations List */}
                                <div className="flex-1 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-jcoder-card/50 rounded-lg animate-pulse">
                                                    <div className="w-12 h-12 rounded-full bg-jcoder-secondary"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 w-24 bg-jcoder-secondary rounded mb-2"></div>
                                                        <div className="h-3 w-full bg-jcoder-secondary rounded"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <svg className="w-16 h-16 mx-auto text-jcoder-muted/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-jcoder-muted">No conversations yet</p>
                                            <p className="text-sm text-jcoder-muted/70 mt-1">Messages from your portfolio will appear here</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-jcoder/50">
                                            {conversations.map((conversation) => (
                                                <button
                                                    key={conversation.id}
                                                    onClick={() => handleSelectConversation(conversation)}
                                                    className={`w-full p-4 text-left hover:bg-jcoder-card/50 transition-colors ${
                                                        selectedConversation?.id === conversation.id ? 'bg-jcoder-card border-l-4 border-jcoder-primary' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Avatar */}
                                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-jcoder-gradient flex items-center justify-center text-black font-semibold text-sm">
                                                            {getInitials(conversation.senderName)}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h3 className="font-semibold text-sm text-jcoder-foreground truncate">
                                                                    {conversation.senderName}
                                                                </h3>
                                                                {conversation.lastMessageAt && (
                                                                    <span className="text-xs text-jcoder-muted flex-shrink-0 ml-2">
                                                                        {formatDate(conversation.lastMessageAt)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-xs text-jcoder-muted truncate flex-1">
                                                                    {conversation.lastMessagePreview || 'No messages'}
                                                                </p>
                                                                {conversation.unreadCount > 0 && (
                                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-jcoder-primary text-black text-xs font-bold flex items-center justify-center">
                                                                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 flex flex-col bg-jcoder-card/30">
                                {selectedConversation ? (
                                    <>
                                        {/* Messages Header */}
                                        <div className="p-4 border-b border-jcoder bg-jcoder-card/50 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-jcoder-gradient flex items-center justify-center text-black font-semibold text-sm">
                                                {getInitials(selectedConversation.senderName)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-jcoder-foreground">{selectedConversation.senderName}</h3>
                                                <p className="text-xs text-jcoder-muted">{selectedConversation.senderEmail}</p>
                                            </div>
                                        </div>

                                        {/* Messages List */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {loadingMessages ? (
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="flex justify-start">
                                                            <div className="max-w-xs lg:max-w-md bg-jcoder-secondary rounded-2xl p-3 animate-pulse">
                                                                <div className="h-4 w-full bg-jcoder-card rounded mb-2"></div>
                                                                <div className="h-4 w-3/4 bg-jcoder-card rounded"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <svg className="w-16 h-16 mx-auto text-jcoder-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <p className="text-jcoder-muted">No messages in this conversation</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {messages.map((message, index) => {
                                                        const isRead = !!message.readAt;
                                                        const prevMessage = index > 0 ? messages[index - 1] : null;
                                                        const showDateSeparator = !prevMessage || 
                                                            (() => {
                                                                const currentDate = new Date(message.createdAt);
                                                                const prevDate = new Date(prevMessage.createdAt);
                                                                return currentDate.toDateString() !== prevDate.toDateString();
                                                            })();

                                                        return (
                                                            <div key={message.id}>
                                                                {showDateSeparator && (
                                                                    <div className="flex items-center justify-center my-4">
                                                                        <div className="px-3 py-1 bg-jcoder-secondary/50 rounded-full">
                                                                            <span className="text-xs text-jcoder-muted font-medium">
                                                                                {(() => {
                                                                                    const d = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;
                                                                                    const now = new Date();
                                                                                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                                                    const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                                                                                    const yesterday = new Date(today);
                                                                                    yesterday.setDate(yesterday.getDate() - 1);

                                                                                    if (messageDate.getTime() === today.getTime()) {
                                                                                        return 'Today';
                                                                                    } else if (messageDate.getTime() === yesterday.getTime()) {
                                                                                        return 'Yesterday';
                                                                                    } else {
                                                                                        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
                                                                                    }
                                                                                })()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-start">
                                                                    <div className="max-w-xs lg:max-w-md bg-jcoder-secondary rounded-2xl p-3 relative group hover:bg-jcoder-secondary/80 transition-colors">
                                                                        <p className="text-sm text-jcoder-foreground whitespace-pre-wrap break-words">
                                                                            {message.message}
                                                                        </p>
                                                                        <div className="flex items-center justify-end gap-2 mt-2">
                                                                            <span className="text-xs text-jcoder-muted">
                                                                                {formatMessageTime(message.createdAt)}
                                                                            </span>
                                                                            {isRead && (
                                                                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <svg className="w-24 h-24 mx-auto text-jcoder-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-jcoder-muted text-lg font-medium">Select a conversation</p>
                                            <p className="text-sm text-jcoder-muted/70 mt-1">Choose a conversation from the list to view messages</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile: Stacked layout with view switching */}
                        <div className="md:hidden flex-1 flex flex-col overflow-hidden">
                            {mobileView === 'conversations' ? (
                                <>
                                    {/* Conversations Header */}
                                    <div className="p-4 border-b border-jcoder bg-jcoder-card/50">
                                        <h2 className="text-lg font-semibold text-jcoder-foreground">Conversations</h2>
                                        <p className="text-xs text-jcoder-muted mt-1">
                                            {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                                        </p>
                                    </div>

                                    {/* Conversations List */}
                                    <div className="flex-1 overflow-y-auto">
                                        {loading ? (
                                            <div className="p-4 space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-jcoder-card/50 rounded-lg animate-pulse">
                                                        <div className="w-12 h-12 rounded-full bg-jcoder-secondary"></div>
                                                        <div className="flex-1">
                                                            <div className="h-4 w-24 bg-jcoder-secondary rounded mb-2"></div>
                                                            <div className="h-3 w-full bg-jcoder-secondary rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : conversations.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <svg className="w-16 h-16 mx-auto text-jcoder-muted/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <p className="text-jcoder-muted">No conversations yet</p>
                                                <p className="text-sm text-jcoder-muted/70 mt-1">Messages from your portfolio will appear here</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-jcoder/50">
                                                {conversations.map((conversation) => (
                                                    <button
                                                        key={conversation.id}
                                                        onClick={() => handleSelectConversation(conversation)}
                                                        className="w-full p-4 text-left hover:bg-jcoder-card/50 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-jcoder-gradient flex items-center justify-center text-black font-semibold text-sm">
                                                                {getInitials(conversation.senderName)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h3 className="font-semibold text-sm text-jcoder-foreground truncate">
                                                                        {conversation.senderName}
                                                                    </h3>
                                                                    {conversation.lastMessageAt && (
                                                                        <span className="text-xs text-jcoder-muted flex-shrink-0 ml-2">
                                                                            {formatDate(conversation.lastMessageAt)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-xs text-jcoder-muted truncate flex-1">
                                                                        {conversation.lastMessagePreview || 'No messages'}
                                                                    </p>
                                                                    {conversation.unreadCount > 0 && (
                                                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-jcoder-primary text-black text-xs font-bold flex items-center justify-center">
                                                                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Messages Header with Back Button */}
                                    <div className="p-4 border-b border-jcoder bg-jcoder-card/50 flex items-center gap-3">
                                        <button
                                            onClick={handleBackToConversations}
                                            className="p-2 hover:bg-jcoder-secondary rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-jcoder-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        {selectedConversation && (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-jcoder-gradient flex items-center justify-center text-black font-semibold text-sm">
                                                    {getInitials(selectedConversation.senderName)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-jcoder-foreground">{selectedConversation.senderName}</h3>
                                                    <p className="text-xs text-jcoder-muted">{selectedConversation.senderEmail}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Messages List */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {loadingMessages ? (
                                            <div className="space-y-3">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex justify-start">
                                                        <div className="max-w-xs bg-jcoder-secondary rounded-2xl p-3 animate-pulse">
                                                            <div className="h-4 w-full bg-jcoder-card rounded mb-2"></div>
                                                            <div className="h-4 w-3/4 bg-jcoder-card rounded"></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center py-12">
                                                <svg className="w-16 h-16 mx-auto text-jcoder-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <p className="text-jcoder-muted">No messages in this conversation</p>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((message, index) => {
                                                    const isRead = !!message.readAt;
                                                    const prevMessage = index > 0 ? messages[index - 1] : null;
                                                    const showDateSeparator = !prevMessage || 
                                                        (() => {
                                                            const currentDate = new Date(message.createdAt);
                                                            const prevDate = new Date(prevMessage.createdAt);
                                                            return currentDate.toDateString() !== prevDate.toDateString();
                                                        })();

                                                    return (
                                                        <div key={message.id}>
                                                            {showDateSeparator && (
                                                                <div className="flex items-center justify-center my-4">
                                                                    <div className="px-3 py-1 bg-jcoder-secondary/50 rounded-full">
                                                                        <span className="text-xs text-jcoder-muted font-medium">
                                                                            {(() => {
                                                                                const d = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;
                                                                                const now = new Date();
                                                                                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                                                                const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                                                                                const yesterday = new Date(today);
                                                                                yesterday.setDate(yesterday.getDate() - 1);

                                                                                if (messageDate.getTime() === today.getTime()) {
                                                                                    return 'Today';
                                                                                } else if (messageDate.getTime() === yesterday.getTime()) {
                                                                                    return 'Yesterday';
                                                                                } else {
                                                                                    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
                                                                                }
                                                                            })()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-start">
                                                                <div className="max-w-[85%] bg-jcoder-secondary rounded-2xl p-3 relative hover:bg-jcoder-secondary/80 transition-colors">
                                                                    <p className="text-sm text-jcoder-foreground whitespace-pre-wrap break-words">
                                                                        {message.message}
                                                                    </p>
                                                                    <div className="flex items-center justify-end gap-2 mt-2">
                                                                        <span className="text-xs text-jcoder-muted">
                                                                            {formatMessageTime(message.createdAt)}
                                                                        </span>
                                                                        {isRead && (
                                                                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer user={user} username={username || user?.username} />

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

