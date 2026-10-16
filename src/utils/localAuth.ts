import { Platform } from 'react-native';

export interface BiometricStatus {
  isHardwareAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: ('facial' | 'fingerprint' | 'iris')[];
  label: string;
}

/**
 * Biometric authentication service using Expo LocalAuthentication with robust fallbacks
 */
class LocalAuthService {
  /**
   * Check biometric hardware capability on the device
   */
  async checkBiometricsSupport(): Promise<BiometricStatus> {
    if (Platform.OS === 'web') {
      return {
        isHardwareAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        label: 'PIN Passcode',
      };
    }

    try {
      const LocalAuthentication = require('expo-local-authentication');
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypesRaw = await LocalAuthentication.supportedAuthenticationTypesAsync();

      const supportedTypes: ('facial' | 'fingerprint' | 'iris')[] = [];
      if (supportedTypesRaw.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        supportedTypes.push('facial');
      }
      if (supportedTypesRaw.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        supportedTypes.push('fingerprint');
      }
      if (supportedTypesRaw.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        supportedTypes.push('iris');
      }

      let label = 'Biometrics';
      if (supportedTypes.includes('facial') && Platform.OS === 'ios') {
        label = 'Face ID';
      } else if (supportedTypes.includes('fingerprint')) {
        label = Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      }

      return {
        isHardwareAvailable: hasHardware,
        isEnrolled,
        supportedTypes,
        label,
      };
    } catch {
      return {
        isHardwareAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        label: 'PIN Passcode',
      };
    }
  }

  /**
   * Prompt biometric authentication with a fallback message
   */
  async authenticateWithBiometrics(promptMessage = 'Unlock SobrMate'): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Web environment does not support native biometrics' };
    }

    try {
      const LocalAuthentication = require('expo-local-authentication');
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return { success: false, error: 'Biometrics unavailable or not enrolled' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Enter Sanctuary PIN',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      return {
        success: result.success,
        error: result.success ? undefined : result.error,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Biometric authentication failed',
      };
    }
  }
}

export const localAuthService = new LocalAuthService();
