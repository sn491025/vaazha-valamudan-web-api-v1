import { Module } from '@nestjs/common';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/services/login.service';
import { RegisterController } from './register/register.controller';
import { RegisterService } from './register/services/register.service';
import { ForgotPasswordController } from './forgot-password/forgot-password.controller';
import { ForgotPasswordService } from './forgot-password/services/forgot-password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginHistory } from './entities/login-history.entity';
import { UsersModule } from '../users';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthService } from './services/jwt-auth.service';
import { PublicTokenService } from './services/public-token.service';

const services = [
  LoginService,
  RegisterService,
  ForgotPasswordService,
  JwtAuthService,
  PublicTokenService,
  JwtStrategy
];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([LoginHistory]),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'CHANGE_ME',
        signOptions: {
          algorithm: 'HS256',
          expiresIn: '1d'
        }
      })
    })
  ],
  controllers: [LoginController, RegisterController, ForgotPasswordController],
  providers: services,
  exports: [...services, JwtModule, TypeOrmModule]
})
export class AuthModule {}
