'use client';

import { useState } from 'react';
import { Technology } from '@/types/entities/technology.entity';
import { TechnologiesService } from '@/services/technologies.service';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';

interface ApplicationTechnologiesProps {
    technologies: Technology[];
}

export default function ApplicationTechnologies({ technologies }: ApplicationTechnologiesProps) {
    if (!technologies || technologies.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-jcoder-foreground mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-jcoder-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Technologies Used
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {technologies.map((tech) => (
                    <TechnologyCard key={tech.id} technology={tech} />
                ))}
            </div>
        </div>
    );
}

// Helper to get expertise level label
const getExpertiseLevelLabel = (level: ExpertiseLevel): string => {
    const labels: Record<ExpertiseLevel, string> = {
        [ExpertiseLevel.BASIC]: 'Basic',
        [ExpertiseLevel.INTERMEDIATE]: 'Intermediate',
        [ExpertiseLevel.ADVANCED]: 'Advanced',
        [ExpertiseLevel.EXPERT]: 'Expert',
    };
    return labels[level];
};

// Helper to get expertise level color
const getExpertiseLevelColor = (level: ExpertiseLevel): string => {
    const colors: Record<ExpertiseLevel, string> = {
        [ExpertiseLevel.BASIC]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        [ExpertiseLevel.INTERMEDIATE]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        [ExpertiseLevel.ADVANCED]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        [ExpertiseLevel.EXPERT]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[level];
};

// Technology Card Component
interface TechnologyCardProps {
    technology: Technology;
}

function TechnologyCard({ technology }: TechnologyCardProps) {
    const [imageError, setImageError] = useState(false);
    const imageUrl = TechnologiesService.getProfileImageUrl(technology.id);

    return (
        <div
            className="group relative bg-jcoder-card border border-jcoder rounded-xl p-4 hover:border-jcoder-primary hover:shadow-lg hover:shadow-jcoder-primary/20 transition-all duration-300 flex flex-col items-center"
            title={`${technology.name} - ${getExpertiseLevelLabel(technology.expertiseLevel)}`}
        >
            {/* Technology Image */}
            <div className="w-16 h-16 mb-3 bg-jcoder-secondary rounded-lg flex items-center justify-center p-2 group-hover:bg-jcoder-gradient/10 transition-colors">
                {technology.profileImage && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={technology.name}
                        className="w-full h-full object-contain"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <svg className="w-8 h-8 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                )}
            </div>

            {/* Technology Name */}
            <h4 className="font-semibold text-jcoder-foreground text-center text-sm mb-2 group-hover:text-jcoder-primary transition-colors line-clamp-2">
                {technology.name}
            </h4>

            {/* Expertise Level Badge */}
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getExpertiseLevelColor(technology.expertiseLevel)}`}
            >
                {getExpertiseLevelLabel(technology.expertiseLevel)}
            </span>
        </div>
    );
}

