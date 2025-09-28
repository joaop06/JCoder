import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = this.usersRepository.create({
      username: registerDto.username,
      password: hashedPassword,
      role: 'user', // Default role for new registrations
    });
    return this.usersRepository.save(newUser);
  }

  async createAdminUser(username: string, password_plain: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password_plain, 10);
    const adminUser = this.usersRepository.create({
      username: username,
      password: hashedPassword,
      role: 'admin',
    });
    return this.usersRepository.save(adminUser);
  }
}

