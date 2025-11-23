import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// ✅ IMPORTS COMPLETOS DE CAPACITOR
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

export interface RasaResponse {
  recipient_id: string;
  text?: string;
  image?: string;
  buttons?: any[];
  custom?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private rasaUrl = environment.rasaUrl;
  private http = inject(HttpClient);

  constructor() {}

  // ✅ NUEVO MÉTODO: Verificar conexión en móvil
  private async checkNetworkConnection(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Network.getStatus();
        console.log('📱 Estado de conexión:', status.connected ? 'Conectado' : 'Sin conexión');
        return status.connected;
      } catch (error) {
        console.warn('⚠️ No se pudo verificar la conexión:', error);
        return true; // Asumir conexión si no se puede verificar
      }
    }
    return true; // En web, siempre asumir conexión
  }

  // ✅ CORREGIDO: Método completo con verificación de conexión
  public sendMessage(message: string, sender: string = 'user', metadata?: any): Observable<RasaResponse[]> {
    const body: any = {
      sender: sender,
      message: message
    };

    if (metadata && typeof metadata === 'object') {
      body.metadata = metadata;
    }

    // ✅ CREAR OBSERVABLE CON MANEJO DE CONEXIÓN
    return from(this.sendMessageWithRetry(body));
  }

  // ✅ Método para setear un slot en Rasa usando el endpoint de tracker events
  public async setSlot(conversationId: string, slotName: string, value: any): Promise<void> {
    try {
      const base = new URL(this.rasaUrl).origin;
      const url = `${base}/conversations/${encodeURIComponent(conversationId)}/tracker/events`;
      const body = { event: 'slot', name: slotName, value };
      await this.http.post(url, body).toPromise();
      console.log(`✅ Slot '${slotName}' set for conversation ${conversationId}`);
    } catch (err) {
      console.warn('⚠️ No se pudo setear slot en Rasa:', err);
    }
  }

  // ✅ NUEVO MÉTODO: Envío con manejo de errores mejorado
  private async sendMessageWithRetry(body: any): Promise<RasaResponse[]> {
    try {
      // ✅ VERIFICAR CONEXIÓN EN MÓVIL
      const hasConnection = await this.checkNetworkConnection();
      if (!hasConnection) {
        throw new Error('NO_CONNECTION');
      }

      console.log('📡 Enviando mensaje a RASA...');

      // ✅ TIMEOUT DE 15 SEGUNDOS PARA MÓVIL
      const response = await this.http.post<RasaResponse[]>(this.rasaUrl, body)
        .pipe(
          timeout(15000), // 15 segundos timeout
          catchError(error => {
            console.error('❌ Error en conexión RASA:', error);
            
            if (error.name === 'TimeoutError') {
              throw new Error('TIMEOUT');
            } else if (error.status === 0) {
              throw new Error('NETWORK_ERROR');
            } else {
              throw error;
            }
          })
        )
        .toPromise();

      console.log('✅ Respuesta recibida de RASA');
      return response || [];

    } catch (error: any) {
      console.error('❌ Error enviando mensaje a RASA:', error);
      
      // ✅ MANEJO ESPECÍFICO DE ERRORES PARA MÓVIL
      if (error.message === 'NO_CONNECTION') {
        throw new Error('📱 No tienes conexión a internet. Conéctate y vuelve a intentarlo.');
      } else if (error.message === 'TIMEOUT') {
        throw new Error('⏰ El servidor está tardando demasiado en responder. Intenta nuevamente.');
      } else if (error.message === 'NETWORK_ERROR') {
        throw new Error('🌐 Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else {
        throw new Error('❌ Error al conectar con el asistente. Intenta más tarde.');
      }
    }
  }
}