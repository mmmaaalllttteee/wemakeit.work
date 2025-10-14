import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('WMIW Platform API')
    .setDescription('We Make IT Work - Music Industry Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and registration')
    .addTag('Organization', 'Organization management')
    .addTag('Projects', 'Project, board, and task management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`\n🚀 WMIW API Server running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health Check: http://localhost:${port}/api/v1/health\n`);
}

bootstrap();
