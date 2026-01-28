import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: config.name || 'House AI',
    slug: config.slug || 'house-ai',
    extra: {
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
      buildTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }
  };
};
