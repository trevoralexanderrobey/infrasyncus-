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
export declare class AuthController {
    private authService;
    private jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    login({ email, password }: LoginDto): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
        };
        token: string;
    }>;
    register({ email, password, name }: RegisterDto): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
        };
        token: string;
    }>;
}
export {};
