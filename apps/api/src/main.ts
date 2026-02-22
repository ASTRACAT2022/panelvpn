import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Serve static files from Next.js build
  app.use('/_next', express.static(join(__dirname, '../../web/.next')));
  app.use(express.static(join(__dirname, '../../web/public')));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Sing-box Panel API')
    .setDescription('API for managing Sing-box infrastructure')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(3001);
  console.log(`Application is running on: http://localhost:3001`);
  console.log(`API Documentation: http://localhost:3001/api/docs`);
}
bootstrap();
