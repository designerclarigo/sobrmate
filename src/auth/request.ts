/** Bound native auth requests so an unavailable network cannot leave sign-in spinning forever. */
export function authFetch(transport:typeof fetch,timeoutMs=20000):typeof fetch {
  return async(input,options)=>{
    const controller=new AbortController();
    const upstream=options?.signal;
    const cancel=()=>controller.abort();
    if(upstream?.aborted)cancel();else upstream?.addEventListener('abort',cancel,{once:true});
    let timedOut=false;
    const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
    try{return await transport(input,{...options,signal:controller.signal});}
    catch(error){if(timedOut)throw new Error('Sign-in request timed out. Check your connection and try again.');throw error;}
    finally{clearTimeout(timer);upstream?.removeEventListener('abort',cancel);}
  };
}
