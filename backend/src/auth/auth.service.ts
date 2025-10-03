import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const payload = { username: loginDto.username, };
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

