import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS for frontend
app.enableCors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://dashboard.giyuu.online',
    'https://dashboard-hadirapp.giyuu.online',
  ],
  credentials: true,
});

  // Serve static files from uploads folder
  // In development: HadirAPP/uploads
  // __dirname in runtime points to dist/src, so we need to go up twice
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('HadirApp API')
    .setDescription('API documentation for attendance system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();