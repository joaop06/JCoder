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
  // 30-minute cooldown to prevent duplicate visits from the same visitor
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
    // Find user by username
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

    // If it's the owner's access, just register and return (doesn't count in statistics)
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

    // Check if there was a recent access (cooldown)
    const cooldownDate = new Date();
    cooldownDate.setMinutes(cooldownDate.getMinutes() - this.COOLDOWN_MINUTES);

    // Build cooldown verification query
    const queryBuilder = this.portfolioViewRepository
      .createQueryBuilder('view')
      .where('view.userId = :userId', { userId: user.id })
      .andWhere('view.isOwner = false')
      .andWhere('view.createdAt >= :cooldownDate', { cooldownDate });

    // Add IP or fingerprint conditions only if they exist
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

    // If there are no valid IP or fingerprint, we can't verify cooldown
    // but we still register the access
    if (conditions.length > 0) {
      queryBuilder.andWhere(`(${conditions.join(' OR ')})`, params);
      const existingView = await queryBuilder
        .orderBy('view.createdAt', 'DESC')
        .getOne();

      // If there was a recent access, don't register again
      if (existingView) {
        return;
      }
    }

    // Register new access
    await this.portfolioViewRepository.save({
      userId: user.id,
      ipAddress: ipAddress,
      fingerprint: fingerprint,
      userAgent: userAgent,
      referer: referer,
      isOwner: false,
      // TODO: Add geolocation if needed (using external service)
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
        // Validate basic IP format
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
      // In case of error, return null instead of 'unknown'
      return null;
    }
  }
};
