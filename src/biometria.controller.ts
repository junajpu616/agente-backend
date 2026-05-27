import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { BiometriaService } from './biometria.service';

@Controller('biometria')
export class BiometriaController {
  constructor(private readonly biometriaService: BiometriaService) {}

  @Post('analizar')
  async analizar(@Body('imagen') imagen: string) {
    if (!imagen) {
      throw new BadRequestException(
        'Se requiere el string base64 de la imagen',
      );
    }
    console.log('[+] Recibida solicitud de escaneo biométrico...');
    const reporte = await this.biometriaService.analizarImagen(imagen);
    return { reporte };
  }

  @Post('preguntar')
  async preguntar(@Body('pregunta') pregunta: string) {
    if (!pregunta) throw new BadRequestException('Se requiere una pregunta');
    const respuesta = await this.biometriaService.hacerPregunta(pregunta);
    return { respuesta };
  }
}
