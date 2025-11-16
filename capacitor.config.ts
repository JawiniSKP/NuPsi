import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.nupsi.app',
  appName: 'NuPsi',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Preparado para futura integración con Google Auth nativo
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1097015901539-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;