import { NativeTextInput as TextInput } from '../../design-system/components/NativeInput';
import { useTheme, useThemedStyles } from '../../design-system/theme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Calendar, Check, GlassWater, Minus, Moon, Pencil, Plus, SlidersHorizontal, X } from 'lucide-react-native';
import { BottomSheet, Button, Text as AppText, colors } from '../../design-system';
import { fontFamilies } from '../../design-system/tokens/typography';
import { AlcoholConsumption, Habit, CheckIn, CheckInStatus } from '../../data/types';
import { isAlcoholTracker,getTrackingUnit } from '../../data/tracking';
import { ALCOHOL_BANDS, getCheckInBand, STATUS_BANDS } from '../../utils/calendar';
import { formatLocalDate, getLocalDateString } from '../../utils/date';
import { triggerHaptic } from '../../utils/haptics';

import { CalendarPanel } from '../calendar/CalendarPanel';
import { CalendarButton, CalendarText, useCalendarBands, CalendarBandId } from '../calendar/calendarAppearance';

interface CheckInModalSheetProps {
  calendarAppearance?:boolean;
  visible: boolean;
  onClose: () => void;
  habit: Habit | null;
  dateStr: string;
  existingCheckIn?: CheckIn | null;
  onSave: (habitId: string, status: CheckInStatus, notes: string, consumption?: AlcoholConsumption, quantity?:number) => Promise<void> | void;
}

