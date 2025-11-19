'use client';

import { ResumeTemplateProps } from '../../types';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { ExpertiseLevel } from '@/types';
import {
  formatDate,
  formatDateRange,
  getExpertiseLevelLabel,
  stripHtml,
  getSkillBarWidth,
} from '../../utils';

export default function ClassicTemplate({ data }: ResumeTemplateProps) {
  const { user, aboutMe, educations, experiences, references, technologies } = data;

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (user?.profileImage && user?.id && user?.username) {
      return ImagesService.getUserProfileImageUrl(user.username, user.id);
    }
    return null;
  };

  return (
    <div id="resume-content-classic" className="resume-pdf classic-template" style={{
      width: '210mm',
      minHeight: '297mm',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      display: 'flex',
    }}>
      {/* Left Column - Dark Blue */}
      <div style={{
        width: '35%',
        backgroundColor: '#1e3a5f',
        color: '#ffffff',
        padding: '20mm 15mm',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Profile Picture */}
        {getProfileImageUrl() ? (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            margin: '0 auto 20px',
            overflow: 'hidden',
            border: '3px solid #ffffff',
          }}>
            <img
              src={getProfileImageUrl() || ''}
              alt={user?.fullName || 'Profile'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ) : (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            margin: '0 auto 20px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #ffffff',
            color: '#1e3a5f',
            fontSize: '48pt',
            fontWeight: 'bold',
          }}>
            {(user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name */}
        <h1 style={{
          fontSize: '24pt',
          fontWeight: 'bold',
          color: '#ffffff',
          margin: '0 0 10px 0',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          {user?.fullName || user?.firstName || 'Name'}
        </h1>

        {/* Title/Occupation */}
        {aboutMe?.occupation && (
          <h2 style={{
            fontSize: '12pt',
            fontWeight: 'normal',
            color: '#ffffff',
            margin: '0 0 30px 0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {aboutMe.occupation}
          </h2>
        )}

        {/* Details Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            fontSize: '14pt',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 15px 0',
            textTransform: 'uppercase',
            borderBottom: '2px solid #ffffff',
            paddingBottom: '5px',
          }}>
            Details
          </h3>
          {user?.address && (
            <p style={{
              fontSize: '10pt',
              color: '#ffffff',
              margin: '5px 0',
              lineHeight: '1.5',
            }}>
              {user.address}
            </p>
          )}
          {user?.phone && (
            <p style={{
              fontSize: '10pt',
              color: '#ffffff',
              margin: '5px 0',
            }}>
              {user.phone}
            </p>
          )}
          {user?.email && (
            <p style={{
              fontSize: '10pt',
              color: '#ffffff',
              margin: '5px 0',
            }}>
              {user.email}
            </p>
          )}
        </div>

        {/* Skills Section */}
        {technologies.length > 0 && (
          <div>
            <h3 style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 15px 0',
              textTransform: 'uppercase',
              borderBottom: '2px solid #ffffff',
              paddingBottom: '5px',
            }}>
              Skills
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {technologies.map((tech) => (
                <div key={tech.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: '10pt',
                      color: '#ffffff',
                    }}>
                      {tech.name}
                    </span>
                    <span style={{
                      fontSize: '9pt',
                      color: '#ffffff',
                      opacity: 0.8,
                    }}>
                      {getExpertiseLevelLabel(tech.expertiseLevel)}
                    </span>
                  </div>
                  {/* Skill Bar */}
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: getSkillBarWidth(tech.expertiseLevel),
                      height: '100%',
                      backgroundColor: '#ffffff',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - White */}
      <div style={{
        width: '65%',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '20mm',
      }}>
        {/* Profile Section */}
        {aboutMe?.description && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{
              fontSize: '16pt',
              fontWeight: 'bold',
              color: '#000000',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
            }}>
              Profile
            </h3>
            <p style={{
              fontSize: '10pt',
              color: '#333333',
              textAlign: 'justify',
              lineHeight: '1.6',
            }}>
              {stripHtml(aboutMe.description)}
            </p>
          </section>
        )}

        {/* Employment History */}
        {experiences.length > 0 && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{
              fontSize: '16pt',
              fontWeight: 'bold',
              color: '#000000',
              margin: '0 0 15px 0',
              textTransform: 'uppercase',
            }}>
              Employment History
            </h3>
            {experiences.map((experience, expIndex) => (
              <div key={`exp-${expIndex}`} style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '13pt',
                  fontWeight: 'bold',
                  color: '#000000',
                  margin: '0 0 8px 0',
                }}>
                  {experience.companyName}
                </h4>
                {experience.positions && experience.positions.length > 0 && (
                  <div style={{ marginLeft: '10px' }}>
                    {experience.positions.map((position, posIndex) => (
                      <div key={`pos-${posIndex}`} style={{ marginBottom: '12px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '5px',
                        }}>
                          <h5 style={{
                            fontSize: '11pt',
                            fontWeight: 'bold',
                            color: '#333333',
                            margin: 0,
                          }}>
                            {position.position}
                          </h5>
                          <span style={{
                            fontSize: '9pt',
                            color: '#666666',
                            whiteSpace: 'nowrap',
                            marginLeft: '10px',
                          }}>
                            {formatDateRange(
                              position.startDate,
                              position.endDate,
                              position.isCurrentPosition
                            )}
                          </span>
                        </div>
                        {position.location && (
                          <p style={{
                            fontSize: '9pt',
                            color: '#666666',
                            margin: '2px 0',
                          }}>
                            📍 {position.location}{position.locationType ? ` • ${position.locationType}` : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {educations.length > 0 && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{
              fontSize: '16pt',
              fontWeight: 'bold',
              color: '#000000',
              margin: '0 0 15px 0',
              textTransform: 'uppercase',
            }}>
              Education
            </h3>
            {educations.map((education, eduIndex) => (
              <div key={`edu-${eduIndex}`} style={{ marginBottom: '15px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      color: '#000000',
                      margin: '0 0 3px 0',
                    }}>
                      {education.courseName}
                    </h4>
                    <p style={{
                      fontSize: '10pt',
                      color: '#333333',
                      margin: '0 0 3px 0',
                    }}>
                      {education.institutionName}
                    </p>
                    {education.degree && (
                      <p style={{
                        fontSize: '9pt',
                        color: '#666666',
                        margin: 0,
                      }}>
                        {education.degree}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: '9pt',
                    color: '#666666',
                    whiteSpace: 'nowrap',
                    marginLeft: '10px',
                  }}>
                    {formatDateRange(
                      education.startDate,
                      education.endDate,
                      education.isCurrentlyStudying
                    )}
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* References */}
        {references.length > 0 && (
          <section style={{ marginBottom: '25px' }}>
            <h3 style={{
              fontSize: '16pt',
              fontWeight: 'bold',
              color: '#000000',
              margin: '0 0 15px 0',
              textTransform: 'uppercase',
            }}>
              References
            </h3>
            {references.map((reference, refIndex) => (
              <div key={`ref-${refIndex}`} style={{ marginBottom: '12px' }}>
                <h4 style={{
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  color: '#000000',
                  margin: '0 0 3px 0',
                }}>
                  {reference.name}
                  {reference.company && ` from ${reference.company}`}
                </h4>
                {reference.email && (
                  <p style={{
                    fontSize: '9pt',
                    color: '#666666',
                    margin: '2px 0',
                  }}>
                    {reference.email}
                  </p>
                )}
                {reference.phone && (
                  <p style={{
                    fontSize: '9pt',
                    color: '#666666',
                    margin: '2px 0',
                  }}>
                    {reference.phone}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

