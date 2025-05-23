import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend - configurable via environment variable
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  
  // Add global prefix for API routes
  app.setGlobalPrefix('api');
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`CORS enabled for origin: ${corsOrigin}`);
}

bootstrap();
