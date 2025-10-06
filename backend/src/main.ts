import { config } from 'dotenv';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { createInitialUserAdmin } from 'scripts/create-initial-user-admin';

config();
const configService = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS to allow frontend requests
  app.enableCors();

  // Enable global validations of the DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await createInitialUserAdmin();

  const port = configService.get("BACKEND_PORT");
  await app.listen(parseInt(port, 10));
}
bootstrap();
