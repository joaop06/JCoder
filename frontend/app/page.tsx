'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { Application } from '@/types/entities/application.entity';
import { Technology } from '@/types/entities/technology.entity';
import { ApplicationService } from '@/services/applications.service';
import { TechnologiesService } from '@/services/technologies.service';
import ApplicationCard from '@/components/applications/ApplicationCard';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { GitHubIcon } from '@/components/theme';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';
import LazyImage from '@/components/ui/LazyImage';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);

  const toast = useToast();
  const { scrollToElement } = useSmoothScroll();

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ApplicationService.query({
        isActive: true,
        limit: 100,
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
    setLoadingTechs(true);
    try {
      const data = await TechnologiesService.query({
        isActive: true,
        sortBy: 'displayOrder',
        sortOrder: 'ASC',
        limit: 100,
      });
      setTechnologies(data.data || []);
    } catch (err) {
      console.error('Failure to load technologies', err);
      // Use fallback to static icons if API fails
      setTechnologies([]);
    } finally {
      setLoadingTechs(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      // Carregamento paralelo para melhor performance
      await Promise.all([
        loadApplications(),
        loadTechnologies()
      ]);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    scrollToElement(sectionId, 80); // 80px offset para o header
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAdmin={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-jcoder-cyan/10 via-transparent to-jcoder-blue/10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jcoder-cyan/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-jcoder-blue/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Profile Image */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-jcoder-gradient p-1">
                <div className="w-full h-full rounded-full bg-jcoder-card flex items-center justify-center">
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
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-jcoder-cyan">
                João Pedro
              </span>
            </h1>

            {/* Subtitle */}
            <h2 className="text-2xl md:text-3xl font-semibold text-jcoder-foreground mb-4">
              Backend Developer
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-jcoder-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              Backend developer specialized in JavaScript/Node.js with over 2 years of experience.
              Graduated in Multiplatform Software Development from Fatec Franca.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => scrollToSection('projects')}
                className="px-8 py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105"
              >
                View Projects
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

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Profile Image */}
                <div className="order-2 lg:order-1">
                  <div className="relative">
                    <div className="w-80 h-80 mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-jcoder-gradient p-1">
                      <div className="w-full h-full rounded-2xl overflow-hidden bg-jcoder-card">
                        <LazyImage
                          src="/images/profile_picture.jpeg"
                          alt="João Pedro - Backend Developer"
                          fallback="JP"
                          size="custom"
                          width="w-full"
                          height="h-full"
                          rounded="rounded-2xl"
                          objectFit="object-cover"
                          rootMargin="100px"
                        />
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-jcoder-cyan rounded-full opacity-60"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-jcoder-blue rounded-full opacity-40"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="order-1 lg:order-2 text-center lg:text-left">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">
                      João Pedro Borges
                    </h3>
                    <p className="text-lg text-jcoder-primary font-semibold mb-6">
                      Backend Developer & Software Engineer
                    </p>
                  </div>

                  <div className="space-y-6 mb-8">
                    <p className="text-lg text-jcoder-muted leading-relaxed">
                      I'm 22 years old and have been working as a programmer for over 2 years (approximately 2 years and 5 months).
                      My specialty is in the backend area with JavaScript (Node.js), developing robust and scalable solutions.
                    </p>
                    <p className="text-lg text-jcoder-muted leading-relaxed">
                      I graduated in Multiplatform Software Development from Fatec Franca Dr. Thomas Novelino,
                      with 2640 hours of course including internship and extension activities. Always seeking new challenges
                      and professional growth opportunities.
                    </p>
                  </div>

                  {/* Skills & Achievements */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-jcoder-card rounded-xl p-4 border border-jcoder">
                      <div className="text-2xl mb-2">🎯</div>
                      <h4 className="font-semibold text-jcoder-foreground mb-1">Backend Specialist</h4>
                      <p className="text-sm text-jcoder-muted">Node.js & JavaScript</p>
                    </div>
                    <div className="bg-jcoder-card rounded-xl p-4 border border-jcoder">
                      <div className="text-2xl mb-2">🎓</div>
                      <h4 className="font-semibold text-jcoder-foreground mb-1">Fatec Graduate</h4>
                      <p className="text-sm text-jcoder-muted">Software Development</p>
                    </div>
                    <div className="bg-jcoder-card rounded-xl p-4 border border-jcoder">
                      <div className="text-2xl mb-2">🚀</div>
                      <h4 className="font-semibold text-jcoder-foreground mb-1">2+ Years Experience</h4>
                      <p className="text-sm text-jcoder-muted">Professional Development</p>
                    </div>
                  </div>

                  {/* Call to Action */}
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
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20 bg-jcoder-card/50">
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
                    <ApplicationCard key={app.id} application={app} />
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
        <section id="tech-stack" className="py-20">
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
                    <TechnologyCard key={tech.id} technology={tech} />
                  ))}
                </div>
              ) : (
                // Fallback to static icons if no technologies from API
                <div className="flex flex-wrap justify-center gap-8">
                  {/* Backend - Especialidade */}
                  <StaticTechCard icon="/icons/technologies_and_stacks/nodejs.png" name="Node.js" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/typescript.png" name="TypeScript" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/nestjs.png" name="NestJS" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/express.png" name="Express" />

                  {/* Bancos de Dados */}
                  <StaticTechCard icon="/icons/technologies_and_stacks/mysql.png" name="MySQL" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/postgres.png" name="PostgreSQL" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/firebird.png" name="Firebird" />

                  {/* ORMs */}
                  <StaticTechCard icon="/icons/technologies_and_stacks/sequelize.png" name="Sequelize" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/typeorm.png" name="TypeORM" />

                  {/* Infraestrutura */}
                  <StaticTechCard icon="/icons/technologies_and_stacks/docker.png" name="Docker" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/rabbitmq.png" name="RabbitMQ" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/ubuntu.png" name="Ubuntu" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/pm2.png" name="PM2" />

                  {/* Frontend - Conhecimento Leve */}
                  <StaticTechCard icon="/icons/technologies_and_stacks/react.png" name="React" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/vuejs.png" name="Vue.js" />

                  {/* Mobile */}
                  <StaticTechCard icon="/icons/technologies_and_stacks/react-native.png" name="React Native" />
                  <StaticTechCard icon="/icons/technologies_and_stacks/flutter.png" name="Flutter" />

                  {/* Versionamento */}
                  <StaticTechCard icon="/icons/technologies_and_stacks/git.png" name="Git" />
                </div>
              )}
            </div>
          </div>
        </section>

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

              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <a
                  href="https://github.com/joaop06"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <GitHubIcon className="w-6 h-6" />
                  <span className="font-semibold">GitHub</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/jo%C3%A3o-pedro-borges-ara%C3%BAjo-9a134116b "
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <LazyImage
                    src="/icons/linkedin.png"
                    alt="LinkedIn"
                    fallback="Li"
                    size="custom"
                    width="w-6"
                    height="h-6"
                    showSkeleton={false}
                  />
                  <span className="font-semibold">LinkedIn</span>
                </a>

                <a
                  href="mailto:joaopedroborges@gmail.com"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <LazyImage
                    src="/icons/gmail.png"
                    alt="Gmail"
                    fallback="@"
                    size="custom"
                    width="w-6"
                    height="h-6"
                    showSkeleton={false}
                  />
                  <span className="font-semibold">Email</span>
                </a>
              </div>

              {/* Contact Form */}
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

      <Footer />
      <ScrollToTop />
    </div>
  );
}

