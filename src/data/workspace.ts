import {authenticationMode} from '../auth/runtime';
import {workspaceKey} from '../auth/mode';
/** Production keys stay byte-for-byte compatible; demo never reads the production archive. */
export const localWorkspaceKey=(key:string)=>workspaceKey(key,authenticationMode);
