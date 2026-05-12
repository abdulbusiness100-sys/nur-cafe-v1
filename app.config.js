// app.config.js — replaces app.json for environment variable support
// Secrets are loaded from .env.local (git-ignored) via process.env
// In EAS Build, set these in eas.json or the Expo dashboard
const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: IS_DEV ? 'Nur Café (Dev)' : 'Nur Café',
    slug: 'nur-cafe',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#9C5148',
    },
    scheme: IS_DEV ? 'nurcafe-dev' : 'nurcafe',
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV ? 'com.nurcafe.app.dev' : 'com.nurcafe.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#9C5148',
      },
      edgeToEdgeEnabled: true,
      package: IS_DEV ? 'com.nurcafe.app.dev' : 'com.nurcafe.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      [
        '@stripe/stripe-react-native',
        {
          merchantIdentifier: 'merchant.com.nurcafe.app',
        },
      ],
    ],
    extra: {
      // These are injected at build time from .env.local or EAS Secrets
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: 'dc18dacd-c3d3-481c-911e-bce8fbffc6b3',
      },
    },
  },
};
