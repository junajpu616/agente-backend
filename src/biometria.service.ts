import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class BiometriaService {
  private clienteIa: OpenAI;
  private historial: any[] = []; // Memoria de la sesión actual

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('Falta OPENAI_API_KEY en el archivo .env');
    this.clienteIa = new OpenAI({ apiKey });
  }

  async analizarImagen(imagenBase64: string): Promise<string> {
    const promptMedico = `
      Actúa como un analista de bienestar general para un ejercicio académico de desarrollo de software.
      Analiza estrictamente la figura humana en esta imagen de forma 100% anónima. No busques identificar rostros ni identidades.
      No diagnostiques enfermedades, no confirmes si alguien está enfermo y no des conclusiones médicas a partir de la imagen.            
      Sí puedes describir rasgos visibles no sensibles y observables como color de pelo, barba, bigote, lentes, gorra, tipo de ropa, postura, accesorios y expresión general.
      Si la pregunta del usuario es sobre salud o estado físico, responde con una advertencia breve de que no puedes determinarlo por imagen,
      luego ofrece observaciones no clínicas, generales y prudentes, y termina con una recomendación de consultar a un profesional si hay preocupación real.
      
      Basado en la relación de aspecto, volumen y proporciones visuales de la figura, genera un reporte técnico con estimaciones hipotéticas de:
      - Estatura aproximada (en metros)
      - Peso aproximado (en kg)
      - IMC (Índice de Masa Corporal) calculado
      - Complexión
      - Género aparente
      - Emociones o expresiones faciales visibles (si las hay)
      - Rango de Edad
      - Edad estimada (número exacto, más no preciso)
      - Color de pelo visible
      - Presencia de barba o bigote
      - Uso de lentes o accesorios
      - Tipo de ropa visible
      - Salud general aparente (con advertencia de que no es diagnóstico)
      
      Devuelve SOLO el reporte estructurado en formato de texto, con tono claro, prudente y orientado a bienestar.
    `;

    // 1. Reseteamos el historial (Cerebro nuevo)
    this.historial = [
      {
        role: 'system',
        content:
          'Eres un asistente de bienestar general. Responde de forma técnica y prudente a las preguntas de seguimiento sobre la persona analizada.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: promptMedico },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imagenBase64}`,
              detail: 'low',
            },
          },
        ],
      },
    ];

    try {
      const respuesta = await this.clienteIa.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: this.historial,
        max_tokens: 300,
      });

      const reporte = respuesta.choices[0].message.content || 'Sin respuesta.';

      // 2. Guardamos la respuesta para dar contexto a las futuras preguntas
      this.historial.push({ role: 'assistant', content: reporte });
      return reporte;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error procesando la imagen biometríca',
      );
    }
  }

  async hacerPregunta(pregunta: string): Promise<string> {
    if (this.historial.length === 0) {
      return 'Error: Aún no se ha escaneado a ningún objetivo.';
    }

    // 1. Agregamos la nueva pregunta a la memoria
    this.historial.push({ role: 'user', content: pregunta });

    try {
      const respuesta = await this.clienteIa.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: this.historial,
        max_tokens: 200,
      });

      const respuestaIA =
        respuesta.choices[0].message.content || 'Sin respuesta.';

      // 2. Guardamos la respuesta de la IA
      this.historial.push({ role: 'assistant', content: respuestaIA });
      return respuestaIA;
    } catch (error) {
      throw new InternalServerErrorException('Error al consultar a OpenAI');
    }
  }
}
