export type PremiumFeatureKey='unlimited_trackers'|'home_widgets'|'year_heatmap'|'deep_archive'|'biometric_app_lock'|'premium_share_styles'|'advanced_statistics';
export type SubscriptionPlan='monthly'|'yearly';
export interface MockMembership { mode:'mock';status:'free'|'active'|'cancelled';plan:SubscriptionPlan|null;activatedAt:string|null;expiresAt:string|null }
export const FREE_MEMBERSHIP:MockMembership={mode:'mock',status:'free',plan:null,activatedAt:null,expiresAt:null};
export const MOCK_PLANS={monthly:{title:'Monthly',price:'$4.99',amountCents:499,currency:'USD',period:'/ month',trialDays:0},yearly:{title:'Yearly',price:'$29.99',amountCents:2999,currency:'USD',period:'/ year',trialDays:0}} as const;
export function annualPlanSavings(monthlyCents:number,yearlyCents:number){
  if(!Number.isSafeInteger(monthlyCents)||!Number.isSafeInteger(yearlyCents)||monthlyCents<=0||yearlyCents<0||monthlyCents>Number.MAX_SAFE_INTEGER/12)throw new Error('Invalid plan pricing.');
  const twelveMonths=monthlyCents*12,savedCents=Math.max(0,twelveMonths-yearlyCents);
  return {twelveMonths,savedCents,percent:Math.round(savedCents/twelveMonths*1000)/10,monthlyEquivalentCents:yearlyCents/12};
}
export const PREMIUM_SAVINGS=annualPlanSavings(MOCK_PLANS.monthly.amountCents,MOCK_PLANS.yearly.amountCents);
export const formatPlanMoney=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
export const PREMIUM_FEATURES: {key:PremiumFeatureKey;title:string;description:string}[]=[
  {key:'unlimited_trackers',title:'Unlimited intentions',description:'Make room for every habit you want to change.'},
  {key:'year_heatmap',title:'Your year at a glance',description:'Twelve months of your daily rhythm, together.'},
  {key:'deep_archive',title:'Your complete history',description:'Explore All Time calendar statistics.'},
  {key:'advanced_statistics',title:'More meaningful insights',description:'Review patterns, check-in consistency, and yearly progress.'},
  {key:'premium_share_styles',title:'Beautiful sharing templates',description:'Choose editorial, certificate, and horizon designs.'},
  {key:'home_widgets',title:'Widget design preview',description:'Configure a home-screen preview. Native widget installation requires a development build.'},
];
export function hasPremiumAccess(membership:MockMembership,now=new Date()):boolean {
  return membership.status !== 'free' && membership.plan !== null && !!membership.expiresAt && Date.parse(membership.expiresAt)>now.getTime();
}
export function canAccessFeature(membership:MockMembership,feature:PremiumFeatureKey,now=new Date()):boolean {
  return feature === 'biometric_app_lock' || hasPremiumAccess(membership,now);
}
export function activateMockPlan(plan:SubscriptionPlan,now=new Date()):MockMembership {
  const expires=new Date(now);const targetMonth=now.getUTCMonth()+(plan==='monthly'?1:12);const day=now.getUTCDate();
  expires.setUTCDate(1);expires.setUTCMonth(targetMonth);expires.setUTCDate(Math.min(day,new Date(Date.UTC(expires.getUTCFullYear(),expires.getUTCMonth()+1,0)).getUTCDate()));
  return {mode:'mock',status:'active',plan,activatedAt:now.toISOString(),expiresAt:expires.toISOString()};
}
export function decodeMockMembership(raw:string|null):MockMembership {
  if (!raw) return {...FREE_MEMBERSHIP};
  let value:MockMembership;try{value=JSON.parse(raw);}catch{throw new Error('Mock subscription data could not be read. Your trackers are unchanged.');}
  if(value?.mode!=='mock'||!['free','active','cancelled'].includes(value.status))throw new Error('Mock subscription data is invalid.');
  if(value.status==='free')return {...FREE_MEMBERSHIP};
  if(!['monthly','yearly'].includes(value.plan||'')||!value.activatedAt||!value.expiresAt||!Number.isFinite(Date.parse(value.activatedAt))||!Number.isFinite(Date.parse(value.expiresAt))||Date.parse(value.expiresAt)<=Date.parse(value.activatedAt))throw new Error('Mock subscription dates or plan are invalid.');
  return value;
}
