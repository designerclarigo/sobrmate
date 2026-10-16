import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check, Crown, Sparkles } from 'lucide-react-native';
import { BottomSheet, Button, Text } from '../../design-system';
import { useTheme } from '../../design-system/theme';
import { usePremium } from '../../data/premium';
import { SubscriptionPlanOptions,SubscriptionComparison,SubscriptionDisclosure } from './SubscriptionPlans';
import { MOCK_PLANS, PREMIUM_FEATURES, SubscriptionPlan } from '../../data/entitlements';

export function PremiumExperience() {
  const premium=usePremium();const {colors}=useTheme();
  const [plan,setPlan]=useState<SubscriptionPlan>('yearly');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [cancel,setCancel]=useState(false);
  const run=async(action:()=>Promise<void|string>)=>{if(busy)return;setBusy(true);setMessage('');try{const result=await action();if(result)setMessage(result);}catch(e){setMessage(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}};
  const close=()=>{if(!busy){premium.closePaywall();setMessage('');setCancel(false);}};
  const feature=PREMIUM_FEATURES.find(item=>item.key===premium.activePaywallFeature);
  const manage=premium.screen==='manage';const success=premium.screen==='success';
  const notice=<SubscriptionDisclosure plan={manage?(premium.membership.plan??plan):plan}/>;
  return <>
    <BottomSheet visible={!!premium.screen} onClose={close} title={success?'A little more room to grow.':manage?'Your membership.':'SobrMate Premium.'} subtitle={success?'Mock access is active on this device.':'More perspective for your personal journey.'}
      footer={<View style={{gap:12}}>
        {!manage&&!success&&<Button label={`Activate mock ${MOCK_PLANS[plan].title} · ${MOCK_PLANS[plan].price}`} loading={busy} disabled={premium.isLoading} onPress={()=>void run(()=>premium.activate(plan))} />}
        {success&&<Button label="Continue my journey" onPress={close} />}
        {manage&&<Button label={premium.isPremium?'Return to my journey':'Explore Premium'} onPress={premium.isPremium?close:()=>{setMessage('');premium.openPaywall();}} />}
        {!success&&<Button label="Restore mock purchases" variant="ghost" loading={busy} onPress={()=>void run(()=>premium.restorePurchases())} />}
      </View>}>
      <View style={{gap:24,paddingBottom:8}}>
        <View style={[styles.emblem,{backgroundColor:colors.accent.amberLight}]}>{success?<Check size={30} color={colors.status.success}/>:<Crown size={30} color={colors.accent.amber}/>}</View>
        {notice}
        {!!feature&&!manage&&!success&&<View style={[styles.preview,{borderColor:colors.border.subtle}]}><Sparkles size={22} color={colors.accent.primary}/><Text variant="title3">{feature.title}</Text><Text color="secondary">{feature.description}</Text></View>}
        {!!(message||premium.error)&&<Text accessibilityRole="alert" color="accent">{message||premium.error}</Text>}
        {premium.error&&<Button label="Retry reading membership" variant="outline" onPress={()=>void run(()=>premium.retryLoad())}/>}
        {manage ? <View style={{gap:16}}>
          <Text variant="title2">{premium.isPremium?`${MOCK_PLANS[premium.membership.plan!].title} mock membership`:'Free membership'}</Text>
          <Text color="secondary">{premium.isPremium?`${premium.membership.status==='cancelled'?'Ends':'Preview expires'} ${new Date(premium.membership.expiresAt!).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}. Mock memberships do not renew automatically.`:'Daily tracking, check-ins, Week and Month calendars, milestones, and app security are available.'}</Text>
          {premium.isPremium&&premium.membership.status==='active'&&!cancel&&<Button label="Cancel mock membership" variant="outline" onPress={()=>setCancel(true)}/>}
          {cancel&&<View style={{gap:12,padding:16,borderRadius:16,backgroundColor:colors.background.subtle}}><Text weight="500">Cancel mock membership?</Text><Text color="secondary">Access continues until its saved expiration date. Your trackers and check-ins remain.</Text><Button label="Keep membership" variant="outline" onPress={()=>setCancel(false)}/><Button label="Cancel mock plan" loading={busy} onPress={()=>void run(async()=>{await premium.cancelSubscription();setCancel(false);})}/></View>}
          {premium.isPremium&&!cancel&&<Button label="Change mock plan" variant="outline" onPress={()=>{setMessage('');premium.openPaywall();}}/>}
        </View> : success ? <Text serif variant="title2" align="center">More perspective. The same gentle pace.</Text> : <>
          <SubscriptionPlanOptions value={plan} onChange={setPlan} disabled={busy||premium.isLoading}/>
          <SubscriptionComparison/>
        </>}
      </View>
    </BottomSheet>
  </>;
}
const styles=StyleSheet.create({emblem:{width:64,height:64,borderRadius:22,justifyContent:'center',alignItems:'center'},notice:{padding:16,borderWidth:1,borderRadius:16,gap:8},plan:{padding:20,minHeight:96,borderRadius:20,borderWidth:1,flexDirection:'row',alignItems:'center',gap:12},preview:{padding:20,borderWidth:1,borderRadius:20,gap:12},comparison:{borderWidth:1,borderRadius:20,padding:16,gap:16},compareRow:{flexDirection:'row',gap:20,alignItems:'center'}});