export function CheckInModalSheet({ visible, onClose, habit, dateStr, existingCheckIn, onSave, calendarAppearance=false }: CheckInModalSheetProps) {
  const { colors,isDark } = useTheme();
  const {fontScale,width}=useWindowDimensions();const stackActions=calendarAppearance&&(fontScale>1.2||width<330);
  const standardStyles=useThemedStyles(baseStyles);
  const referenceStyles=useThemedStyles(calendarOverrides);
  const tones=useCalendarBands();
  const styles=useMemo(()=>calendarAppearance?Object.fromEntries(Object.entries(standardStyles).map(([key,value])=>[key,{...value,...(referenceStyles as Record<string,object>)[key]}])) as typeof standardStyles:standardStyles,[calendarAppearance,standardStyles,referenceStyles]);
  const Text=calendarAppearance?CalendarText:AppText;
  const Action=calendarAppearance?CalendarButton:Button;
  const Sheet=calendarAppearance?CalendarPanel:BottomSheet;

  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [count, setCount] = useState('0');
  const [quantityCount,setQuantityCount]=useState('');
  const [blackout, setBlackout] = useState(false);
  const [notes, setNotes] = useState('');
  const [rules, setRules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const alcohol = !!habit && isAlcoholTracker(habit);
  const unit=habit?getTrackingUnit(habit):null;
  const quantity=quantityCount.trim()===''?undefined:Number(quantityCount);
  const quantityValid=quantity===undefined||(/^\d+$/.test(quantityCount.trim())&&Number.isInteger(quantity)&&quantity>=0&&quantity<=(unit==='minutes'?1440:100000));
  const drinks = count.trim() === '' ? undefined : Number(count);
  const countValid = drinks !== undefined && /^\d+$/.test(count.trim()) && Number.isInteger(drinks) && drinks >= 0 && drinks <= 1000;
  const consumptionValid = countValid || (blackout && count.trim() === '');
  const selectedStatus: CheckInStatus | null = alcohol ? blackout || (drinks ?? 0) > 0 ? 'relapsed' : status === 'struggled' ? 'struggled' : 'clean' : status;
  const preview: CheckIn = { id:'preview', habitId:habit?.id || '', date:dateStr, timestamp:0, status:selectedStatus || 'clean', consumption:alcohol && (countValid || blackout) ? { drinks:countValid ? drinks : undefined, blackout } : undefined };
  const band = getCheckInBand(preview, alcohol);
  const referenceBand=tones[band.id as CalendarBandId];
  const bandBackground=calendarAppearance?referenceBand.background:isDark?(band.id==='clean'?colors.accent.successLight:band.id==='low'?colors.accent.warningLight:band.id==='moderate'?colors.accent.orangeLight:band.id==='heavy'||band.id==='used'?colors.accent.roseLight:colors.background.subtle):band.background;
  useEffect(() => {
    if (!visible) return;
    setStatus(existingCheckIn?.status || null);
    setCount(existingCheckIn?.consumption?.drinks !== undefined ? String(existingCheckIn.consumption.drinks) : existingCheckIn?.status === 'relapsed' ? '' : '0');
    setQuantityCount(existingCheckIn?.quantity!==undefined?String(existingCheckIn.quantity):'');
    setBlackout(existingCheckIn?.consumption?.blackout || false);
    setNotes(existingCheckIn?.reflection || '');
    setRules(false); setError('');
  }, [visible, habit?.id, dateStr, existingCheckIn]);
  const close = () => { if (!inFlight.current) onClose(); };
  const toggleBlackout = () => { if (!blackout && count === '0') setCount(''); setBlackout(value => !value); };
  const toggleUrges = () => setStatus(value => value === 'struggled' ? 'clean' : 'struggled');
  const adjust = (delta:number) => { triggerHaptic('selection'); setCount(String(Math.max(0, Math.min(1000, (countValid ? drinks! : 0) + delta)))); };
  const save = async () => {
    if (!habit || !selectedStatus || inFlight.current || (alcohol && !consumptionValid)||!quantityValid) return;
    inFlight.current = true; setSaving(true); setError('');
    try {
      await onSave(habit.id, selectedStatus, notes.trim(), alcohol ? { drinks:countValid ? drinks : undefined, blackout } : undefined, !alcohol&&unit?quantity:undefined);
      inFlight.current = false; setSaving(false); onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Please try again.');
      inFlight.current = false; setSaving(false);
    }
  };
  return <Sheet visible={visible} onClose={close} presentation="bottom" style={calendarAppearance?[styles.sheet,{paddingHorizontal:0}]:styles.sheet} footer={rules ? <Action label="Back to check-in" variant="outline" onPress={() => setRules(false)} fullWidth /> : <View style={[styles.actions,stackActions&&{flexDirection:'column'}]}><View style={{ flex:stackActions?0:1 }}><Action label="Cancel" variant="outline" onPress={close} disabled={saving} fullWidth /></View><View style={{ flex:stackActions?0:1.75 }}><Action label="Save Check-In" iconLeft={<Check size={16} color={colors.text.inverse} />} onPress={save} disabled={!selectedStatus || (alcohol && !consumptionValid)||!quantityValid} loading={saving} fullWidth /></View></View>}>
    <View style={styles.header}>
      <View style={{ flex:1, gap:5 }}><View style={styles.date}><Calendar size={13} color={colors.accent.primary} /><Text weight={calendarAppearance?'700':'500'} style={styles.dateText}>{rules ? 'Tracking Rules' : formatLocalDate(dateStr, { weekday:calendarAppearance?'long':'short', month:'short', day:'numeric', year:'numeric' })}</Text>{!rules && dateStr === getLocalDateString(new Date()) && <Text color="accent" style={styles.today}>Today</Text>}</View><View style={styles.date}><GlassWater size={12} color={colors.text.tertiary} /><Text color="secondary" style={styles.small}>{habit?.title}</Text></View></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show check-in tracking rules" disabled={saving} onPress={() => setRules(value => !value)} style={styles.icon}><SlidersHorizontal size={16} strokeWidth={1.5} color={colors.accent.primary} /></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close check-in" disabled={saving} onPress={close} style={styles.icon}><X size={17} strokeWidth={1.5} color={colors.text.tertiary} /></TouchableOpacity>
    </View>
    {rules ? <View style={{ gap:9 }}><Text color="accent" style={styles.label}>{alcohol ? 'ALCOHOL · STANDARD DRINK COUNTS' : 'DAILY STATUS'}</Text>{(alcohol ? ALCOHOL_BANDS : STATUS_BANDS).map(item => <View key={item.id} style={styles.ruleRow}><View style={[styles.dot, { backgroundColor:calendarAppearance?tones[item.id as CalendarBandId].color:item.color }]} /><Text style={[styles.small, { flex:1 }]}>{item.label}</Text><Text color="secondary" style={styles.small}>{item.short}</Text></View>)}<Text style={[styles.small, { lineHeight:20, marginTop:5 }]} color="secondary">{alcohol ? 'Blackout overrides the count. You can record it even when the count is unknown. ' : ''}Only logged days count toward statistics. Historical entries preserve your live timer.</Text></View> : <>
      {alcohol ? <>
        <View style={[styles.summary, { backgroundColor:bandBackground, borderColor:calendarAppearance?referenceBand.border:band.color + '60' }]}><View style={[styles.dot, { backgroundColor:calendarAppearance?referenceBand.color:band.color }]} /><View style={{ flex:1, gap:3 }}><Text weight="500" style={[styles.small, { color:calendarAppearance?referenceBand.text:colors.text.primary }]}>{!countValid && !blackout ? 'Count not recorded' : band.label}</Text><Text color="secondary" style={styles.tiny}>{blackout ? 'Memory gap overrides count' : !countValid ? 'Add a count or select memory gap' : band.short}</Text></View><View style={{ alignItems:'flex-end', gap:3 }}><Text color="accent" style={styles.tiny}>ALCOHOL</Text><Text weight="500" style={styles.small}>{countValid ? `${drinks} drinks` : 'Unknown'}</Text></View></View>
        <Text weight="500" style={styles.label}>Standard drinks consumed</Text>
        <View style={styles.countRow}>
          <TouchableOpacity onPress={() => adjust(-1)} disabled={saving || drinks === 0 || (calendarAppearance&&!countValid)} style={styles.stepper} accessibilityRole="button" accessibilityLabel="Decrease drinks"><Minus size={18} color={colors.accent.primary} /></TouchableOpacity>
          <View style={styles.countInput}><TextInput accessibilityLabel="Standard drinks consumed" value={count} onChangeText={setCount} editable={!saving} keyboardType="number-pad" maxLength={4} placeholder="Count" placeholderTextColor={colors.text.tertiary} style={styles.number} /><Text color="accent" style={styles.small}>drinks</Text></View>
          <TouchableOpacity onPress={() => adjust(1)} disabled={saving || drinks === 1000} style={styles.stepper} accessibilityRole="button" accessibilityLabel="Increase drinks"><Plus size={18} color={colors.accent.primary} /></TouchableOpacity>
        </View>
        <View style={styles.quick}>{[0,1,2,3,4,6,8].map(value => <TouchableOpacity key={value} disabled={saving} onPress={() => { triggerHaptic('selection'); setCount(String(value)); if(calendarAppearance)setBlackout(false); }} accessibilityRole="button" accessibilityLabel={`Set ${value} drinks`} aria-pressed={drinks === value&&(!calendarAppearance||!blackout)} style={[styles.quickButton, drinks === value&&(!calendarAppearance||!blackout) && styles.quickSelected]}><Text weight={drinks === value&&(!calendarAppearance||!blackout) ? '600' : '400'} color={drinks === value&&(!calendarAppearance||!blackout) ? 'inverse' : 'secondary'} style={styles.small}>{value === 0 ? '0 (Clean)' : value}</Text></TouchableOpacity>)}</View>
        {!countValid && count.trim() !== '' && <Text color="rose" accessibilityRole="alert" style={[styles.small, { marginBottom:10 }]}>Enter a whole drink count from 0 to 1,000.</Text>}
        <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel="Blackout or memory gap" aria-checked={blackout} accessibilityState={{ checked:blackout, disabled:saving }} disabled={saving} onPress={toggleBlackout} style={styles.blackout}><View style={styles.moon}><Moon size={17} color={colors.text.inverse} /></View><View style={{ flex:1, gap:4 }}><Text weight="500" style={styles.small}>Blackout / Memory Gap</Text><Text color="secondary" style={styles.tiny}>You can log this without knowing the drink count.</Text></View><View style={[styles.checkbox, blackout && styles.checked]}>{blackout && <Check size={12} color={colors.text.inverse} />}</View></TouchableOpacity>
        {!blackout && drinks === 0 && <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel="Felt urges without drinking" aria-checked={status === 'struggled'} disabled={saving} onPress={toggleUrges} style={styles.urge}><View style={[styles.checkbox, status === 'struggled' && styles.checked]}>{status === 'struggled' && <Check size={12} color={colors.text.inverse} />}</View><Text color="secondary" style={styles.small}>Felt urges, no use</Text></TouchableOpacity>}
      </> : <View style={{ gap:8 }}><Text style={styles.label} weight="500">How was this day?</Text>{(['clean','struggled','relapsed'] as const).map((value, index) => <TouchableOpacity key={value} disabled={saving} accessibilityRole="radio" accessibilityLabel={STATUS_BANDS[index].label} aria-checked={status === value} onPress={()=>{setStatus(value);if(unit)setQuantityCount(value==='relapsed'?'':'0');}} style={[styles.statusRow, status === value && styles.statusSelected]}><View style={[styles.dot, { backgroundColor:STATUS_BANDS[index].color }]} /><Text style={{ flex:1, fontSize:13 }}>{STATUS_BANDS[index].label}</Text>{status === value && <Check size={16} color={colors.accent.primary} />}</TouchableOpacity>)}</View>}
      {!alcohol&&unit&&<View style={{gap:8,marginTop:20}}><Text weight="500">{unit==='minutes'?'Time spent today':'Quantity today'} ({unit})</Text><TextInput accessibilityLabel={`Quantity in ${unit}`} value={quantityCount} onChangeText={value=>{setQuantityCount(value);if(/^\d+$/.test(value))setStatus(Number(value)>0?'relapsed':status==='struggled'?'struggled':'clean');}} editable={!saving} keyboardType="number-pad" placeholder="Unknown / not recorded" maxLength={6} style={[styles.notes,{minHeight:54}]} /><Text variant="caption" color="secondary">Leave blank if unknown. A recorded zero means no use.</Text>{!quantityValid&&<Text color="rose" accessibilityRole="alert">Enter a whole number from 0 to {unit==='minutes'?'1,440':'100,000'}.</Text>}</View>}
      <View style={styles.notesLabel}><Pencil size={12} color={colors.accent.primary} /><Text style={styles.label} weight="500">{calendarAppearance?'Notes & Triggers (Optional)':'Notes &amp; Triggers (Optional)'}</Text></View>
      <TextInput accessibilityLabel="Notes and triggers" value={notes} onChangeText={setNotes} editable={!saving} placeholder="How were cravings today? Any reflections or triggers…" placeholderTextColor={colors.text.tertiary} style={styles.notes} multiline maxLength={10000} />
      {selectedStatus === 'relapsed' && <Text color="secondary" style={[styles.tiny, { marginTop:9 }]}>{dateStr === getLocalDateString(new Date()) ? 'A use entry restarts today’s live timer once. Your history stays saved.' : 'Historical entries keep your current live timer unchanged.'}</Text>}
      {!!error && <Text accessibilityRole="alert" color="rose" variant="caption" style={{ marginTop:9 }}>{error}</Text>}
    </>}
  </Sheet>;
}
const baseStyles = StyleSheet.create({
  sheet:{ paddingHorizontal:20, backgroundColor:colors.background.canvas },
  header:{ flexDirection:'row', alignItems:'center', gap:1, paddingBottom:16, borderBottomWidth:1, borderBottomColor:colors.border.subtle, marginBottom:16 },
  date:{ flexDirection:'row', alignItems:'center', gap:5, flexWrap:'wrap' }, dateText:{ fontSize: 13, lineHeight:19 }, today:{ fontSize: 13, lineHeight: 18, backgroundColor:colors.accent.primaryLight, borderRadius:8, paddingHorizontal:6 },
  icon:{ width:34, minHeight:40, alignItems:'center', justifyContent:'center' }, small:{ fontSize: 13, lineHeight: 18 }, tiny:{ fontSize: 13, lineHeight: 18 }, label:{ fontSize: 13, lineHeight:18 },
  summary:{ flexDirection:'row', alignItems:'center', gap:10, borderWidth:1, borderRadius:16, padding:13, marginBottom:13 }, dot:{ width:11, height:11, borderRadius:6 },
  countRow:{ flexDirection:'row', alignItems:'center', gap:8, marginTop:8 }, stepper:{ width:43, minHeight:52, justifyContent:'center', alignItems:'center', backgroundColor:colors.background.surface, borderWidth:1, borderColor:colors.border.subtle, borderRadius:15 },
  countInput:{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:colors.background.surface, borderWidth:1, borderColor:colors.border.subtle, borderRadius:15, minHeight:52, paddingHorizontal:12 }, number:{ flex:1, fontSize:17, fontWeight:'500', fontFamily:fontFamilies.sans, textAlign:'center', color:colors.text.primary, paddingVertical:7, minWidth:0 },
  quick:{ flexDirection:'row', gap:5, flexWrap:'wrap', marginTop:12, marginBottom:17 }, quickButton:{ paddingHorizontal:9, minHeight:34, alignItems:'center', justifyContent:'center', borderRadius:12, borderWidth:1, borderColor:colors.border.subtle, backgroundColor:colors.background.surface }, quickSelected:{ backgroundColor:colors.accent.primary, borderColor:colors.accent.primaryDark },
  blackout:{ flexDirection:'row', alignItems:'center', gap:10, backgroundColor:colors.background.surface, borderWidth:1, borderColor:colors.border.subtle, borderRadius:16, padding:12 }, moon:{ width:32, height:32, borderRadius:10, alignItems:'center', justifyContent:'center', backgroundColor:'#27262E' },
  checkbox:{ width:17, height:17, borderWidth:1, borderColor:'#9D93AD', borderRadius:3, alignItems:'center', justifyContent:'center' }, checked:{ backgroundColor:colors.accent.primary, borderColor:colors.accent.primary }, urge:{ flexDirection:'row', alignItems:'center', gap:8, paddingTop:11 },
  notesLabel:{ flexDirection:'row', alignItems:'center', gap:5, marginTop:17, marginBottom:6 }, notes:{ minHeight:100, padding:12, backgroundColor:colors.background.surface, borderWidth:1, borderColor:colors.border.subtle, borderRadius:16, fontFamily:fontFamilies.sans, fontSize: 13, lineHeight:19, textAlignVertical:'top', color:colors.text.primary },
  actions:{ flexDirection:'row', gap:10 }, statusRow:{ flexDirection:'row', alignItems:'center', gap:10, borderWidth:1, borderColor:colors.border.subtle, backgroundColor:colors.background.surface, borderRadius:15, padding:13, minHeight:48 }, statusSelected:{ backgroundColor:colors.accent.primaryLight, borderColor:colors.accent.primary },
  ruleRow:{ flexDirection:'row', alignItems:'center', gap:8, borderWidth:1, borderColor:colors.border.subtle, backgroundColor:colors.background.surface, borderRadius:12, padding:10 },
});

const calendarOverrides=StyleSheet.create({
 sheet:{paddingHorizontal:0},
 header:{marginTop:-16,marginHorizontal:-20,paddingHorizontal:20,paddingBottom:12,marginBottom:16},
 dateText:{fontSize:14,lineHeight:21,flexShrink:1},today:{fontSize:12,lineHeight:18,borderRadius:20,paddingHorizontal:8},
 icon:{width:32,minHeight:44},small:{fontSize:12,lineHeight:18},tiny:{fontSize:12,lineHeight:18},label:{fontSize:12,lineHeight:18},
 summary:{padding:14,borderRadius:16,marginBottom:12},countRow:{gap:8,marginTop:12},
 stepper:{width:48,minHeight:48,borderRadius:16},countInput:{minHeight:48,borderRadius:16},
 number:{fontFamily:Platform.OS==='ios'?'Menlo':'monospace',fontSize:20,fontWeight:'700',lineHeight:26},
 quick:{gap:6,marginTop:12,marginBottom:16},quickButton:{minHeight:34,paddingHorizontal:10,borderRadius:12},
 blackout:{padding:14,gap:10},moon:{borderRadius:12,backgroundColor:'#27272A'},
 notes:{minHeight:64,fontSize:12,lineHeight:18,padding:12},notesLabel:{marginTop:16},
 actions:{gap:10},
});
