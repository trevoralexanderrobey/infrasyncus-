import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { TextProcessingModule } from './text-processing/text-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    AiModule,
    TextProcessingModule
  ],
  controllers: [AuthController],
  providers: [PrismaService, AuthService],
})
export class AppModule {}