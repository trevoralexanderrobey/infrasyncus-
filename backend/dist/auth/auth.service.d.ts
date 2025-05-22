import { PrismaService } from '../prisma/prisma.service';
type CreateUserInput = {
    email: string;
    password: string;
    name?: string;
};
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser({ email, password, name }: CreateUserInput): Promise<any>;
    validateUser(email: string, password: string): Promise<any>;
}
export {};
