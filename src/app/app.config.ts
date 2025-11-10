import { ApplicationConfig } from '@angular/core';
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

import { 
  // Iconos existentes
  personCircle, home, calendar, chatbubble, people, person,
  bulbOutline, waterOutline, eyeOutline, eyeOffOutline, hourglass,
  create, trash, refresh, time, bed, repeat, trophy, play,
  
  // Nuevos iconos
  arrowBack, fitness, barbell, checkmarkCircle, save, close,
  addCircle, flame, statsChart, swapHorizontal,
  fastFood, informationCircle, restaurant, timer, folder, flash,
  warning, trendingUp, flagOutline, flameOutline, scaleOutline,
  happyOutline, createOutline, pricetagsOutline,
  cartOutline, fitnessOutline, speedometerOutline, lockClosedOutline,
  mailOutline, personOutline, logoGoogle, alertCircle, logInOutline,
  personAddOutline, heart, camera, key, shieldCheckmark, ban,
  checkmark, chevronForward, resizeOutline, documentOutline,
  heartOutline, trendingUpOutline, settingsOutline, closeCircle
} from 'ionicons/icons';

// Configurar TODOS los iconos globalmente
addIcons({
  // Iconos existentes
  personCircle, home, calendar, chatbubble, people, person,
  bulbOutline, waterOutline, eyeOutline, eyeOffOutline, hourglass,
  create, trash, refresh, time, bed, repeat, trophy, play,
  
  // Nuevos iconos
  arrowBack, fitness, barbell, checkmarkCircle, save, close,
  addCircle, flame, statsChart, swapHorizontal, fastFood,
  informationCircle, restaurant, timer, folder, flash, warning,
  trendingUp, flagOutline, flameOutline, scaleOutline, happyOutline,
  createOutline, pricetagsOutline, cartOutline, fitnessOutline,
  speedometerOutline, lockClosedOutline, mailOutline, personOutline,
  logoGoogle, alertCircle, logInOutline, personAddOutline, heart,
  camera, key, shieldCheckmark, ban, checkmark, chevronForward,
  resizeOutline, documentOutline, heartOutline, trendingUpOutline,
  settingsOutline, closeCircle
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({}),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(), // 👈 habilita HttpClient
    importProvidersFrom(FormsModule) // 👈 habilita FormsModule
  ]
};
