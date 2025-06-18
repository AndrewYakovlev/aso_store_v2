import { Controller, Post, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AnonymousTokenResponseDto,
  ValidateAnonymousTokenDto,
  SendOtpDto,
  SendOtpResponseDto,
  VerifyOtpDto,
  AuthTokensDto,
  RefreshTokenDto,
  UpdateProfileDto,
  UserProfileDto,
} from './dto';
import { JwtAuthGuard } from './guards';
import { CurrentUser, CurrentUserData } from './decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('anonymous/token')
  @ApiOperation({ summary: 'Get anonymous user token' })
  @ApiResponse({ status: 201, type: AnonymousTokenResponseDto })
  async getAnonymousToken(): Promise<AnonymousTokenResponseDto> {
    return this.authService.getAnonymousToken();
  }

  @Post('anonymous/validate')
  @ApiOperation({ summary: 'Validate anonymous token' })
  @ApiResponse({ status: 200 })
  async validateAnonymousToken(@Body() dto: ValidateAnonymousTokenDto) {
    return this.authService.validateAnonymousToken(dto.token);
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP code to phone number' })
  @ApiResponse({ status: 201, type: SendOtpResponseDto })
  async sendOtp(@Body() dto: SendOtpDto): Promise<SendOtpResponseDto> {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP code and get tokens' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokensDto> {
    return this.authService.verifyOtp(dto.phone, dto.code, dto.anonymousToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  async refreshTokens(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<UserProfileDto> {
    return this.authService.getProfile(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserProfileDto })
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.authService.updateProfile(user.id, dto);
  }
}
