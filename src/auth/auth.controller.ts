import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from "./auth.service.js";
import { AuthGuard } from "./auth.guard.js";
import { Public } from "./public.decorator.js";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";

class SignInDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Request() req) {
    return req.user;
  }
}
