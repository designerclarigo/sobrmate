import {localWorkspaceKey} from './workspace';
import React,{createContext,useContext,useEffect,useState,useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useRecoveryStore } from './store';
import { MockMembership,SubscriptionPlan,PremiumFeatureKey,FREE_MEMBERSHIP,activateMockPlan,decodeMockMembership,hasPremiumAccess,canAccessFeature } from './entitlements';
export type {PremiumFeatureKey} from './entitlements';
const KEY=localWorkspaceKey('@komorebi:mock-membership:v1');
interface PremiumState {membership:MockMembership;isPremium:boolean;isLoading:boolean;error:string;mode:'mock';screen:'paywall'|'success'|'manage'|null;isPaywallOpen:boolean;activePaywallFeature:PremiumFeatureKey|null;canAccess:(feature:PremiumFeatureKey)=>boolean;openPaywall:(feature?:PremiumFeatureKey)=>void;closePaywall:()=>void;openManagement:()=>void;activate:(plan:SubscriptionPlan,presentSuccess?:boolean)=>Promise<void>;restorePurchases:()=>Promise<string>;cancelSubscription:()=>Promise<void>;resetMockAccess:()=>Promise<void>;retryLoad:()=>Promise<void>}
const Context=createContext<PremiumState|null>(null);
export function PremiumProvider({children}:{children:React.ReactNode}) {
  const [membership,setMembership]=useState<MockMembership>({...FREE_MEMBERSHIP});const [isLoading,setLoading]=useState(true);const [error,setError]=useState('');
  const [screen,setScreen]=useState<PremiumState['screen']>(null);const [feature,setFeature]=useState<PremiumFeatureKey|null>(null);const pending=useRef(false);
  const {currentTime}=useRecoveryStore('day');
  const [clock,setClock]=useState(()=>Date.now());
  useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state==='active')setClock(Date.now());});return()=>sub.remove();},[]);
  useEffect(()=>{if(!membership.expiresAt||Date.parse(membership.expiresAt)<=clock)return;const timer=setTimeout(()=>setClock(Date.now()),Math.min(2147483000,Math.max(1,Date.parse(membership.expiresAt)-Date.now())));return()=>clearTimeout(timer);},[membership.expiresAt,clock]);
  const retryLoad=async()=>{setLoading(true);setError('');try{setMembership(decodeMockMembership(await AsyncStorage.getItem(KEY)));}catch(e){setError(e instanceof Error?e.message:'Could not read mock access.');}finally{setLoading(false);}};
  useEffect(()=>{void retryLoad();},[]);
  const persist=async(next:MockMembership)=>{if(pending.current)throw new Error('A subscription update is already in progress.');pending.current=true;try{await AsyncStorage.setItem(KEY,JSON.stringify(next));setMembership(next);setError('');}finally{pending.current=false;}};
  const effectiveTime=new Date(Math.max(clock,currentTime.getTime()));
  const isPremium=hasPremiumAccess(membership,effectiveTime);
  // Settings can show success inside its existing modal host. Other callers retain the global sheet.
  const activate=async(plan:SubscriptionPlan,presentSuccess=true)=>{await persist(activateMockPlan(plan));if(presentSuccess)setScreen('success');};
  const restorePurchases=async()=>{const saved=decodeMockMembership(await AsyncStorage.getItem(KEY));if(!hasPremiumAccess(saved))throw new Error('No active mock purchase is saved on this device. No store was contacted.');setMembership(saved);setError('');return 'Mock access restored from this device. No store was contacted.';};
  const value:PremiumState={membership,isPremium,isLoading,error,mode:'mock',screen,isPaywallOpen:screen==='paywall',activePaywallFeature:feature,
    canAccess:key=>!isLoading&&canAccessFeature(membership,key,effectiveTime),
    openPaywall:key=>{setFeature(key||null);setScreen('paywall');},closePaywall:()=>setScreen(null),openManagement:()=>setScreen('manage'),activate,restorePurchases,
    cancelSubscription:async()=>{if(membership.status==='free')throw new Error('There is no active mock plan to cancel.');await persist({...membership,status:'cancelled'});},resetMockAccess:()=>persist({...FREE_MEMBERSHIP}),retryLoad};
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePremium(){const value=useContext(Context);if(!value)throw new Error('usePremium requires PremiumProvider');return value;}
