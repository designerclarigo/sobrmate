import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import { Check, Crown } from 'lucide-react-native';
import { usePremium } from '../../data/premium';
import { SubscriptionPlanOptions,SubscriptionComparison,SubscriptionDisclosure } from '../premium/SubscriptionPlans';
import { MOCK_PLANS, PREMIUM_FEATURES, SubscriptionPlan } from '../../data/entitlements';
import { SettingsBusyContext, SettingsButton, SettingsCard, SettingsHero, SettingsNotice, SettingsPressable, SettingsText, useSettingsPalette } from './SettingsUI';

/** Uses the central entitlement service without stacking a second native modal. */
export function SettingsMembership({screen,onNavigate}:{screen:'plans'|'membership'|'premium-success';onNavigate:(screen:'plans'|'membership'|'premium-success'|'pro')=>void}) {
  const p=useSettingsPalette(),premium=usePremium(),pending=useContext(SettingsBusyContext);
  const [plan,setPlan]=useState<SubscriptionPlan>(premium.membership.plan??'yearly'),[message,setMessage]=useState(''),[confirm,setConfirm]=useState(false);
  const success=screen==='premium-success',manage=screen==='membership';
  return <>
    <SettingsHero icon={success?Check:Crown} eyebrow="Development mock mode" title={success?'A little more room to grow.':manage?'Your membership.':'More room to grow.'} description={success?'Mock access is active on this device.':'More perspective for your personal journey.'}/>
    <SubscriptionDisclosure plan={manage?(premium.membership.plan??plan):plan}/>
    {premium.error&&<><SettingsNotice error>{premium.error}</SettingsNotice><SettingsButton label="Retry reading membership" variant="secondary" onPress={premium.retryLoad}/></>}
    {success?<><SettingsText serif align="center" style={{fontSize:24,lineHeight:30,color:p.title}}>More perspective. The same gentle pace.</SettingsText><SettingsButton label="Continue my journey" onPress={()=>onNavigate('pro')}/></>:manage?<>
      <SettingsCard padded><SettingsText weight="500" style={{fontSize:16,lineHeight:24,color:p.title,marginBottom:12}}>{premium.isPremium?`${MOCK_PLANS[premium.membership.plan!].title} mock membership`:'Free membership'}</SettingsText><SettingsText style={{lineHeight:22.2}}>{premium.isPremium?`${premium.membership.status==='cancelled'?'Ends':'Preview expires'} ${new Date(premium.membership.expiresAt!).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}. Your recorded journey stays yours.`:'Daily tracking, check-ins, Week and Month calendars, milestones and app security are available.'}</SettingsText></SettingsCard>
      <SettingsButton label={premium.isPremium?'Change mock plan':'Explore mock plans'} onPress={()=>onNavigate('plans')}/>
      {premium.isPremium&&premium.membership.status==='active'&&!confirm&&<SettingsButton label="Cancel mock membership" variant="secondary" onPress={()=>setConfirm(true)}/>}
      {confirm&&<><SettingsNotice title="Cancel mock membership?">Access continues until its saved expiration date. Your trackers and check-ins remain.</SettingsNotice><SettingsButton label="Keep membership" variant="secondary" onPress={()=>setConfirm(false)}/><SettingsButton label="Cancel mock plan" variant="danger" onPress={async()=>{await premium.cancelSubscription();setConfirm(false);setMessage('Mock membership cancelled. Access continues until its saved expiration date.');}}/></>}
    </>:<>
      <SubscriptionPlanOptions value={plan} onChange={setPlan} disabled={pending||premium.isLoading}/>
      <SubscriptionComparison/>
      <SettingsButton label={`Activate mock ${MOCK_PLANS[plan].title}`} disabled={premium.isLoading||!!premium.error} onPress={async()=>{await premium.activate(plan,false);onNavigate('premium-success');}}/>
      <SettingsText style={{fontSize:11,lineHeight:19.25}}>Premium never changes your recorded data. Native widget installation and real store purchases require additional integration.</SettingsText>
    </>}
    {!success&&<SettingsButton label="Restore mock purchases" variant="secondary" disabled={premium.isLoading} onPress={async()=>setMessage(await premium.restorePurchases())}/>}
    {!!message&&<SettingsNotice success>{message}</SettingsNotice>}
  </>;
}
