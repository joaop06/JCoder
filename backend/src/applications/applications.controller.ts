import { RoleEnum } from '../users/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Post()
  @Roles(RoleEnum.Admin) // Descomentar após criar os roles
  @UseGuards(JwtAuthGuard, RolesGuard) // Descomentar após criar os guards
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(+id);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard) // Descomentar após criar os guards
  // @Roles(Role.Admin) // Descomentar após criar os roles
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto) {
    return this.applicationsService.update(+id, updateApplicationDto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard) // Descomentar após criar os guards
  // @Roles(Role.Admin) // Descomentar após criar os roles
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(+id);
  }
}

