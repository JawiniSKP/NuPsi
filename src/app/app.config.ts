import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { addIcons } from 'ionicons';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
// No necesitas importar HttpClientModule y MarkdownModule aquí si los provees con `importProvidersFrom`
// import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown'; // <-- Importa esto

import { 
  personCircle, 
  home, 
  calendar, 
  chatbubble, 
  people, 
  person,
  bulbOutline,
  waterOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

// Configurar iconos globalmente
addIcons({
  personCircle, 
  home, 
  calendar, 
  chatbubble, 
  people, 
  person,
  bulbOutline,
  waterOutline,
  eyeOutline,
  eyeOffOutline
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({}),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(), // Habilita HttpClient para toda la app
    importProvidersFrom(FormsModule), // Habilita FormsModule para toda la app
    importProvidersFrom(MarkdownModule.forRoot()), // <-- AÑADE ESTO para MarkdownModule
    importProvidersFrom(MarkdownModule.forRoot())
  ]
};