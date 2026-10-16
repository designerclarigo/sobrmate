export type AuthenticationMode='demo'|'supabase';
/** Release runtimes never accept a public environment flag as permission to bypass auth. */
export function resolveAuthMode(development:boolean,requested:string|undefined,supabaseReady:boolean):AuthenticationMode {
  if(!development)return 'supabase';
  if(requested==='supabase')return 'supabase';
  if(requested==='demo')return 'demo';
  if(requested&&requested!=='auto')return 'supabase';
  return supabaseReady?'supabase':'demo';
}
export function workspaceKey(key:string,mode:AuthenticationMode){return mode==='demo'?`demo.${key}`:key;}
