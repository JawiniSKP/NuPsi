import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { environment } from '../environments/environment';
import { addIcons } from 'ionicons';
import { 
  personCircle, home, calendar, chatbubble, people, person,
  bulbOutline, waterOutline, hourglass, create, trash, refresh, 
  time, bed, repeat, trophy, play, arrowBack, fitness, barbell, 
  checkmarkCircle, save, close, addCircle, flame, statsChart, 
  swapHorizontal, fastFood, informationCircle, restaurant, timer, 
  folder, flash, warning, trendingUp, flameOutline, scaleOutline,
  happyOutline, pricetagsOutline, cartOutline, fitnessOutline,
  speedometerOutline, personOutline, logoGoogle, alertCircle, 
  personAddOutline, heart, camera, key, shieldCheckmark, ban, 
  checkmark, chevronForward, resizeOutline, documentOutline,
  heartOutline, trendingUpOutline, settingsOutline, closeCircle,
  personCircleOutline, removeCircleOutline, addCircleOutline,
  rocketOutline, gridOutline, eyeOutline, eyeOffOutline,
  mailOutline, lockClosedOutline, logInOutline, cameraOutline,
  createOutline, chevronForwardOutline, flagOutline, calendarOutline,
  swapHorizontalOutline, timeOutline, pause, playOutline,
  stopOutline, logOutOutline, heartCircleOutline, water, analyticsOutline,
  sparklesOutline, sparkles
} from 'ionicons/icons';

// Configurar TODOS los iconos globalmente
addIcons({
  // Se mapean los iconos importados a su nombre de uso
  personCircle, home, calendar, chatbubble, people, person,
  bulbOutline, waterOutline, hourglass, create, trash, refresh, 
  time, bed, repeat, trophy, play, arrowBack, fitness, barbell, 
  checkmarkCircle, save, close, addCircle, flame, statsChart, 
  swapHorizontal, fastFood, informationCircle, restaurant, timer, 
  folder, flash, warning, trendingUp, flameOutline, scaleOutline,
  happyOutline, pricetagsOutline, cartOutline, fitnessOutline,
  speedometerOutline, personOutline, logoGoogle, alertCircle, 
  personAddOutline, heart, camera, key, shieldCheckmark, ban, 
  checkmark, chevronForward, resizeOutline, documentOutline,
  heartOutline, trendingUpOutline, settingsOutline, closeCircle,
  personCircleOutline, removeCircleOutline, addCircleOutline,
  rocketOutline, gridOutline, eyeOutline, eyeOffOutline,
  mailOutline, lockClosedOutline, logInOutline, cameraOutline,
  createOutline, chevronForwardOutline, flagOutline, calendarOutline,
  swapHorizontalOutline, timeOutline, pause, playOutline,
  stopOutline, 'log-out-outline': logOutOutline,
  water, analyticsOutline, 'heart-circle-outline': heartCircleOutline,
  sparklesOutline, sparkles
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({}),
    
    // Configuración de Firebase
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    
    // Configuración de Módulos (usando Standalone/providers)
    provideHttpClient(), // 1. Habilita HttpClient
    importProvidersFrom(FormsModule), // 2. Habilita Forms (para NgModel)
    
    // 3. Habilita ngx-markdown.for Root() se ejecuta una sola vez.
    importProvidersFrom(MarkdownModule.forRoot()),
  ]
};