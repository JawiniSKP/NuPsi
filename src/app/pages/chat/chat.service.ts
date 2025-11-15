import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  // 👇 AHORA se obtiene desde environment.ts
  private rasaUrl = environment.rasaUrl;


  constructor(private http: HttpClient) {}

  public sendMessage(message: string, sender: string = 'user'): Observable<RasaResponse[]> {
    const body = {
      sender: sender,
      message: message
    };

    return this.http.post<RasaResponse[]>(this.rasaUrl, body);
  }
}
