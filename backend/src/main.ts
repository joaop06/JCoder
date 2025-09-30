import { config } from 'dotenv';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

config();
const configService = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilita CORS para permitir requisições do frontend
  app.useGlobalPipes(new ValidationPipe()); // Habilita validação global de DTOs

  const port = configService.get("BACKEND_DOCKER_PORT");
  await app.listen(port ? parseInt(port, 10) : 3000);
}
bootstrap();
