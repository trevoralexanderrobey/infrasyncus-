import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

type LoginDto = {
  email: string;
  password: string;
};

type RegisterDto = {
  email: string;
  password: string;
  name?: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('login')
  async login(@Body() { email, password }: LoginDto) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    
    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    
    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token 
    };
  }

  @Post('register')
  async register(@Body() { email, password, name }: RegisterDto) {
    const user = await this.authService.createUser({ email, password, name });
    
    // Generate JWT token for the new user (same as login)
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    
    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token 
    };
  }
}