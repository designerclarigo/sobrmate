export const AUTH_REDIRECT='komorebi://auth/callback';
export type AuthIntent='login'|'recovery';
export interface AuthAttempt {id:string;intent:AuthIntent;createdAt:number}
export function authConfiguration(url:string|undefined,key:string|undefined) {
  if(!url||!key||/YOUR_PROJECT|REPLACE_WITH/i.test(url+key))return {ready:false as const,error:'Add the Supabase project URL and publishable key to your local environment, then restart Expo.'};
  try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.search||parsed.hash||!/^sb_publishable_[a-zA-Z0-9_-]{12,}$/.test(key))throw new Error();return {ready:true as const,url:parsed.origin,key};}
  catch{return {ready:false as const,error:'Use an HTTPS Supabase project URL and a public sb_publishable_ key. Never put a service-role key or OAuth secret in this app.'};}
}
export function emailAddress(email:string){
  const normalized=email.trim().toLowerCase();
  if(normalized.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))throw new Error('Enter a valid email address.');
  return normalized;
}
export function loginCredentials(email:string,password:string){
  const normalized=emailAddress(email);
  if(!password||password.length>4096)throw new Error('Enter your password.');
  return {email:normalized,password};
}
export function requireVerifiedEmail(sessionUserId:string,user:{id:string;email?:string;email_confirmed_at?:string}|null){
  if(!user||user.id!==sessionUserId)throw new Error('Your session could not be verified. Please sign in again.');
  if(!user.email||!user.email_confirmed_at)throw new Error('Verify your email address before signing in. Check your inbox for the verification email.');
}
export function signInErrorMessage(error:unknown):string {
  const value=error as {code?:string;status?:number;message?:string}|null;
  if(value?.code==='demo_invalid_credentials')return 'Use the demo email and password shown above. Other credentials are not accepted in Demo Mode.';
  if(value?.code==='auth_not_configured')return 'Secure sign-in needs Supabase configuration. Connect your project and try again.';
  if(value?.code==='invalid_credentials')return 'We couldn’t sign you in. Check your email and password, then try again.';
  if(value?.code==='email_not_confirmed')return 'Verify your email address before signing in. Check your inbox for the verification email.';
  if(value?.status===429||value?.code==='over_request_rate_limit')return 'Too many attempts. Give it a little time before trying again.';
  if(value?.message&&/network|fetch|timed out|connection/i.test(value.message))return 'We couldn’t connect. Check your internet connection and try again.';
  return 'We couldn’t sign you in just now. Please try again.';
}
export function newPassword(password:string,confirmation:string){
  if(password.length<12||password.length>128)throw new Error('Use a password with 12–128 characters.');
  if(password!==confirmation)throw new Error('Your passwords do not match.');
  return password;
}
export function callbackCode(url:string,attempt:AuthAttempt|null,now=Date.now()):{code:string;intent:AuthIntent;flowId?:string} {
  const parsed=new URL(url);
  if(parsed.protocol!=='komorebi:'||parsed.host!=='auth'||parsed.pathname!=='/callback'||parsed.username||parsed.password||parsed.hash)throw new Error('This authentication link is not valid for this app.');
  if(!attempt||!Number.isFinite(attempt.createdAt)||typeof attempt.id!=='string'||!['login','recovery'].includes(attempt.intent)||now-attempt.createdAt>3600000||now<attempt.createdAt||parsed.searchParams.getAll('flow_id').length!==1||parsed.searchParams.getAll('intent').length!==1||parsed.searchParams.get('flow_id')!==attempt.id||parsed.searchParams.get('intent')!==attempt.intent)throw new Error('This sign-in link has expired or was requested on a different device. Start again on this device.');
  if(parsed.searchParams.has('error'))throw new Error('The provider could not complete authentication. Please try again.');
  const codes=parsed.searchParams.getAll('code');
  if(codes.length!==1||!codes[0]||codes[0].length>4096||parsed.searchParams.has('access_token')||parsed.searchParams.has('refresh_token'))throw new Error('The provider did not return a valid authorization code.');
  const flowIds=parsed.searchParams.getAll('sb_flow_id');if(flowIds.length>1||(flowIds.length===1&&!/^[a-zA-Z0-9_-]{8,64}$/.test(flowIds[0])))throw new Error('Invalid authentication flow identifier.');
  return {code:codes[0],intent:attempt.intent,...(flowIds[0]?{flowId:flowIds[0]}:{})};
}
export function redirectFor(attempt:AuthAttempt){return `${AUTH_REDIRECT}?intent=${attempt.intent}&flow_id=${encodeURIComponent(attempt.id)}`;}
