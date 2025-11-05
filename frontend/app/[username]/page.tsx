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
} from '@/types';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { GitHubIcon } from '@/components/theme';
import Resume from '@/components/resume/Resume';
import LazyImage from '@/components/ui/LazyImage';
import ScrollToTop from '@/components/ScrollToTop';
import { generateResumePDF } from '@/utils/resume-pdf';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useToast } from '@/components/toast/ToastContext';
import ApplicationCard from '@/components/applications/ApplicationCard';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';

export default function PortfolioPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);

  // User components states
  const [aboutMe, setAboutMe] = useState<UserComponentAboutMe | null>(null);
  const [loadingAboutMe, setLoadingAboutMe] = useState(true);
  const [educations, setEducations] = useState<UserComponentEducation[]>([]);
  const [loadingEducations, setLoadingEducations] = useState(true);
  const [experiences, setExperiences] = useState<UserComponentExperience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [certificates, setCertificates] = useState<UserComponentCertificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const toast = useToast();
  const { scrollToElement } = useSmoothScroll();

  // Get username from URL params
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

  const loadApplications = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      const data = await PortfolioViewService.getApplications(username, {
        limit: 100,
        sortBy: 'displayOrder',
        sortOrder: 'ASC',
      });
      setApplications(data.data || []);
    } catch (err) {
      console.error('Failure to load applications', err);
      const errorMessage = 'The applications could not be loaded. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnologies = async () => {
    if (!username) return;
    setLoadingTechs(true);
    try {
      const data = await PortfolioViewService.getTechnologies(username, {
        sortBy: 'displayOrder',
        sortOrder: 'ASC',
        limit: 100,
      });
      setTechnologies(data.data || []);
    } catch (err) {
      console.error('Failure to load technologies', err);
      setTechnologies([]);
    } finally {
      setLoadingTechs(false);
    }
  };

  const loadAboutMe = async () => {
    if (!username) return;
    setLoadingAboutMe(true);
    try {
      const profileData = await PortfolioViewService.getProfileWithAboutMe(username);
      setAboutMe(profileData.aboutMe || null);
      setUser(profileData);
    } catch (err) {
      console.error('Failure to load about me', err);
      setAboutMe(null);
    } finally {
      setLoadingAboutMe(false);
    }
  };

  const loadEducations = async () => {
    if (!username) return;
    setLoadingEducations(true);
    try {
      const data = await PortfolioViewService.getEducations(username);
      setEducations(data.data || []);
    } catch (err) {
      console.error('Failure to load educations', err);
      setEducations([]);
    } finally {
      setLoadingEducations(false);
    }
  };

  const loadExperiences = async () => {
    if (!username) return;
    setLoadingExperiences(true);
    try {
      const data = await PortfolioViewService.getExperiences(username);
      setExperiences(data.data || []);
    } catch (err) {
      console.error('Failure to load experiences', err);
      setExperiences([]);
    } finally {
      setLoadingExperiences(false);
    }
  };

  const loadCertificates = async () => {
    if (!username) return;
    setLoadingCertificates(true);
    try {
      const data = await PortfolioViewService.getCertificates(username);
      setCertificates(data.data || []);
    } catch (err) {
      console.error('Failure to load certificates', err);
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  };

  useEffect(() => {
    if (!username) return;
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      await Promise.all([
        loadApplications(),
        loadTechnologies(),
        loadAboutMe(),
        loadEducations(),
        loadExperiences(),
        loadCertificates(),
      ]);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  const scrollToSection = (sectionId: string) => {
    scrollToElement(sectionId, 80);
  };

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

  const handleDownloadResume = async () => {
    setGeneratingPDF(true);
    try {
      await generateResumePDF();
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error generating resume PDF:', error);
      toast.error('Failed to generate resume. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-jcoder-muted">Invalid username</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAdmin={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-jcoder-cyan/10 via-transparent to-jcoder-blue/10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jcoder-cyan/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-jcoder-blue/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Profile Image */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-jcoder-gradient p-1">
                <div className="w-full h-full rounded-full bg-jcoder-card flex items-center justify-center">
                  {user?.profileImage ? (
                    <LazyImage
                      src={ImagesService.getUserProfileImageUrl(username, user.id)}
                      alt={user.fullName || username}
                      fallback={username.charAt(0).toUpperCase()}
                      size="custom"
                      width="w-20"
                      height="h-20"
                      rounded="rounded-full"
                      rootMargin="200px"
                    />
                  ) : (
                    <LazyImage
                      src="/images/jcoder-logo.png"
                      alt="JCoder"
                      fallback="JC"
                      size="custom"
                      width="w-20"
                      height="h-20"
                      rounded="rounded-full"
                      rootMargin="200px"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-jcoder-cyan">
                {user?.fullName || user?.firstName || username}
              </span>
            </h1>

            {/* Subtitle */}
            {aboutMe?.occupation && (
              <h2 className="text-2xl md:text-3xl font-semibold text-jcoder-foreground mb-4">
                {aboutMe.occupation}
              </h2>
            )}

            {/* Description */}
            {aboutMe?.description ? (
              <p className="text-lg md:text-xl text-jcoder-muted mb-8 max-w-2xl mx-auto leading-relaxed">
                {aboutMe.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>
            ) : (
              <p className="text-lg md:text-xl text-jcoder-muted mb-8 max-w-2xl mx-auto leading-relaxed">
                Welcome to my portfolio
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => scrollToSection('projects')}
                className="px-8 py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105"
              >
                View Projects
              </button>
              <button
                onClick={handleDownloadResume}
                disabled={generatingPDF}
                className="px-8 py-4 bg-jcoder-card border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingPDF ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Resume
                  </>
                )}
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 flex items-center gap-2"
              >
                Get in Touch
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-jcoder-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
                About Me
              </h2>

              {loadingAboutMe ? (
                <AboutMeSkeleton />
              ) : aboutMe ? (
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="relative">
                      <div className="w-80 h-80 mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-jcoder-gradient p-1">
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-jcoder-card">
                          {user?.profileImage ? (
                            <LazyImage
                              src={ImagesService.getUserProfileImageUrl(username, user.id)}
                              alt="Profile Picture"
                              fallback={username.charAt(0).toUpperCase()}
                              size="custom"
                              width="w-full"
                              height="h-full"
                              rounded="rounded-2xl"
                              objectFit="object-cover"
                              rootMargin="100px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl">
                              {username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-jcoder-cyan rounded-full opacity-60"></div>
                      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-jcoder-blue rounded-full opacity-40"></div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2 text-center lg:text-left">
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">
                        {user?.fullName || username}
                      </h3>
                      {aboutMe.occupation && (
                        <p className="text-lg text-jcoder-primary font-semibold mb-6">
                          {aboutMe.occupation}
                        </p>
                      )}
                    </div>

                    {aboutMe.description && (
                      <div className="space-y-6 mb-8">
                        <div
                          className="text-lg text-jcoder-muted leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: aboutMe.description }}
                        />
                      </div>
                    )}

                    {aboutMe.highlights && aboutMe.highlights.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {aboutMe.highlights.map((highlight, index) => (
                          <div key={index} className="bg-jcoder-card rounded-xl p-4 border border-jcoder">
                            {highlight.emoji && <div className="text-2xl mb-2">{highlight.emoji}</div>}
                            <h4 className="font-semibold text-jcoder-foreground mb-1">{highlight.title}</h4>
                            {highlight.subtitle && (
                              <p className="text-sm text-jcoder-muted">{highlight.subtitle}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <button
                        onClick={() => scrollToSection('projects')}
                        className="px-6 py-3 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105"
                      >
                        View My Work
                      </button>
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="px-6 py-3 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300"
                      >
                        Get in Touch
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-jcoder-muted text-lg">About Me information not available.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Professional Experience Section */}
        {(loadingExperiences || experiences.length > 0) && (
          <section id="experience" className="py-20 bg-jcoder-card/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
                  Professional Experience
                </h2>

                {loadingExperiences ? (
                  <ExperienceSkeleton />
                ) : experiences.length > 0 ? (
                  <div className="space-y-8">
                    {experiences.map((experience, expIndex) => (
                      <div
                        key={`experience-${experience.username}-${experience.companyName}-${expIndex}`}
                        className="bg-jcoder-card rounded-2xl p-6 border border-jcoder hover:border-jcoder-primary transition-all duration-300"
                      >
                        <h3 className="text-2xl font-bold text-jcoder-foreground mb-6">
                          {experience.companyName}
                        </h3>

                        {experience.positions && experience.positions.length > 0 && (
                          <div className="space-y-6 pl-4 border-l-2 border-jcoder-primary/30">
                            {experience.positions.map((position, index) => (
                              <div key={`position-${position.id || index}-${position.position}`} className="relative">
                                <div className="absolute -left-[29px] top-0 w-4 h-4 bg-jcoder-primary rounded-full"></div>
                                <div className="mb-4">
                                  <h4 className="text-xl font-semibold text-jcoder-foreground mb-2">
                                    {position.position}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-4 mb-2">
                                    <p className="text-jcoder-muted text-sm">
                                      {formatDateRange(
                                        position.startDate,
                                        position.endDate,
                                        position.isCurrentPosition
                                      )}
                                    </p>
                                    {position.location && (
                                      <span className="text-jcoder-muted text-sm">
                                        📍 {position.location}
                                        {position.locationType && ` • ${position.locationType}`}
                                      </span>
                                    )}
                                    {position.isCurrentPosition && (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-jcoder-primary/20 text-jcoder-primary">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        <section id="projects" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
                Projects & Applications
              </h2>

              {loading ? (
                <ProjectsGridSkeleton />
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={loadApplications}
                    className="px-6 py-3 bg-jcoder-primary text-black font-semibold rounded-lg hover:bg-jcoder-accent transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : applications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} application={app} username={username} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-jcoder-muted text-lg">No projects found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="tech-stack" className="py-20 bg-jcoder-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
                Technologies & Stacks
              </h2>

              {loadingTechs ? (
                <TechnologiesGridSkeleton />
              ) : technologies.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-8">
                  {technologies.map((tech) => (
                    <TechnologyCard key={tech.id} technology={tech} username={username} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-jcoder-muted text-lg">No technologies found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Education & Certifications Section */}
        {((loadingEducations || educations.length > 0) || (loadingCertificates || certificates.length > 0)) && (
          <section id="education-certifications" className="py-20 bg-jcoder-card/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
                  Education & Certifications
                </h2>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    {(loadingEducations || educations.length > 0) && (
                      <>
                        <h3 className="text-2xl font-bold text-jcoder-foreground mb-6">
                          Education
                        </h3>
                        {loadingEducations ? (
                          <EducationSkeleton />
                        ) : educations.length > 0 ? (
                          <div className="space-y-6">
                            {educations.map((education, eduIndex) => (
                              <div
                                key={education.id || `edu-${eduIndex}`}
                                className="bg-jcoder-card rounded-2xl p-6 border border-jcoder hover:border-jcoder-primary transition-all duration-300"
                              >
                                <div className="flex flex-col gap-4">
                                  <div className="flex-1">
                                    <h4 className="text-xl font-bold text-jcoder-foreground mb-2">
                                      {education.courseName}
                                    </h4>
                                    <p className="text-lg text-jcoder-primary font-semibold mb-2">
                                      {education.institutionName}
                                    </p>
                                    {education.degree && (
                                      <p className="text-jcoder-muted mb-4">{education.degree}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-jcoder-foreground font-semibold text-sm">
                                      {formatDateRange(
                                        education.startDate,
                                        education.endDate,
                                        education.isCurrentlyStudying
                                      )}
                                    </p>
                                    {education.isCurrentlyStudying && (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-jcoder-primary/20 text-jcoder-primary">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-jcoder-muted">No education records found.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    {(loadingCertificates || certificates.length > 0) && (
                      <>
                        <h3 className="text-2xl font-bold text-jcoder-foreground mb-6">
                          Certifications
                        </h3>
                        {loadingCertificates ? (
                          <CertificatesSkeleton />
                        ) : certificates.length > 0 ? (
                          <div className="space-y-6">
                            {certificates.map((certificate, certIndex) => (
                              <div
                                key={certificate.id || `cert-${certIndex}`}
                                className="bg-jcoder-card rounded-2xl p-6 border border-jcoder hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg"
                              >
                                {certificate.profileImage && certificate.id && (
                                  <div className="mb-4 rounded-lg overflow-hidden bg-jcoder-secondary">
                                    <LazyImage
                                      src={ImagesService.getCertificateImageUrl(username, certificate.id)}
                                      alt={certificate.certificateName}
                                      fallback="🎓"
                                      size="custom"
                                      width="w-full"
                                      height="h-40"
                                      rounded="rounded-lg"
                                      objectFit="object-cover"
                                      rootMargin="100px"
                                    />
                                  </div>
                                )}
                                <h4 className="text-lg font-bold text-jcoder-foreground mb-2">
                                  {certificate.certificateName}
                                </h4>
                                {certificate.registrationNumber && (
                                  <p className="text-xs text-jcoder-muted mb-1">
                                    Registration: {certificate.registrationNumber}
                                  </p>
                                )}
                                <p className="text-xs text-jcoder-muted mb-2">
                                  Issued: {formatDate(certificate.issueDate)}
                                </p>
                                {certificate.issuedTo && (
                                  <p className="text-xs text-jcoder-muted mb-3">
                                    To: {certificate.issuedTo}
                                  </p>
                                )}
                                {certificate.verificationUrl && (
                                  <a
                                    href={certificate.verificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-jcoder-primary hover:text-jcoder-accent transition-colors text-xs font-semibold"
                                  >
                                    Verify Certificate
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-jcoder-muted">No certifications found.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Social & Contact Section */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-jcoder-foreground mb-8">
                Let's Connect
              </h2>
              <p className="text-lg text-jcoder-muted mb-12 max-w-2xl mx-auto">
                I'm always open to new opportunities and collaborations.
                Get in touch with me through social media or email.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mb-12">
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                  >
                    <GitHubIcon className="w-6 h-6" />
                    <span className="font-semibold">GitHub</span>
                  </a>
                )}

                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                  >
                    <LazyImage
                      src="/images/icons/linkedin.png"
                      alt="LinkedIn"
                      fallback="Li"
                      size="custom"
                      width="w-6"
                      height="h-6"
                      showSkeleton={false}
                    />
                    <span className="font-semibold">LinkedIn</span>
                  </a>
                )}

                {user?.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                  >
                    <LazyImage
                      src="/images/icons/gmail.png"
                      alt="Gmail"
                      fallback="@"
                      size="custom"
                      width="w-6"
                      height="h-6"
                      showSkeleton={false}
                    />
                    <span className="font-semibold">Email</span>
                  </a>
                )}
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-jcoder-card rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-jcoder-foreground mb-6">
                    Send a Message
                  </h3>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted"
                      />
                    </div>
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted resize-none"
                    ></textarea>
                    <button
                      type="submit"
                      className="w-full px-8 py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer user={user} username={username} />
      <ScrollToTop />

      {/* Hidden Resume Component for PDF Generation */}
      <div style={{ display: 'none' }}>
        <Resume
          aboutMe={aboutMe}
          educations={educations}
          experiences={experiences}
          certificates={certificates}
          applications={applications}
          technologies={technologies}
          user={user}
        />
      </div>
    </div>
  );
}

// Skeleton Components
function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-jcoder-card border border-jcoder rounded-lg p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-jcoder-secondary flex-shrink-0"></div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="h-5 bg-jcoder-secondary rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-jcoder-secondary rounded w-full"></div>
                <div className="h-4 bg-jcoder-secondary rounded w-5/6"></div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-9 bg-jcoder-secondary rounded-lg w-28"></div>
                <div className="h-9 bg-jcoder-secondary rounded-lg w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TechnologiesGridSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="text-center w-32 animate-pulse">
          <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-secondary rounded-2xl"></div>
          <div className="h-4 bg-jcoder-secondary rounded w-20 mx-auto mb-2"></div>
          <div className="h-3 bg-jcoder-secondary rounded-full w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  );
}

function AboutMeSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center animate-pulse">
      <div className="order-2 lg:order-1">
        <div className="w-80 h-80 mx-auto lg:mx-0 rounded-2xl bg-jcoder-secondary"></div>
      </div>
      <div className="order-1 lg:order-2 space-y-6">
        <div className="h-8 bg-jcoder-secondary rounded w-3/4"></div>
        <div className="h-6 bg-jcoder-secondary rounded w-1/2"></div>
        <div className="space-y-3">
          <div className="h-4 bg-jcoder-secondary rounded w-full"></div>
          <div className="h-4 bg-jcoder-secondary rounded w-5/6"></div>
          <div className="h-4 bg-jcoder-secondary rounded w-4/6"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-jcoder-secondary rounded-xl p-4 h-24"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EducationSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-jcoder-card rounded-2xl p-6 border border-jcoder animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-jcoder-secondary rounded w-3/4"></div>
              <div className="h-5 bg-jcoder-secondary rounded w-1/2"></div>
              <div className="h-4 bg-jcoder-secondary rounded w-1/3"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-jcoder-secondary rounded w-32"></div>
              <div className="h-6 bg-jcoder-secondary rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-jcoder-card rounded-2xl p-6 border border-jcoder animate-pulse">
          <div className="h-6 bg-jcoder-secondary rounded w-1/3 mb-6"></div>
          <div className="space-y-6 pl-4 border-l-2 border-jcoder-primary/30">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="space-y-3">
                <div className="h-5 bg-jcoder-secondary rounded w-1/2"></div>
                <div className="h-4 bg-jcoder-secondary rounded w-32"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-jcoder-secondary rounded w-full"></div>
                  <div className="h-3 bg-jcoder-secondary rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificatesSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-jcoder-card rounded-2xl p-6 border border-jcoder animate-pulse">
          <div className="h-40 bg-jcoder-secondary rounded-lg mb-4"></div>
          <div className="h-5 bg-jcoder-secondary rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-jcoder-secondary rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-jcoder-secondary rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-jcoder-secondary rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}

// Technology Card Component
interface TechnologyCardProps {
  technology: Technology;
  username: string;
}

function TechnologyCard({ technology, username }: TechnologyCardProps) {
  const imageUrl = ImagesService.getTechnologyProfileImageUrl(username, technology.id);

  const getExpertiseLevelLabel = (level: ExpertiseLevel): string => {
    const labels: Record<ExpertiseLevel, string> = {
      [ExpertiseLevel.BASIC]: 'Basic',
      [ExpertiseLevel.INTERMEDIATE]: 'Intermediate',
      [ExpertiseLevel.ADVANCED]: 'Advanced',
      [ExpertiseLevel.EXPERT]: 'Expert',
    };
    return labels[level];
  };

  const getExpertiseLevelColor = (level: ExpertiseLevel): string => {
    const colors: Record<ExpertiseLevel, string> = {
      [ExpertiseLevel.BASIC]: 'bg-gray-500/20 text-gray-400',
      [ExpertiseLevel.INTERMEDIATE]: 'bg-blue-500/20 text-blue-400',
      [ExpertiseLevel.ADVANCED]: 'bg-purple-500/20 text-purple-400',
      [ExpertiseLevel.EXPERT]: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[level];
  };

  return (
    <div
      className="text-center group relative w-32"
      title={`${technology.name} - ${getExpertiseLevelLabel(technology.expertiseLevel)}`}
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300 p-3 relative">
        <LazyImage
          src={imageUrl}
          alt={technology.name}
          fallback={technology.name.substring(0, 2)}
          size="custom"
          width="w-full"
          height="h-full"
          rounded="rounded-xl"
          objectFit="object-contain"
          rootMargin="150px"
        />
      </div>
      <h3 className="font-semibold text-jcoder-foreground group-hover:text-jcoder-primary transition-colors">
        {technology.name}
      </h3>
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getExpertiseLevelColor(technology.expertiseLevel)}`}>
        {getExpertiseLevelLabel(technology.expertiseLevel)}
      </span>
    </div>
  );
}
