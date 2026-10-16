import AsyncStorage from '@react-native-async-storage/async-storage';
import {authenticationMode} from '../auth/runtime';
import {createRecoveryStorage} from './recoveryStorage';
export {emptyRecoveryData} from './recoveryStorage';
export {decodeRecoveryData} from './schema';
export const storage=createRecoveryStorage(AsyncStorage,authenticationMode);
