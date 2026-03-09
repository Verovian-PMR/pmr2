import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { IsEmail, IsString, IsOptional, MinLength } from "class-validator";

import { AuthService } from "./auth.service";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  mfaCode?: string;
}

class VerifyMfaDto {
  @IsString()
  code!: string;
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login with email/password + optional MFA" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.mfaCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post("mfa/setup")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generate MFA secret and QR code URL" })
  async setupMfa(@Request() req: { user: { id: string } }) {
    return this.authService.setupMfa(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("mfa/verify")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Verify MFA code and enable MFA" })
  async verifyMfa(
    @Request() req: { user: { id: string } },
    @Body() dto: VerifyMfaDto,
  ) {
    return this.authService.verifyAndEnableMfa(req.user.id, dto.code);
  }
}
