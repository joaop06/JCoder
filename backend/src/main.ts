import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Habilita CORS para permitir requisições do frontend
  app.useGlobalPipes(new ValidationPipe()); // Habilita validação global de DTOs
  await app.listen(3000);
}
bootstrap();
