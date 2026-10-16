import { useTheme, useThemedStyles } from '../../design-system/theme';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ChevronRight, Plus } from 'lucide-react-native';
import { HomeHeader } from '../home/HomeHeader';
import { ReferenceHomeHeader } from '../home/ReferenceHomeHeader';
import { BottomSheet, Text as AppText, Button, colors } from '../../design-system';
import { CalendarPanel } from './CalendarPanel';
import { CalendarButton, CalendarText } from './calendarAppearance';
import { Habit } from '../../data/types';
import { useRecoveryStore } from '../../data/store';

export function TrackerHeader({ habit, reference=false }: { habit: Habit | null; reference?:boolean }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const router = useRouter();
  const { habits, setActiveHabitId } = useRecoveryStore();
  const Header=reference?ReferenceHomeHeader:HomeHeader;
  const Sheet=reference?CalendarPanel:BottomSheet,Text=reference?CalendarText:AppText,Action=reference?CalendarButton:Button;
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const add = () => { setVisible(false); router.push('/habit/new'); };
  const choose = async (id:string) => {
    if (busy) return;
    setBusy(id); setError('');
    try { await setActiveHabitId(id); setVisible(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to switch trackers. Please try again.'); }
    finally { setBusy(''); }
  };
  return <>
    <Header habit={habit} onChooseTracker={() => { setError(''); setVisible(true); }} onNewTracker={add} />
    <Sheet visible={visible} onClose={() => { if (!busy) setVisible(false); }} {...(reference?{header:<Text weight="600" style={{fontSize:14,lineHeight:21,paddingTop:8}}>Choose your focus.</Text>}:{title:"Choose your focus.",subtitle:"Your calendar follows the selected tracker."})} footer={<Action label="Add a new tracker" variant="outline" iconLeft={<Plus size={16} color={colors.accent.primary} />} onPress={add} disabled={!!busy} fullWidth />}>
      {reference&&<Text color="secondary" style={{fontSize:12,lineHeight:18,marginBottom:16}}>Your calendar follows the selected tracker.</Text>}
      {habits.map(item => <TouchableOpacity key={item.id} disabled={!!busy} style={[styles.row,reference&&{minHeight:52,padding:12,borderRadius:16},item.id === habit?.id && styles.active]} accessibilityRole="button" accessibilityLabel={`Select ${item.title}`} onPress={() => { void choose(item.id); }}><View style={[styles.dot, { backgroundColor:item.accentColor }]} /><Text style={{flex:1,...(reference?{fontSize:14,lineHeight:21}:{})}} variant="body">{item.title}</Text>{busy === item.id ? <ActivityIndicator size="small" color={colors.accent.primary} /> : item.id === habit?.id ? <Check size={17} color={colors.accent.primary} /> : <ChevronRight size={17} color={colors.text.tertiary} />}</TouchableOpacity>)}
      {!!error && <Text color="rose" variant="caption" accessibilityRole="alert">{error}</Text>}
    </Sheet>
  </>;
}
const baseStyles = StyleSheet.create({ row:{ flexDirection:'row', alignItems:'center', gap:12, minHeight:58, borderWidth:1, borderColor:colors.border.subtle, borderRadius:15, padding:15, marginBottom:8 }, active:{ backgroundColor:colors.accent.primaryLight, borderColor:colors.accent.primaryBorder }, dot:{ width:8, height:8, borderRadius:4 } });
