import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UsersService } from '../../administration-by-user/users/users.service';
import { EmailAlreadyExistsException } from '../../administration-by-user/users/exceptions/email-already-exists.exception';
import { UsernameAlreadyExistsException } from '../../administration-by-user/users/exceptions/username-already-exists.exception';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Cria um novo usuário administrador
   * Permite que novos usuários criem suas contas e comecem a gerenciar seus portfólios
   */
  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se username já existe
    const usernameExists = await this.usersService.existsBy({ username: createUserDto.username });
    if (usernameExists) {
      throw new UsernameAlreadyExistsException();
    }

    // Verificar se email já existe (se fornecido)
    if (createUserDto.email) {
      const emailExists = await this.usersService.existsBy({ email: createUserDto.email });
      if (emailExists) {
        throw new EmailAlreadyExistsException();
      }
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

    // Remover senha do retorno
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }
};

