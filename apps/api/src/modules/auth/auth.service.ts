import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { authenticator } from "otplib";

import { PrismaService } from "../../config/database.module";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async login(email: string, password: string, mfaCode?: string) {
    const user = await this.validateUser(email, password);

    // MFA verification if enabled (FR-PD-01)
    if (user.mfaEnabled && user.mfaSecret) {
      if (!mfaCode) {
        return { requiresMfa: true, tempToken: this.generateTempToken(user.id) };
      }
      const isValid = authenticator.verify({
        token: mfaCode,
        secret: user.mfaSecret,
      });
      if (!isValid) {
        throw new UnauthorizedException("Invalid MFA code");
      }
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION", "7d"),
    });

    return { accessToken, refreshToken };
  }

  async setupMfa(userId: string) {
    const secret = authenticator.generateSecret();
    const issuer = this.configService.get("MFA_ISSUER", "VivIPractice");
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const otpauthUrl = authenticator.keyuri(user!.email, issuer, secret);

    // Store secret temporarily - confirm with verifyMfa before enabling
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, otpauthUrl };
  }

  async verifyAndEnableMfa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfaSecret) {
      throw new UnauthorizedException("MFA not set up");
    }

    const isValid = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!isValid) {
      throw new UnauthorizedException("Invalid MFA code");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { success: true };
  }

  private generateTempToken(userId: string): string {
    return this.jwtService.sign({ sub: userId, type: "mfa_pending" }, { expiresIn: "5m" });
  }
}
