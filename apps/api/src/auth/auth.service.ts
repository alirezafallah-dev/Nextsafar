import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { mobile: dto.mobile },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      mobile: user.mobile,
      roles: user.roles.map((ur) => ur.role.name),
    };

    return {
      success: true,
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          mobile: user.mobile,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { mobile: dto.mobile } });
    if (existingUser) {
      throw new ConflictException('Mobile number is already registered');
    }

    const userRole = await this.prisma.role.findUnique({ where: { name: 'user' } });
    if (!userRole) throw new Error('Default user role not found');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        mobile: dto.mobile,
        passwordHash,
        roles: { create: { roleId: userRole.id } },
      },
    });

    return { success: true, data: { message: 'Registered successfully', userId: user.id } };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        mobile: true,
        email: true,
        roles: { include: { role: true } },
      },
    });
    return { success: true, data: user };
  }
}
