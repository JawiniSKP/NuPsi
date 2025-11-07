import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Define la estructura de una respuesta individual de Rasa.
 * Rasa puede responder con texto, botones, imágenes, etc.
 * Por ahora, nos enfocamos en el texto.
 */
export interface RasaResponse {
  recipient_id: string;
  text?: string;
  // Aquí podrías agregar otras propiedades como buttons, image, etc.
  // buttons?: { title: string; payload: string; }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  /**
   * URL del webhook de Rasa.
   * - Usa 'http://localhost:5005' si pruebas en un navegador web en la misma máquina.
   * - Usa 'http://10.0.2.2:5005' si usas el emulador oficial de Android Studio.
   * - Si usas un dispositivo físico, reemplaza 'localhost' con la IP de tu computadora en la red local (ej: 'http://192.168.1.10:5005').
   */
  private rasaUrl = 'http://localhost:5005/webhooks/rest/webhook';

  // Inyectamos el cliente HTTP de Angular para hacer las peticiones.
  constructor(private http: HttpClient) {}

  /**
   * Envía un mensaje al servidor de Rasa y devuelve la respuesta del bot.
   * @param message El mensaje de texto del usuario.
   * @returns Un Observable que emite un array de respuestas de Rasa.
   */
  public sendMessage(message: string): Observable<RasaResponse[]> {
    
    // El cuerpo de la petición (payload) que Rasa espera.
    const body = {
      sender: 'user', // Un identificador único para el usuario de la conversación.
      message: message
    };

    // Realizamos una petición HTTP POST a la URL de Rasa.
    // Esperamos que la respuesta sea un array de objetos de tipo RasaResponse.
    return this.http.post<RasaResponse[]>(this.rasaUrl, body);
  }
}