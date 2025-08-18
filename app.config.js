module.exports = {
  expo: {
    name: 'discover-sports-hk',
    slug: 'discover-sports-hk',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'discoversportshk',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.openpandata.discoversportshk',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.openpandata.discoversportshk',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-localization',
      [
        'expo-dev-client',
        {
          launchMode: 'most-recent',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'c3064d08-3e1b-4645-8c4e-5258bd32144c',
      },
      // OpenPanData Multi-API Configuration
      // Cloudflare Worker API
      WORKER_API_BASE_URL:
        process.env.WORKER_API_BASE_URL || 'https://openpandata-worker.openpandata.workers.dev',
      WORKER_API_KEY: process.env.WORKER_API_KEY,
      WORKER_API_RETRY_ATTEMPTS: process.env.WORKER_API_RETRY_ATTEMPTS || '3',
      WORKER_API_TIMEOUT: process.env.WORKER_API_TIMEOUT || '15000',

      // Backend API
      BACKEND_API_BASE_URL: process.env.BACKEND_API_BASE_URL || 'https://api.openpandata.com',
      BACKEND_API_KEY: process.env.BACKEND_API_KEY,
      BACKEND_API_RETRY_ATTEMPTS: process.env.BACKEND_API_RETRY_ATTEMPTS || '3',
      BACKEND_API_TIMEOUT: process.env.BACKEND_API_TIMEOUT || '20000',
      BACKEND_CLIENT_ID: process.env.BACKEND_CLIENT_ID,

      // Shared Configuration
      APP_SIGNATURE: process.env.APP_SIGNATURE,
      BACKEND_APP_SIGNATURE: process.env.BACKEND_APP_SIGNATURE,
      BUNDLE_ID: process.env.BUNDLE_ID || 'com.openpandata.discoversportshk',
      DEFAULT_API: process.env.DEFAULT_API || 'worker',
      DATA_CACHE_TTL: process.env.DATA_CACHE_TTL || '1800000', // 30 minutes
    },
    owner: 'niskan516.dev',
  },
};
