import { Request } from 'express';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PortfolioView } from '../entities/portfolio-view.entity';
import { RegisterPortfolioViewDto } from '../dto/register-portfolio-view.dto';
import { User } from '../../administration-by-user/users/entities/user.entity';
import { UserNotFoundException } from '../../administration-by-user/users/exceptions/user-not-found.exception';

@Injectable()
export class RegisterPortfolioViewUseCase {
  // Cooldown de 30 minutos para evitar duplicação de acessos do mesmo visitante
  private readonly COOLDOWN_MINUTES = 30;

  constructor(
    @InjectRepository(PortfolioView)
    private readonly portfolioViewRepository: Repository<PortfolioView>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async execute(
    username: string,
    dto: RegisterPortfolioViewDto,
    request: Request,
  ): Promise<void> {
    // Buscar o usuário pelo username
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // Normalizar valores para evitar problemas com undefined/null
    const ipAddress = this.getClientIp(request);
    const fingerprint = dto.fingerprint?.trim() || null;
    const userAgent = request.headers['user-agent'] || null;
    const referer = (dto.referer || request.headers['referer'] || null)?.trim() || null;

    // Se for acesso do próprio dono, apenas registrar e retornar (não conta nas estatísticas)
    if (dto.isOwner === true) {
      await this.portfolioViewRepository.save({
        userId: user.id,
        ipAddress: ipAddress,
        fingerprint: fingerprint,
        userAgent: userAgent,
        referer: referer,
        isOwner: true,
      });
      return;
    }

    // Verificar se já houve acesso recente (cooldown)
    const cooldownDate = new Date();
    cooldownDate.setMinutes(cooldownDate.getMinutes() - this.COOLDOWN_MINUTES);

    // Construir query de verificação de cooldown
    const queryBuilder = this.portfolioViewRepository
      .createQueryBuilder('view')
      .where('view.userId = :userId', { userId: user.id })
      .andWhere('view.isOwner = false')
      .andWhere('view.createdAt >= :cooldownDate', { cooldownDate });

    // Adicionar condições de IP ou fingerprint apenas se existirem
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (ipAddress) {
      conditions.push('view.ipAddress = :ipAddress');
      params.ipAddress = ipAddress;
    }

    if (fingerprint) {
      conditions.push('view.fingerprint = :fingerprint');
      params.fingerprint = fingerprint;
    }

    // Se não houver IP nem fingerprint válidos, não podemos verificar cooldown
    // mas ainda assim registramos o acesso
    if (conditions.length > 0) {
      queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
      const existingView = await queryBuilder
        .orderBy('view.createdAt', 'DESC')
        .getOne();

      // Se já houve acesso recente, não registrar novamente
      if (existingView) {
        return;
      }
    }

    // Registrar novo acesso
    await this.portfolioViewRepository.save({
      userId: user.id,
      ipAddress: ipAddress,
      fingerprint: fingerprint,
      userAgent: userAgent,
      referer: referer,
      isOwner: false,
      // TODO: Adicionar geolocalização se necessário (usando serviço externo)
      // country: ...,
      // city: ...,
    });
  }

  /**
   * Extrai o IP real do cliente, considerando proxies e load balancers
   */
  private getClientIp(request: Request): string | null {
    try {
      const forwarded = request.headers['x-forwarded-for'];
      if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
        const ip = ips.split(',')[0].trim();
        // Validar formato básico de IP
        if (ip && ip.length > 0 && ip.length <= 45) {
          return ip;
        }
      }
      const ip = request.ip || request.socket.remoteAddress;
      if (ip && ip.length > 0 && ip.length <= 45) {
        return ip;
      }
      return null;
    } catch (error) {
      // Em caso de erro, retornar null em vez de 'unknown'
      return null;
    }
  }
};
