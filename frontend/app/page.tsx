'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { Application } from '@/types/entities/application.entity';
import { ApplicationService } from '@/services/applications.service';
import ApplicationCard from '@/components/applications/ApplicationCard';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { GitHubIcon } from '@/components/theme';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const toast = useToast();
  const { scrollToElement } = useSmoothScroll();

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ApplicationService.getAll();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failure to load applications', err);
      const errorMessage = 'The applications could not be loaded. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      await loadApplications();
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
                  <img
                    src="/images/jcoder-logo.png"
                    alt="JCoder"
                    className="w-20 h-20 rounded-full"
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
                        <img
                          src="/images/profile_picture.jpeg"
                          alt="João Pedro - Backend Developer"
                          className="w-full h-full object-cover"
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
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jcoder-primary"></div>
                  <p className="mt-4 text-jcoder-muted">Loading projects...</p>
                </div>
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

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {/* Backend - Especialidade */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/nodejs.png"
                      alt="Node.js"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Node.js</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/typescript.png"
                      alt="TypeScript"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">TypeScript</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/nestjs.png"
                      alt="NestJS"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">NestJS</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/express.png"
                      alt="Express"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Express</h3>
                </div>

                {/* Bancos de Dados */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/mysql.png"
                      alt="MySQL"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">MySQL</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/postgres.png"
                      alt="PostgreSQL"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">PostgreSQL</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-yellow-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/firebird.png"
                      alt="Firebird"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Firebird</h3>
                </div>

                {/* ORMs */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/sequelize.png"
                      alt="Sequelize"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Sequelize</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/typeorm.png"
                      alt="TypeORM"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">TypeORM</h3>
                </div>

                {/* Infraestrutura */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-cyan-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/docker.png"
                      alt="Docker"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Docker</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/rabbitmq.png"
                      alt="RabbitMQ"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">RabbitMQ</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/ubuntu.png"
                      alt="Ubuntu"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Ubuntu</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/pm2.png"
                      alt="PM2"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">PM2</h3>
                </div>

                {/* Frontend - Conhecimento Leve */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-sky-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/react.png"
                      alt="React"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">React</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/vuejs.png"
                      alt="Vue.js"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Vue.js</h3>
                </div>

                {/* Mobile */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-teal-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/react-native.png"
                      alt="React Native"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">React Native</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/flutter.png"
                      alt="Flutter"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Flutter</h3>
                </div>

                {/* Versionamento */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card dark:bg-jcoder-card light:bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <img
                      src="/icons/technologies_and_stacks/git.png"
                      alt="Git"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Git</h3>
                </div>
              </div>
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
                  <img
                    src="/icons/linkedin.png"
                    alt="LinkedIn"
                    className="w-6 h-6 dark"
                  />
                  <span className="font-semibold">LinkedIn</span>
                </a>

                <a
                  href="mailto:joaopedroborges@gmail.com"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <img
                    src="/icons/gmail.png"
                    alt="Gmail"
                    className="w-6 h-6"
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
};
