import { Module } from '@nestjs/common';
import { VerificationCodeService } from './verification_code.service';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [
    VerificationCodeService,
    AuthService,
    LocalStrategy,
    SessionSerializer,
  ],
})
export class AuthModule {}
