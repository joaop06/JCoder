import { Controller, Get, HttpCode, HttpStatus, Res, StreamableFile, Header } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ResumeService } from './resume.service';
import { UsersService } from '../users/users.service';

@ApiTags('Resume')
@Controller('resume')
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly usersService: UsersService,
  ) {}

  @Get('download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download resume as PDF' })
  @ApiOkResponse({
    description: 'Resume PDF file',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="resume.pdf"')
  async downloadResume(@Res() res: Response): Promise<void> {
    // Get the first user (in production, you might want to get a specific user or use authentication)
    // For now, we'll assume userId = 1 (admin/user profile)
    const userId = 1;

    const pdfBuffer = await this.resumeService.generateResumePdf(userId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Joao_Pedro_Borges_Resume.pdf"',
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.send(pdfBuffer);
  }
}
