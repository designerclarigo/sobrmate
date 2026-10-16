import {authConfiguration} from './authPolicy';
import {resolveAuthMode} from './mode';
export const authConfig=authConfiguration(process.env.EXPO_PUBLIC_SUPABASE_URL,process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const isDevelopmentRuntime=typeof __DEV__!=='undefined'&&__DEV__;
export const authenticationMode=resolveAuthMode(isDevelopmentRuntime,process.env.EXPO_PUBLIC_AUTH_MODE,authConfig.ready);
