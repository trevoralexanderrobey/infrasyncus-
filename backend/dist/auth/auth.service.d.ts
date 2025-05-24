import { PrismaService } from '../prisma/prisma.service';
type CreateUserInput = {
    email: string;
    password: string;
    name?: string;
};
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser({ email, password, name }: CreateUserInput): Promise<{
        name: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        email: string;
    }>;
    validateUser(email: string, password: string): Promise<{
        name: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        password: string;
        email: string;
    }>;
}
export {};
