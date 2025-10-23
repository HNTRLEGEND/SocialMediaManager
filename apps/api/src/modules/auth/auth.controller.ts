import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('sign-in')
  signIn(@Body() body: SignInDto) {
    // In einem echten System würde hier Clerk/Stripe geprüft.
    const token = this.auth.signToken({ sub: body.userId, tenantId: body.tenantId, role: body.role });
    return { token };
  }
}
