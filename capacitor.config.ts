import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jawini.nupsi', // ✅ ACTUALIZAR con tu package name real
  appName: 'NuPsi',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Preferences: {},
    Haptics: {},
    Browser: {}
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;