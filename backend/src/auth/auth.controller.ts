import { Role } from './role.enum';
import { Roles } from './roles.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Roles(Role.Admin)
  @Post('admin/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async registerAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.createAdminUser(registerDto.username, registerDto.password);
  }
}

