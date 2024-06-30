import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  await app.listen(3000);
}
bootstrap();
