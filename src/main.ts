import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS (allow env list or default for dev)
  app.enableCors({
    origin: true,
    credentials: true
  });

  // Enable validation pipe globally with recommended options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Vaazhga Valamudan API')
    .setDescription('Vaazhga Valamudan Management System API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token'
      },
      'JWT-auth'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-public-token',
        in: 'header',
        description: 'Public token for public endpoints'
      },
      'Public-token'
    )
    .setContact(
      'Vaazhga Valamudan',
      'https://VaazhgaValamudan.com/',
      'admin@vaazhgavalamudan.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.getHttpAdapter().get('/swagger-json', (req, res) => {
    res.json(document);
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
