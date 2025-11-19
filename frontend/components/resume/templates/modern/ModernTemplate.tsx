'use client';

import {
  stripHtml,
  formatDate,
  formatDateRange,
  getSkillBarWidth,
  getExpertiseLevelLabel,
} from '../../utils';
import { ResumeTemplateProps } from '../../types';
import { ImagesService } from '@/services/administration-by-user/images.service';

/**
 * Template Modern - Design profissional e limpo
 * 
 * Características:
 * - Layout vertical com header destacado
 * - Seções bem organizadas
 * - Tipografia moderna
 * - Cores profissionais
 * - Espaçamento generoso
 */
export default function ModernTemplate({ data }: ResumeTemplateProps) {
  const { user, aboutMe, educations, experiences, certificates, references, technologies } = data;

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (user?.profileImage && user?.id && user?.username) {
      return ImagesService.getUserProfileImageUrl(user.username, user.id);
    }
    return null;
  };

  return (
    <div id="resume-content-modern" className="resume-pdf modern-template" style={{
      width: '210mm',
      minHeight: '297mm',
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '10pt',
      lineHeight: '1.6',
      display: 'flex',
      flexDirection: 'column',
      // Controles de quebra de página e linha
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
    }}>
      {/* Header Section - Nome e Informações de Contato */}
      <header style={{
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        padding: '12mm 20mm',
        display: 'flex',
        alignItems: 'center',
        gap: '12mm',
        borderBottom: '3px solid #3498db',
        pageBreakInside: 'avoid',
        pageBreakAfter: 'avoid',
        breakInside: 'avoid',
        breakAfter: 'avoid',
      }}>
        {/* Profile Picture */}
        {getProfileImageUrl() ? (
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #3498db',
            flexShrink: 0,
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
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#3498db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #3498db',
            flexShrink: 0,
            color: '#ffffff',
            fontSize: '28pt',
            fontWeight: 'bold',
          }}>
            {(user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name and Contact Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '24pt',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
          }}>
            {user?.fullName || user?.firstName || 'Nome Completo'}
          </h1>

          {aboutMe?.occupation && (
            <h2 style={{
              fontSize: '12pt',
              fontWeight: 'normal',
              color: '#ecf0f1',
              margin: '0 0 8px 0',
              fontStyle: 'italic',
            }}>
              {aboutMe.occupation}
            </h2>
          )}

          {/* Contact Information */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '8.5pt',
            color: '#ecf0f1',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}>
            {user?.email && (
              <span style={{ whiteSpace: 'nowrap' }}>📧 {user.email}</span>
            )}
            {user?.phone && (
              <span style={{ whiteSpace: 'nowrap' }}>📱 {user.phone}</span>
            )}
            {user?.address && (
              <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>📍 {user.address}</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        padding: '20mm',
        display: 'flex',
        flexDirection: 'column',
        gap: '20mm',
      }}>
        {/* Profile/About Section */}
        {aboutMe?.description && (
          <section style={{
            display: 'block',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'auto',
            breakInside: 'avoid',
            orphans: 3,
            widows: 3,
            boxDecorationBreak: 'clone',
          }}>
            <div style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              display: 'block',
            }}>
              <h3 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px',
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid',
              }}>
                Perfil Profissional
              </h3>
              <p style={{
                fontSize: '10pt',
                color: '#34495e',
                textAlign: 'justify',
                lineHeight: '1.8',
                margin: 0,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
              }}>
                {stripHtml(aboutMe.description)}
              </p>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {experiences.length > 0 && (
          <section style={{
            display: 'block',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'auto',
            breakInside: 'avoid',
            orphans: 3,
            widows: 3,
            boxDecorationBreak: 'clone',
          }}>
            <div style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              display: 'block',
            }}>
              <h3 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px',
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid',
              }}>
                Experiência Profissional
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {experiences.map((experience, expIndex) => (
                  <div key={`exp-${expIndex}`} style={{
                    pageBreakInside: 'avoid',
                    pageBreakAfter: 'auto',
                    breakInside: 'avoid',
                  }}>
                    <h4 style={{
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      margin: '0 0 5px 0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      pageBreakAfter: 'avoid',
                      breakAfter: 'avoid',
                    }}>
                      {experience.companyName}
                    </h4>
                    {experience.positions && experience.positions.length > 0 && (
                      <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {experience.positions.map((position, posIndex) => (
                          <div key={`pos-${posIndex}`} style={{
                            borderLeft: '3px solid #3498db',
                            paddingLeft: '10px',
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid',
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '5px',
                              pageBreakInside: 'avoid',
                              breakInside: 'avoid',
                            }}>
                              <h5 style={{
                                fontSize: '11pt',
                                fontWeight: 'bold',
                                color: '#34495e',
                                margin: 0,
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                              }}>
                                {position.position}
                              </h5>
                              <span style={{
                                fontSize: '9pt',
                                color: '#7f8c8d',
                                whiteSpace: 'nowrap',
                                marginLeft: '10px',
                                fontStyle: 'italic',
                                flexShrink: 0,
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
                                color: '#7f8c8d',
                                margin: '3px 0 0 0',
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
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {educations.length > 0 && (
          <section style={{
            display: 'block',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'auto',
            breakInside: 'avoid',
            orphans: 3,
            widows: 3,
            boxDecorationBreak: 'clone',
          }}>
            <div style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              display: 'block',
            }}>
              <h3 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px',
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid',
              }}>
                Formação Acadêmica
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {educations.map((education, eduIndex) => (
                  <div key={`edu-${eduIndex}`} style={{
                    borderLeft: '3px solid #3498db',
                    paddingLeft: '10px',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '11pt',
                          fontWeight: 'bold',
                          color: '#2c3e50',
                          margin: '0 0 3px 0',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}>
                          {education.courseName}
                        </h4>
                        <p style={{
                          fontSize: '10pt',
                          color: '#34495e',
                          margin: '0 0 3px 0',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}>
                          {education.institutionName}
                        </p>
                        {education.degree && (
                          <p style={{
                            fontSize: '9pt',
                            color: '#7f8c8d',
                            margin: 0,
                            fontStyle: 'italic',
                          }}>
                            {education.degree}
                          </p>
                        )}
                      </div>
                      <span style={{
                        fontSize: '9pt',
                        color: '#7f8c8d',
                        whiteSpace: 'nowrap',
                        marginLeft: '10px',
                        fontStyle: 'italic',
                        flexShrink: 0,
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
              </div>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {technologies.length > 0 && (
          <section style={{
            display: 'block',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'auto',
            breakInside: 'avoid',
            orphans: 3,
            widows: 3,
            boxDecorationBreak: 'clone',
          }}>
            <div style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              display: 'block',
            }}>
              <h3 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px',
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid',
                display: 'block',
              }}>
                Competências Técnicas
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                orphans: 2,
                widows: 2,
                boxDecorationBreak: 'clone',
              }}>
                {technologies.map((tech) => (
                  <div key={tech.id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      gap: '8px',
                    }}>
                      <span style={{
                        fontSize: '10pt',
                        color: '#34495e',
                        fontWeight: '500',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        flex: 1,
                        minWidth: 0,
                      }}>
                        {tech.name}
                      </span>
                      <span style={{
                        fontSize: '8pt',
                        color: '#7f8c8d',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {getExpertiseLevelLabel(tech.expertiseLevel)}
                      </span>
                    </div>
                    {/* Skill Bar */}
                    <div style={{
                      width: '100%',
                      height: '5px',
                      backgroundColor: '#ecf0f1',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                    }}>
                      <div style={{
                        width: getSkillBarWidth(tech.expertiseLevel),
                        height: '100%',
                        backgroundColor: '#3498db',
                        borderRadius: '3px',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <section style={{
            display: 'block',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'auto',
            breakInside: 'avoid',
            orphans: 3,
            widows: 3,
            boxDecorationBreak: 'clone',
          }}>
            <div style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              display: 'block',
            }}>
              <h3 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px',
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid',
              }}>
                Certificações
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {certificates.map((certificate, certIndex) => (
                  <div key={`cert-${certIndex}`} style={{
                    borderLeft: '3px solid #3498db',
                    paddingLeft: '10px',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}>
                    <h4 style={{
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      margin: '0 0 3px 0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}>
                      {certificate.certificateName}
                    </h4>
                    {certificate.issuedTo && (
                      <p style={{
                        fontSize: '9pt',
                        color: '#7f8c8d',
                        margin: '3px 0',
                      }}>
                        {certificate.issuedTo}
                      </p>
                    )}
                    {certificate.issueDate && (
                      <p style={{
                        fontSize: '9pt',
                        color: '#7f8c8d',
                        margin: '3px 0',
                        fontStyle: 'italic',
                      }}>
                        Emitido em: {formatDate(certificate.issueDate)}
                      </p>
                    )}
                    {certificate.registrationNumber && (
                      <p style={{
                        fontSize: '9pt',
                        color: '#7f8c8d',
                        margin: '3px 0',
                      }}>
                        Registro: {certificate.registrationNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* References Section */}
        {references.length > 0 && (
          <section style={{
            display: 'block',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'auto',
            breakInside: 'avoid',
            orphans: 3,
            widows: 3,
            boxDecorationBreak: 'clone',
          }}>
            <div style={{
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              display: 'block',
            }}>
              <h3 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '0 0 15px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderBottom: '2px solid #3498db',
                paddingBottom: '5px',
                pageBreakAfter: 'avoid',
                breakAfter: 'avoid',
              }}>
                Referências
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px',
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
                orphans: 2,
                widows: 2,
              }}>
                {references.map((reference, refIndex) => (
                  <div key={`ref-${refIndex}`} style={{
                    borderLeft: '3px solid #3498db',
                    paddingLeft: '10px',
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid',
                  }}>
                    <h4 style={{
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      margin: '0 0 5px 0',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}>
                      {reference.name}
                    </h4>
                    {reference.company && (
                      <p style={{
                        fontSize: '9pt',
                        color: '#34495e',
                        margin: '3px 0',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        {reference.company}
                      </p>
                    )}
                    {reference.email && (
                      <p style={{
                        fontSize: '9pt',
                        color: '#7f8c8d',
                        margin: '3px 0',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                      }}>
                        📧 {reference.email}
                      </p>
                    )}
                    {reference.phone && (
                      <p style={{
                        fontSize: '9pt',
                        color: '#7f8c8d',
                        margin: '3px 0',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        📱 {reference.phone}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
