import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    },
  });

  // 2. Aumentar el límite de tamaño ANTES de abrir el puerto
  app.use(json({ limit: '50mb' }));

  // 3. Iniciar el servidor
  await app.listen(4000);
  console.log(`[+] Cerebro Seguro (API) iniciado en http://localhost:4000`);
}
bootstrap();
