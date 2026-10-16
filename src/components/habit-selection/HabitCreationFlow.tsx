import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,AppState,KeyboardAvoidingView,Platform,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import {Text,useTheme} from '../../design-system';
import {useRecoveryStore} from '../../data/store';
import {CatalogHabit} from '../../data/habitCatalog';
import {TrackerSetupDraft,TrackerSetupForm} from '../../data/setupDraft';
import {HabitSelectionScreen} from './HabitSelectionScreen';
import {TrackerSetupWizard} from './TrackerSetupWizard';

interface HabitCreationFlowProps {onCancel:()=>void|Promise<void>;onFinished:()=>void;initialHabit?:Partial<CatalogHabit>;cancelLabel?:string}
export function HabitCreationFlow({onCancel,onFinished,initialHabit,cancelLabel}:HabitCreationFlowProps){
  const {colors}=useTheme(),{setupDraft,saveSetupDraft}=useRecoveryStore();
  const [draft,setDraft]=useState<TrackerSetupDraft>(()=>setupDraft??{version:1,id:`setup-${Crypto.randomUUID()}`,phase:initialHabit?'wizard':'selecting',habit:initialHabit??{}});
  const [error,setError]=useState(''),[saving,setSaving]=useState(false);
  const latest=useRef(draft),finished=useRef(false),leaving=useRef(false),mounted=useRef(true),resumed=useRef(!!setupDraft);
  latest.current=draft;
  const report=useCallback((error:unknown)=>{if(mounted.current)setError(error instanceof Error?error.message:'Could not save your setup. Please retry.');},[]);
  const persist=useCallback(async(snapshot:TrackerSetupDraft)=>{await saveSetupDraft(snapshot);if(mounted.current)setError('');},[saveSetupDraft]);
  useEffect(()=>{
    const timer=setTimeout(()=>{if(!finished.current)void persist(draft).catch(report);},350);
    return()=>clearTimeout(timer);
  },[draft,persist,report]);
  useEffect(()=>{
    mounted.current=true;
    const flush=()=>{if(!finished.current)void persist(latest.current).catch(report);};
    const subscription=AppState.addEventListener('change',state=>{if(state!=='active')flush();});
    return()=>{mounted.current=false;subscription.remove();flush();};
  },[persist,report]);
  const updateForm=useCallback((form:TrackerSetupForm)=>setDraft(previous=>JSON.stringify(previous.form)===JSON.stringify(form)?previous:{...previous,form}),[]);
  const persistForm=useCallback(async(form:TrackerSetupForm)=>{
    const next={...latest.current,form};latest.current=next;setDraft(next);await persist(next);
  },[persist]);
  const selectHabit=async(habit:Partial<CatalogHabit>)=>{
    if(leaving.current)return;leaving.current=true;setSaving(true);setError('');
    const previous=latest.current,same=previous.habit.id===habit.id&&previous.habit.title===habit.title&&previous.habit.category===habit.category;
    const next:TrackerSetupDraft={...previous,phase:'wizard',habit,form:same?previous.form:undefined};
    try{await persist(next);latest.current=next;setDraft(next);}catch(error){report(error);}
    finally{leaving.current=false;if(mounted.current)setSaving(false);}
  };
  const backToSelection=()=>{
    const next:TrackerSetupDraft={...latest.current,phase:'selecting'};latest.current=next;setDraft(next);
    void persist(next).catch(report);
  };
  const close=async()=>{
    if(leaving.current)return;leaving.current=true;setSaving(true);setError('');
    try{await persist(latest.current);await onCancel();}catch(error){report(error);}
    finally{leaving.current=false;if(mounted.current)setSaving(false);}
  };
  const complete=()=>{finished.current=true;onFinished();};
  return <SafeAreaView style={{flex:1,backgroundColor:colors.background.canvas}}>
    {!!error&&<Text accessibilityRole="alert" color="rose" style={{padding:16}}>{error}</Text>}
    {resumed.current&&<Text variant="caption" color="secondary" align="center" style={{paddingHorizontal:20,paddingVertical:8}}>Continuing your saved setup.</Text>}
    {saving&&<ActivityIndicator accessibilityLabel="Saving setup" style={{marginVertical:8}}/>}
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      {draft.phase==='selecting'?<View style={{flex:1}} pointerEvents={saving?'none':'auto'}><HabitSelectionScreen onBack={()=>void close()} onSelectHabit={habit=>void selectHabit(habit)}/></View>:
        <TrackerSetupWizard key={draft.habit.id||draft.id} initialHabit={draft.habit} initialForm={draft.form} draftId={draft.id} onDraftChange={updateForm} onPersist={persistForm} externalBusy={saving} cancelLabel={cancelLabel} onBack={backToSelection} onCancel={()=>void close()} onComplete={complete}/>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
