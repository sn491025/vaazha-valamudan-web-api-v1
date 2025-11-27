import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app/app.controller';
import { AppService } from './app/services/app.service';
import { AppDataSource } from './config/typeorm.config';
import { AuthModule, UsersModule, SharedModule } from './modules';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter, ResponseTransformInterceptor } from './common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { MasterModule } from './modules/master/master.module';
import { PropertyModule } from './modules/property/property.module';
import { SubscriptionModule } from './modules/subscription';
import { AdsModule } from './modules/ads/ads.module';
import { UserInteractionsModule } from './modules/user-interactions/user-interactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: path.resolve(
        process.cwd(),
        process.env.NODE_ENV === 'qa'
          ? '.env.qa'
          : process.env.NODE_ENV === 'production'
            ? '.env.production'
            : '.env.development'
      ),
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'qa', 'production').default('development'),
        PORT: Joi.number().default(3000),

        // Database
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().allow('', null),
        DB_NAME: Joi.string().required(),

        // JWT
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_ACCESS_TTL_WEB: Joi.string().default('15m'),
        JWT_REFRESH_TTL_WEB: Joi.string().default('7d'),
        JWT_ACCESS_TTL_MOBILE: Joi.string().default('30m'),
        JWT_REFRESH_TTL_MOBILE: Joi.string().default('30d'),

        // Public token
        PUBLIC_TOKEN_SECRET: Joi.string().optional(),

        // CORS
        CORS_ORIGINS: Joi.string().optional(),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { singleLine: true, translateTime: 'SYS:standard' } }
          : undefined,
        genReqId: (req) => (req.headers['x-request-id'] as string) || randomUUID(),
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'req.body.password',
            'req.body.token',
          ],
          remove: true,
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60_000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
        autoLoadEntities: true
      })
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    MasterModule,
    PropertyModule,
    SubscriptionModule,
    AdsModule,
    UserInteractionsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }
  ]
})
export class AppModule {}