// Project Grid Skeleton Component
function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-jcoder-card border border-jcoder rounded-lg p-6 animate-pulse">
          <div className="flex items-start gap-4">
            {/* Icon Skeleton */}
            <div className="w-12 h-12 rounded-lg bg-jcoder-secondary flex-shrink-0"></div>

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="h-5 bg-jcoder-secondary rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-jcoder-secondary rounded w-full"></div>
                <div className="h-4 bg-jcoder-secondary rounded w-5/6"></div>
              </div>

              {/* Actions Skeleton */}
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

// Technologies Grid Skeleton Component
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

// Static Tech Card Component (for fallback icons)
interface StaticTechCardProps {
  icon: string;
  name: string;
}

function StaticTechCard({ icon, name }: StaticTechCardProps) {
  return (
    <div className="text-center group w-32">
      <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300 p-3">
        <LazyImage
          src={icon}
          alt={name}
          fallback={name.substring(0, 2)}
          size="custom"
          width="w-full"
          height="h-full"
          rounded="rounded-xl"
          objectFit="object-contain"
          rootMargin="150px"
        />
      </div>
      <h3 className="font-semibold text-jcoder-foreground">{name}</h3>
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
    [ExpertiseLevel.BASIC]: 'bg-gray-500/20 text-gray-400',
    [ExpertiseLevel.INTERMEDIATE]: 'bg-blue-500/20 text-blue-400',
    [ExpertiseLevel.ADVANCED]: 'bg-purple-500/20 text-purple-400',
    [ExpertiseLevel.EXPERT]: 'bg-yellow-500/20 text-yellow-400',
  };
  return colors[level];
};

// Technology Card Component
interface TechnologyCardProps {
  technology: Technology;
}

function TechnologyCard({ technology }: TechnologyCardProps) {
  const imageUrl = TechnologiesService.getProfileImageUrl(technology.id);

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
