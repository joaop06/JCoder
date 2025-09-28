import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Será criado posteriormente
// import { RolesGuard } from '../auth/roles.guard'; // Será criado posteriormente
// import { Roles } from '../auth/roles.decorator'; // Será criado posteriormente
// import { Role } from '../auth/role.enum'; // Será criado posteriormente

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard) // Descomentar após criar os guards
  // @Roles(Role.Admin) // Descomentar após criar os roles
  @Post()
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

