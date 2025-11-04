'use client';

import {
  User,
  Technology,
  Application,
  ExpertiseLevel,
  UserComponentAboutMe,
  UserComponentEducation,
  UserComponentExperience,
  UserComponentCertificate,
} from "@/types";


interface ResumeProps {
  aboutMe: UserComponentAboutMe | null;
  educations: UserComponentEducation[];
  experiences: UserComponentExperience[];
  certificates: UserComponentCertificate[];
  applications: Application[];
  technologies: Technology[];
  user?: User | null;
}

export default function Resume({
  aboutMe,
  educations,
  experiences,
  certificates,
  applications,
  technologies,
  user,
}: ResumeProps) {
  // Helper function to format dates
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(dateObj);
  };

  // Helper function to format date range
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

  // Strip HTML tags for PDF
  const stripHtml = (html: string | undefined): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  return (
    <div id="resume-content" className="resume-pdf" style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '3px solid #00d4ff',
        paddingBottom: '15px',
        marginBottom: '20px',
      }}>
        <h1 style={{
          fontSize: '28pt',
          fontWeight: 'bold',
          color: '#00d4ff',
          margin: '0 0 5px 0',
        }}>
          {user?.fullName || 'João Pedro Borges'}
        </h1>
        {aboutMe?.occupation && (
          <h2 style={{
            fontSize: '16pt',
            fontWeight: 'normal',
            color: '#666666',
            margin: '0 0 10px 0',
          }}>
            {aboutMe.occupation}
          </h2>
        )}
        <div style={{
          fontSize: '10pt',
          color: '#666666',
        }}>
          {user?.email && (
            <p style={{ margin: '2px 0' }}>
              📧 {user.email}
            </p>
          )}
          {user?.githubUrl && (
            <p style={{ margin: '2px 0' }}>
              🔗 {user.githubUrl}
            </p>
          )}
          {user?.linkedinUrl && (
            <p style={{ margin: '2px 0' }}>
              🔗 {user.linkedinUrl}
            </p>
          )}
        </div>
      </header>

      {/* About Me */}
      {aboutMe?.description && (
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            color: '#00d4ff',
            borderBottom: '2px solid #00d4ff',
            paddingBottom: '5px',
            marginBottom: '10px',
          }}>
            About Me
          </h3>
          <p style={{
            textAlign: 'justify',
            color: '#333333',
          }}>
            {stripHtml(aboutMe.description)}
          </p>
        </section>
      )}

      {/* Professional Experience */}
      {experiences.length > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            color: '#00d4ff',
            borderBottom: '2px solid #00d4ff',
            paddingBottom: '5px',
            marginBottom: '15px',
          }}>
            Professional Experience
          </h3>
          {experiences.map((experience, expIndex) => (
            <div key={`exp-${expIndex}`} style={{ marginBottom: '15px' }}>
              <h4 style={{
                fontSize: '14pt',
                fontWeight: 'bold',
                color: '#333333',
                marginBottom: '5px',
              }}>
                {experience.companyName}
              </h4>
              {experience.positions && experience.positions.length > 0 && (
                <div style={{ marginLeft: '15px' }}>
                  {experience.positions.map((position, posIndex) => (
                    <div key={`pos-${posIndex}`} style={{ marginBottom: '10px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '5px',
                      }}>
                        <h5 style={{
                          fontSize: '12pt',
                          fontWeight: 'bold',
                          color: '#444444',
                          margin: 0,
                        }}>
                          {position.position}
                        </h5>
                        <span style={{
                          fontSize: '10pt',
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
                          fontSize: '10pt',
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
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            color: '#00d4ff',
            borderBottom: '2px solid #00d4ff',
            paddingBottom: '5px',
            marginBottom: '15px',
          }}>
            Education
          </h3>
          {educations.map((education, eduIndex) => (
            <div key={`edu-${eduIndex}`} style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <h4 style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    color: '#333333',
                    margin: '0 0 3px 0',
                  }}>
                    {education.courseName}
                  </h4>
                  <p style={{
                    fontSize: '11pt',
                    color: '#444444',
                    margin: '0 0 3px 0',
                  }}>
                    {education.institutionName}
                  </p>
                  {education.degree && (
                    <p style={{
                      fontSize: '10pt',
                      color: '#666666',
                      margin: 0,
                    }}>
                      {education.degree}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: '10pt',
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

      {/* Certifications */}
      {certificates.length > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            color: '#00d4ff',
            borderBottom: '2px solid #00d4ff',
            paddingBottom: '5px',
            marginBottom: '15px',
          }}>
            Certifications
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}>
            {certificates.map((certificate, certIndex) => (
              <div key={`cert-${certIndex}`} style={{
                padding: '8px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
              }}>
                <h4 style={{
                  fontSize: '11pt',
                  fontWeight: 'bold',
                  color: '#333333',
                  margin: '0 0 5px 0',
                }}>
                  {certificate.certificateName}
                </h4>
                {certificate.registrationNumber && (
                  <p style={{
                    fontSize: '9pt',
                    color: '#666666',
                    margin: '2px 0',
                  }}>
                    Reg: {certificate.registrationNumber}
                  </p>
                )}
                <p style={{
                  fontSize: '9pt',
                  color: '#666666',
                  margin: '2px 0',
                }}>
                  Issued: {formatDate(certificate.issueDate)}
                </p>
                {certificate.issuedTo && (
                  <p style={{
                    fontSize: '9pt',
                    color: '#666666',
                    margin: '2px 0',
                  }}>
                    To: {certificate.issuedTo}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technologies & Skills */}
      {technologies.length > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            color: '#00d4ff',
            borderBottom: '2px solid #00d4ff',
            paddingBottom: '5px',
            marginBottom: '15px',
          }}>
            Technologies & Skills
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            {technologies.map((tech) => (
              <span key={tech.id} style={{
                display: 'inline-block',
                padding: '4px 10px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
                fontSize: '10pt',
              }}>
                {tech.name} ({getExpertiseLevelLabel(tech.expertiseLevel)})
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects & Applications */}
      {applications.length > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            color: '#00d4ff',
            borderBottom: '2px solid #00d4ff',
            paddingBottom: '5px',
            marginBottom: '15px',
          }}>
            Projects & Applications
          </h3>
          {applications.map((app) => (
            <div key={app.id} style={{ marginBottom: '12px' }}>
              <h4 style={{
                fontSize: '12pt',
                fontWeight: 'bold',
                color: '#333333',
                margin: '0 0 5px 0',
              }}>
                {app.name}
              </h4>
              {app.description && (
                <p style={{
                  fontSize: '10pt',
                  color: '#555555',
                  textAlign: 'justify',
                  margin: '0 0 5px 0',
                }}>
                  {app.description}
                </p>
              )}
              {app.githubUrl && (
                <p style={{
                  fontSize: '9pt',
                  color: '#666666',
                  margin: 0,
                }}>
                  🔗 {app.githubUrl}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

