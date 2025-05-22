import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
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
            id: any;
            email: any;
            name: any;
        };
        token: string;
    }>;
    register({ email, password, name }: RegisterDto): Promise<any>;
}
export {};
