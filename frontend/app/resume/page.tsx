'use client';

import { useEffect, useState } from 'react';

interface ResumeData {
  user: {
    fullName: string;
    email: string;
    githubUrl?: string;
    linkedinUrl?: string;
  };
  aboutMe: {
    occupation?: string;
    description?: string;
    highlights?: Array<{
      title: string;
      subtitle?: string;
      emoji?: string;
    }>;
  } | null;
  educations: Array<{
    institutionName: string;
    courseName: string;
    degree?: string;
    startDate: string | Date;
    endDate?: string | Date;
    isCurrentlyStudying: boolean;
  }>;
  experiences: Array<{
    companyName: string;
    positions?: Array<{
      position: string;
      positionName?: string;
      description?: string;
      startDate: string | Date;
      endDate?: string | Date;
      isCurrentPosition: boolean;
      location?: string;
      locationType?: string;
    }>;
  }>;
  certificates: Array<{
    certificateName: string;
    registrationNumber?: string;
    issueDate: string | Date;
    issuedTo?: string;
  }>;
}

export default function ResumePage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    // Get data from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    
    if (dataParam) {
      try {
        const decoded = decodeURIComponent(dataParam);
        const data = JSON.parse(decoded);
        setResumeData(data);
      } catch (error) {
        console.error('Error parsing resume data:', error);
      }
    }
  }, []);

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading resume data...</p>
      </div>
    );
  }

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(dateObj);
  };

  const formatDateRange = (startDate: Date | string, endDate?: Date | string, isCurrent?: boolean): string => {
    const start = formatDate(startDate);
    if (isCurrent) {
      return `${start} - Present`;
    }
    if (endDate) {
      return `${start} - ${formatDate(endDate)}`;
    }
    return start;
  };

  return (
    <div className="min-h-screen bg-white" style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '210mm', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '3px solid #1f2937', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', margin: '0 0 8px 0' }}>
            {resumeData.user.fullName}
          </h1>
          {resumeData.aboutMe?.occupation && (
            <p style={{ fontSize: '18px', color: '#374151', marginBottom: '12px', margin: '0 0 12px 0' }}>
              {resumeData.aboutMe.occupation}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#4b5563' }}>
            {resumeData.user.email && (
              <span>{resumeData.user.email}</span>
            )}
            {resumeData.user.githubUrl && (
              <span>{resumeData.user.githubUrl}</span>
            )}
            {resumeData.user.linkedinUrl && (
              <span>{resumeData.user.linkedinUrl}</span>
            )}
          </div>
        </div>

        {/* About Me / Summary */}
        {resumeData.aboutMe?.description && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '12px', borderBottom: '2px solid #d1d5db', paddingBottom: '4px' }}>
              Summary
            </h2>
            <div 
              style={{ color: '#374151', lineHeight: '1.6', fontSize: '14px' }}
              dangerouslySetInnerHTML={{ __html: resumeData.aboutMe.description }}
            />
          </div>
        )}

        {/* Professional Experience */}
        {resumeData.experiences && resumeData.experiences.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', borderBottom: '2px solid #d1d5db', paddingBottom: '4px' }}>
              Professional Experience
            </h2>
            {resumeData.experiences.map((experience, expIndex) => (
              <div key={expIndex} style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  {experience.companyName}
                </h3>
                {experience.positions && experience.positions.map((position, posIndex) => (
                  <div key={posIndex} style={{ marginBottom: '16px', paddingLeft: '16px', borderLeft: '3px solid #9ca3af' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {position.position || position.positionName}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#4b5563', marginBottom: '8px' }}>
                      <span>{formatDateRange(position.startDate, position.endDate, position.isCurrentPosition)}</span>
                      {position.location && (
                        <span>📍 {position.location}</span>
                      )}
                      {position.isCurrentPosition && (
                        <span style={{ padding: '2px 8px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
                          Current
                        </span>
                      )}
                    </div>
                    {position.description && (
                      <div 
                        style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ __html: position.description }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.educations && resumeData.educations.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', borderBottom: '2px solid #d1d5db', paddingBottom: '4px' }}>
              Education
            </h2>
            {resumeData.educations.map((education, eduIndex) => (
              <div key={eduIndex} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                      {education.courseName}
                    </h3>
                    <p style={{ color: '#374151', fontWeight: '500', margin: '0 0 4px 0', fontSize: '14px' }}>
                      {education.institutionName}
                    </p>
                    {education.degree && (
                      <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>{education.degree}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563' }}>
                    <p style={{ margin: 0 }}>{formatDateRange(education.startDate, education.endDate, education.isCurrentlyStudying)}</p>
                    {education.isCurrentlyStudying && (
                      <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {resumeData.certificates && resumeData.certificates.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', borderBottom: '2px solid #d1d5db', paddingBottom: '4px' }}>
              Certifications
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {resumeData.certificates.map((certificate, certIndex) => (
                <div key={certIndex} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px', margin: '0 0 4px 0' }}>
                    {certificate.certificateName}
                  </h3>
                  {certificate.registrationNumber && (
                    <p style={{ fontSize: '11px', color: '#4b5563', marginBottom: '4px', margin: '0 0 4px 0' }}>
                      Reg: {certificate.registrationNumber}
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: '#4b5563', margin: 0 }}>
                    Issued: {formatDate(certificate.issueDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highlights / Skills */}
        {resumeData.aboutMe?.highlights && resumeData.aboutMe.highlights.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', borderBottom: '2px solid #d1d5db', paddingBottom: '4px' }}>
              Key Highlights
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {resumeData.aboutMe.highlights.map((highlight, index) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  {highlight.emoji && <div style={{ fontSize: '24px', marginBottom: '4px' }}>{highlight.emoji}</div>}
                  <h4 style={{ fontWeight: '600', color: '#111827', fontSize: '13px', marginBottom: '4px', margin: '0 0 4px 0' }}>
                    {highlight.title}
                  </h4>
                  {highlight.subtitle && (
                    <p style={{ fontSize: '11px', color: '#4b5563', margin: 0 }}>{highlight.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
