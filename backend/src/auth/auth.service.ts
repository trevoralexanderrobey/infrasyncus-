import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type CreateUserInput = {
  email: string;
  password: string;
  name?: string;
};

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createUser({ email, password, name }: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    return user;
  }
}