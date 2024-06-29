import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  // app.use('/admin/images/_actions/upload', bodyParser.raw({
    // limit: '1500000000',
  // }));
  await app.listen(3000);
}
bootstrap();
