import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailVerification } from '../entities/email-verification.entity';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UsersService } from '../../administration-by-user/users/users.service';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../../administration-by-user/users/exceptions/username-already-exists.exception';
import { UserComponentAboutMe } from '../../administration-by-user/users/user-components/entities/user-component-about-me.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserComponentAboutMe)
    private readonly aboutMeRepository: Repository<UserComponentAboutMe>,

    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
  ) { }

  /**
   * Creates a new administrator user
   * Allows new users to create their accounts and start managing their portfolios
   * Automatically creates the aboutMe record (even if empty)
   */
  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Check if username already exists
    const usernameExists = await this.usersService.existsBy({ username: createUserDto.username });
    if (usernameExists) {
      throw new UsernameAlreadyExistsException();
    }

    // Check if email already exists
    const emailExists = await this.usersService.existsBy({ email: createUserDto.email });
    if (emailExists) {
      throw new EmailAlreadyExistsException();
    }

    // Check if the email was verified
    const emailVerification = await this.emailVerificationRepository.findOne({
      where: {
        email: createUserDto.email,
        verified: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!emailVerification) {
      throw new BadRequestException('Email not verified. Please verify your email before creating the account.');
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const newUser = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      fullName: createUserDto.fullName,
      githubUrl: createUserDto.githubUrl,
      linkedinUrl: createUserDto.linkedinUrl,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Create aboutMe record (even if empty)
    const aboutMe = this.aboutMeRepository.create({
      userId: savedUser.id,
      user: savedUser,
      occupation: createUserDto.occupation,
      description: createUserDto.description,
    });

    await this.aboutMeRepository.save(aboutMe);

    // Remove password from return
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }
};

