import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        success: boolean;
        data: {
            access_token: string;
            user: {
                id: string;
                mobile: string;
                firstName: string;
                lastName: string;
            };
        };
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        data: {
            message: string;
            userId: string;
        };
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        data: {
            mobile: string;
            firstName: string;
            lastName: string;
            id: string;
            email: string;
            roles: ({
                role: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    name: string;
                    displayName: string;
                };
            } & {
                userId: string;
                roleId: string;
            })[];
        };
    }>;
    adminOnlyRoute(user: any): Promise<{
        success: boolean;
        data: {
            message: string;
        };
    }>;
}
