'use client';

import { Technology } from '@/types';
import LazyImage from '@/components/ui/LazyImage';
import { useState, useEffect, useMemo } from 'react';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { TechnologiesService } from '@/services/administration-by-user/technologies.service';

interface TechnologySelectorProps {
    selectedTechnologyIds: number[];
    onSelectionChange: (technologyIds: number[]) => void;
    disabled?: boolean;
}

export default function TechnologySelector({
    selectedTechnologyIds,
    onSelectionChange,
    disabled = false,
}: TechnologySelectorProps) {
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const loadTechnologies = async () => {
            setLoading(true);
            try {
                const userSession = UsersService.getUserSession();
                if (!userSession?.user?.username) {
                    throw new Error('User session not found');
                }
                const response = await TechnologiesService.findAll(userSession.user.username, {
                    limit: 100,
                    sortBy: 'name',
                    sortOrder: 'ASC',
                });
                setTechnologies(response.data || []);
            } catch (error) {
                console.error('Failed to load technologies:', error);
                setTechnologies([]);
            } finally {
                setLoading(false);
            }
        };

        loadTechnologies();
    }, []);

    const filteredTechnologies = useMemo(() => {
        if (!searchTerm.trim()) return technologies;
        const term = searchTerm.toLowerCase();
        return technologies.filter((tech) =>
            tech.name.toLowerCase().includes(term)
        );
    }, [technologies, searchTerm]);

    const selectedTechnologies = useMemo(() => {
        return technologies.filter((tech) =>
            selectedTechnologyIds.includes(tech.id)
        );
    }, [technologies, selectedTechnologyIds]);

    const toggleTechnology = (techId: number) => {
        if (disabled) return;

        const newSelection = selectedTechnologyIds.includes(techId)
            ? selectedTechnologyIds.filter((id) => id !== techId)
            : [...selectedTechnologyIds, techId];

        onSelectionChange(newSelection);
    };

    const removeTechnology = (techId: number) => {
        if (disabled) return;
        onSelectionChange(selectedTechnologyIds.filter((id) => id !== techId));
    };

    const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());

    const handleImageError = (techId: number) => {
        setImageLoadErrors(prev => new Set(prev).add(techId));
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-jcoder-primary"></div>
                <p className="text-sm text-jcoder-muted mt-2">Loading technologies...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selected Technologies Display */}
            {selectedTechnologies.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-jcoder-muted mb-2">
                        Selected Technologies ({selectedTechnologies.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {selectedTechnologies.map((tech) => {
                            const hasImage = tech.profileImage && !imageLoadErrors.has(tech.id);
                            const showImageOnly = hasImage; // Em mobile, mostra apenas imagem se disponível

                            return (
                                <div
                                    key={tech.id}
                                    className={`inline-flex items-center gap-2 px-3 py-2 bg-jcoder-gradient/10 border border-jcoder-primary rounded-lg group hover:bg-jcoder-gradient/20 transition-colors ${showImageOnly ? 'md:px-3 px-2' : ''
                                        }`}
                                    title={tech.name} // Tooltip para mobile quando só mostra imagem
                                >
                                    {/* Só renderiza a imagem se não houve erro ao carregar */}
                                    {hasImage && (() => {
                                        const userSession = UsersService.getUserSession();
                                        const username = userSession?.user?.username || '';
                                        return username ? (
                                            <LazyImage
                                                src={ImagesService.getTechnologyProfileImageUrl(username, tech.id)}
                                                alt={tech.name}
                                                fallback={tech.name.substring(0, 2)}
                                                size="custom"
                                                width={showImageOnly ? 'w-6 md:w-5' : 'w-5'}
                                                height={showImageOnly ? 'h-6 md:h-5' : 'h-5'}
                                                objectFit="object-contain"
                                                showSkeleton={false}
                                                onError={() => handleImageError(tech.id)}
                                            />
                                        ) : null;
                                    })()}
                                    <span className={`text-sm font-medium text-jcoder-foreground ${showImageOnly ? 'hidden md:inline' : ''
                                        }`}>
                                        {tech.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeTechnology(tech.id)}
                                        disabled={disabled}
                                        className={`text-jcoder-muted hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${showImageOnly ? 'ml-0 md:ml-1' : 'ml-1'
                                            }`}
                                        aria-label={`Remove ${tech.name}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Search and Add Technologies */}
            <div className="relative">
                <label className="block text-sm font-medium text-jcoder-muted mb-2">
                    Add Technologies
                </label>

                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder="Search technologies..."
                        disabled={disabled}
                        className="w-full px-4 py-2 pl-10 border border-jcoder rounded-lg bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted focus:outline-none focus:ring-2 focus:ring-jcoder-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jcoder-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Dropdown List */}
                {isDropdownOpen && !disabled && (
                    <>
                        {/* Backdrop to close dropdown */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsDropdownOpen(false)}
                        />

                        <div className="absolute z-20 w-full mt-2 bg-jcoder-card border border-jcoder rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {filteredTechnologies.length === 0 ? (
                                <div className="px-4 py-8 text-center text-jcoder-muted">
                                    <p>No technologies found</p>
                                    {searchTerm && (
                                        <p className="text-sm mt-1">
                                            Try a different search term
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="py-2">
                                    {filteredTechnologies.map((tech) => {
                                        const isSelected = selectedTechnologyIds.includes(tech.id);
                                        return (
                                            <button
                                                key={tech.id}
                                                type="button"
                                                onClick={() => {
                                                    toggleTechnology(tech.id);
                                                }}
                                                className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-jcoder-secondary transition-colors ${isSelected ? 'bg-jcoder-primary/10' : ''
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div
                                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isSelected
                                                        ? 'bg-jcoder-cyan shadow-sm'
                                                        : 'border-2 border-jcoder-muted bg-transparent'
                                                        }`}
                                                    style={isSelected ? { backgroundColor: '#00c8ff' } : undefined}
                                                >
                                                    {isSelected && (
                                                        <svg
                                                            className="w-3.5 h-3.5"
                                                            viewBox="0 0 20 20"
                                                            fill="rgba(255, 255, 255)"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Technology Image */}
                                                {tech.profileImage && (
                                                    <LazyImage
                                                        src={(() => {
                                                            const userSession = UsersService.getUserSession();
                                                            const username = userSession?.user?.username || '';
                                                            return username ? ImagesService.getTechnologyProfileImageUrl(username, tech.id) : '';
                                                        })()}
                                                        alt={tech.name}
                                                        fallback={tech.name.substring(0, 2)}
                                                        size="custom"
                                                        width="w-8"
                                                        height="h-8"
                                                        rounded="rounded"
                                                        objectFit="object-contain"
                                                        showSkeleton={false}
                                                        onError={() => { }}
                                                    />
                                                )}

                                                {/* Technology Name */}
                                                <span className={`text-left flex-1 ${isSelected ? 'text-jcoder-primary font-semibold' : 'text-jcoder-foreground'
                                                    }`}>
                                                    {tech.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <p className="text-xs text-jcoder-muted">
                Click on technologies to add/remove them. Selected technologies will appear above with a checkmark.
            </p>
        </div>
    );
}

