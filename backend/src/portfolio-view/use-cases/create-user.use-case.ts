import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UsersService } from '../../administration-by-user/users/users.service';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../../administration-by-user/users/exceptions/username-already-exists.exception';
import { EmailVerification } from '../entities/email-verification.entity';
import { UserComponentAboutMe } from '../../administration-by-user/users/user-components/entities/user-component-about-me.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    @InjectRepository(UserComponentAboutMe)
    private readonly aboutMeRepository: Repository<UserComponentAboutMe>,
  ) { }

  /**
   * Cria um novo usuário administrador
   * Permite que novos usuários criem suas contas e comecem a gerenciar seus portfólios
   * Cria automaticamente o registro aboutMe (mesmo que vazio)
   */
  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se username já existe
    const usernameExists = await this.usersService.existsBy({ username: createUserDto.username });
    if (usernameExists) {
      throw new UsernameAlreadyExistsException();
    }

    // Verificar se email já existe
    const emailExists = await this.usersService.existsBy({ email: createUserDto.email });
    if (emailExists) {
      throw new EmailAlreadyExistsException();
    }

    // Verificar se o email foi verificado
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
      throw new BadRequestException('Email não verificado. Por favor, verifique seu email antes de criar a conta.');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criar novo usuário
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

    // Criar registro aboutMe (mesmo que vazio)
    const aboutMe = this.aboutMeRepository.create({
      userId: savedUser.id,
      user: savedUser,
      occupation: createUserDto.occupation,
      description: createUserDto.description,
    });

    await this.aboutMeRepository.save(aboutMe);

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }
};

