import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { UsersService } from '../users/users.service';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async generateResumePdf(userId: number): Promise<Buffer> {
    try {
      // Fetch user data with all components
      const user = await this.usersService.findById(userId, true);

      // Prepare resume data from user entity
      const resumeData = {
        user: {
          fullName: user.fullName || user.firstName || 'Unknown',
          email: user.email || '',
          githubUrl: user.githubUrl || '',
          linkedinUrl: user.linkedinUrl || '',
        },
        aboutMe: user.userComponentAboutMe || null,
        educations: user.userComponentEducation || [],
        experiences: user.userComponentExperience || [],
        certificates: user.userComponentCertificate || [],
      };

      // Get frontend URL
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      
      // Launch browser
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      try {
        const page = await browser.newPage();

        // Navigate to resume template page
        const resumeUrl = `${frontendUrl}/resume?data=${encodeURIComponent(JSON.stringify(resumeData))}`;
        await page.goto(resumeUrl, { 
          waitUntil: 'networkidle0',
          timeout: 30000,
        });

        // Generate PDF
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.5cm',
            right: '0.5cm',
            bottom: '0.5cm',
            left: '0.5cm',
          },
        });

        return Buffer.from(pdf);
      } finally {
        await browser.close();
      }
    } catch (error) {
      this.logger.error('Error generating resume PDF', error);
      throw error;
    }
  }
}
