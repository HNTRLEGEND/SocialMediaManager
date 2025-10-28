import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WiesLogicModule } from './wieslogic/wieslogic.module';
import { RootController } from './root.controller';

@Module({
  imports: [
    WiesLogicModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/ui',
    }),
  ],
  controllers: [RootController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WiesLogic Backend')
    .setDescription('API for multi-customer agent configuration')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`WiesLogic backend listening on http://localhost:${port}`);
}

bootstrap();
