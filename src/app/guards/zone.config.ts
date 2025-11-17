import { provideZoneChangeDetection } from '@angular/core';

export const zoneConfig = provideZoneChangeDetection({
  eventCoalescing: true,
  runCoalescing: true
});