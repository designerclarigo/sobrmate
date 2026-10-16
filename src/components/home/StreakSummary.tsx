import React from 'react';
import { View,StyleSheet } from 'react-native';
import { Trophy,Leaf } from 'lucide-react-native';
import { Habit } from '../../data/types';
import { CheckIn } from '../../data/types';
import { getLoggedStreaks } from '../../utils/homeProgress';
import { useResponsiveRow } from '../../utils/useResponsiveRow';
import { HomePalette, HomeText as Text, useHomeAppearance, useHomeStyles } from './homeAppearance';
export function StreakSummary({habit,entries,today}:{habit:Habit;entries:CheckIn[];today:string}) {
  const palette=useHomeAppearance();const styles=useHomeStyles(makeStyles);
  const streaks=getLoggedStreaks(entries,habit.id,today);
  const { stacked, onLayout } = useResponsiveRow(2, 128, 12);
  return <View style={styles.card}><View onLayout={onLayout} style={[styles.row, stacked && styles.stacked]}>
    {[{label:'Recorded streak',value:streaks.current,Icon:Leaf},{label:'Best logged streak',value:streaks.best,Icon:Trophy}].map(({label,value,Icon}, index) => <React.Fragment key={label}>
      {index > 0 && <View accessible={false} style={[styles.divider, stacked && styles.horizontalDivider]} />}
      <View style={[styles.item, stacked && styles.fullWidth]}>
        <View style={styles.label}><Icon size={12} strokeWidth={1.6} color={palette.muted}/><Text variant="caption" color="secondary" style={styles.labelText}>{label}</Text></View>
        <Text weight="500" tabular style={styles.value}>{value} {value === 1 ? 'day' : 'days'}</Text>
      </View>
    </React.Fragment>)}
  </View></View>;
}
const makeStyles=(p:HomePalette)=>StyleSheet.create({
  card:{paddingVertical:15,paddingHorizontal:17,borderWidth:1,borderColor:p.streakBorder,backgroundColor:p.streak,borderRadius:17},
  row:{flexDirection:'row',alignItems:'stretch',gap:12}, stacked:{flexDirection:'column'},
  item:{flex:1,minWidth:0,gap:5,justifyContent:'space-between'}, fullWidth:{flex:0,width:'100%'},
  label:{flexDirection:'row',alignItems:'center',gap:5}, labelText:{flex:1,minWidth:0,fontSize:12,lineHeight:17},
  value:{fontSize:12,lineHeight:18,color:p.streakValue},
  divider:{width:1,backgroundColor:p.streakDivider}, horizontalDivider:{width:'100%',height:1},
});
