import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BiometriaController } from './biometria.controller';
import { BiometriaService } from './biometria.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que el .env esté disponible en todos lados
    }),
  ],
  controllers: [BiometriaController],
  providers: [BiometriaService],
})
export class AppModule {}
