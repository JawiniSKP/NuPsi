import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { addIcons } from 'ionicons';
import { 
  // Iconos existentes (sin duplicados)
  personCircle, home, calendar, chatbubble, people, person,
  bulbOutline, waterOutline, hourglass,
  create, trash, refresh, time, bed, repeat, trophy, play,
  
  // Nuevos iconos (sin duplicados)
  arrowBack, fitness, barbell, checkmarkCircle, save, close,
  addCircle, flame, statsChart, swapHorizontal,
  fastFood, informationCircle, restaurant, timer, folder, flash,
  warning, trendingUp, flameOutline, scaleOutline,
  happyOutline, pricetagsOutline,
  cartOutline, fitnessOutline, speedometerOutline,
  personOutline, logoGoogle, alertCircle, personAddOutline, heart,
  camera, key, shieldCheckmark, ban, checkmark, chevronForward,
  resizeOutline, documentOutline,
  heartOutline, trendingUpOutline, settingsOutline, closeCircle,

  // ✅ NUEVOS ICONOS OUTLINE FALTANTES (sin duplicados):
  personCircleOutline,
  removeCircleOutline,
  addCircleOutline,
  rocketOutline,
  gridOutline,
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  logInOutline,
  cameraOutline,
  createOutline,
  chevronForwardOutline,
  flagOutline,
  calendarOutline,
  swapHorizontalOutline,
  timeOutline,
  pause,
  playOutline,
  stopOutline
} from 'ionicons/icons';

// Configurar TODOS los iconos globalmente (sin duplicados)
addIcons({
  // Iconos existentes
  personCircle, home, calendar, chatbubble, people, person,
  bulbOutline, waterOutline, hourglass,
  create, trash, refresh, time, bed, repeat, trophy, play,
  
  // Nuevos iconos
  arrowBack, fitness, barbell, checkmarkCircle, save, close,
  addCircle, flame, statsChart, swapHorizontal, fastFood,
  informationCircle, restaurant, timer, folder, flash, warning,
  trendingUp, flameOutline, scaleOutline, happyOutline,
  pricetagsOutline, cartOutline, fitnessOutline,
  speedometerOutline, personOutline, logoGoogle, alertCircle, 
  personAddOutline, heart, camera, key, shieldCheckmark, ban,
  checkmark, chevronForward, resizeOutline, documentOutline,
  heartOutline, trendingUpOutline, settingsOutline, closeCircle,

  // ✅ NUEVOS ICONOS OUTLINE FALTANTES:
  personCircleOutline,
  removeCircleOutline,
  addCircleOutline,
  rocketOutline,
  gridOutline,
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  lockClosedOutline,
  logInOutline,
  cameraOutline,
  createOutline,
  chevronForwardOutline,
  flagOutline,
  calendarOutline,
  swapHorizontalOutline,
  timeOutline,
  pause,
  playOutline,
  stopOutline
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular({}),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};