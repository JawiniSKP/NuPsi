import { Injectable } from '@angular/core';
import { addIcons } from 'ionicons';
import { 
  // Íconos básicos y auth
  mail, lockClosed, logIn, eye, eyeOff,
  logoGoogle, alertCircle, heart, checkmarkCircle,
  
  // Íconos de indicators
  scale, resize, happy, water, create, document, trendingUp,
  
  // Íconos de planes
  calendar, flag, fitness, restaurant, analytics, 
  personOutline, close, swapHorizontal, flash, timer, 
  statsChart, folder, informationCircle, fastFood, warning, 
  flame, settingsOutline,
  
  // Íconos de home
  locationOutline, statsChartOutline, addOutline, 
  removeCircleOutline, addCircleOutline, personCircleOutline, 
  waterOutline, bulbOutline, logOutOutline, menu, home, 
  chatbubble, rocketOutline, sparkles, gridOutline, addCircle, 
  trendingUpOutline,
  
  // Íconos generales
  arrowBack, checkmarkOutline, closeOutline, personCircle,
  time, restaurantOutline, flameOutline
} from 'ionicons/icons';

@Injectable({
  providedIn: 'root'
})
export class IconService {

  constructor() {
    this.registerAllIcons();
  }

  private registerAllIcons() {
    addIcons({
      // === ÍCONOS BÁSICOS ===
      mail, 
      'lock-closed': lockClosed, 
      'log-in': logIn, 
      eye, 
      'eye-off': eyeOff,
      'logo-google': logoGoogle,
      'alert-circle': alertCircle,
      heart,
      'checkmark-circle': checkmarkCircle,
      
      // === INDICATORS ===
      scale,
      resize, 
      happy,
      water,
      create,
      document,
      'trending-up': trendingUp,
      
      // === PLANES ===
      calendar,
      flag,
      fitness,
      restaurant,
      analytics,
      'settings-outline': settingsOutline,
      'person-outline': personOutline,
      close,
      'swap-horizontal': swapHorizontal,
      flash,
      timer,
      'stats-chart': statsChart,
      folder,
      'information-circle': informationCircle,
      'fast-food': fastFood,
      warning,
      flame,
      
      // === HOME ===
      'location-outline': locationOutline,
      'stats-chart-outline': statsChartOutline,
      'add-outline': addOutline,
      'remove-circle-outline': removeCircleOutline,
      'add-circle-outline': addCircleOutline,
      'person-circle-outline': personCircleOutline,
      'water-outline': waterOutline,
      'bulb-outline': bulbOutline,
      'log-out-outline': logOutOutline,
      menu,
      home,
      chatbubble,
      'rocket-outline': rocketOutline,
      sparkles,
      'grid-outline': gridOutline,
      'add-circle': addCircle,
      'trending-up-outline': trendingUpOutline,
      
      // === GENERALES ===
      'arrow-back': arrowBack,
      'checkmark-outline': checkmarkOutline,
      'close-outline': closeOutline,
      'person-circle': personCircle,
      time,
      'restaurant-outline': restaurantOutline,
      'flame-outline': flameOutline
    });
    
    console.log('✅ Todos los íconos registrados correctamente');
  }
}