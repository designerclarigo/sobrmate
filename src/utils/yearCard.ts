import { CheckIn, Habit } from '../data/types';
import { isAlcoholTracker } from '../data/tracking';
import { calendarBandColors } from '../design-system/tokens/calendar';
import { ALCOHOL_BANDS, calendarStatistics, getCheckInBand, getMonthDays, latestCheckIns, periodRange, STATUS_BANDS, yearLoggedRate } from './calendar';

export type YearCardFormat = 'story' | 'post';
export interface YearCardOptions { habit:Habit; entries:CheckIn[]; year:number; today:string; format:YearCardFormat; includeTracker:boolean }
const escape = (text:string) => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');

/** The same vector is used for native preview and export. Private reflections never enter it. */
export function renderYearCardSvg({habit,entries,year,today,format,includeTracker}:YearCardOptions):string {
  const story=format==='story',height=story?1920:1350;
  const ink='#302B40',secondary='#8A7C94',accent='#6755A5';
  const alcohol=isAlcoholTracker(habit),range=periodRange('year',year,0,today,today);
  const relevant=latestCheckIns(entries,habit.id,today).filter(entry=>entry.date>=range.start&&entry.date<=range.end);
  const byDate=new Map(relevant.map(entry=>[entry.date,entry]));
  const stats=calendarStatistics(relevant,habit,range.start,range.end,today);
  const text=(x:number,y:number,value:string,size:number,fill=secondary,weight=400,serif=false,anchor='start')=>
    `<text x="${x}" y="${y}" fill="${fill}" font-family="${serif?'Georgia, serif':'Arial, sans-serif'}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escape(value)}</text>`;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}"><rect width="1080" height="${height}" fill="#FAF9F6"/><circle cx="985" cy="45" r="310" fill="#EDE8F5" opacity=".45"/>`;
  svg+=text(72,95,'◉  SobrMate',29,accent,700)+text(1008,95,'ONE DAY AT A TIME',18,secondary,500,false,'end');
  svg+=text(72,157,'YOUR YEAR, IN LITTLE MOMENTS',20,secondary,600)+text(72,225,'A year of showing up.',61,ink,400,true);
  const name=habit.title.length>38?habit.title.slice(0,37)+'…':habit.title;
  svg+=text(72,268,includeTracker?`${name} · ${year}`:`My journey · ${year}`,27,accent,500);
  const statsY=story?326:305;
  svg+=`<rect x="72" y="${statsY}" width="936" height="126" rx="28" fill="#EFE9F6"/>`;
  [{value:stats.zeroDays,label:'Zero-use days'},{value:stats.logged,label:'Days checked in'},{value:stats.bestStreak,label:'Best streak · days'}].forEach((item,index)=>{
    svg+=text(104+index*306,statsY+60,String(item.value),48,accent,600,true)+text(104+index*306,statsY+95,item.label,21);
  });
  const top=story?525:475,columns=story?3:4,columnStep=story?320:240;
  // Allow a full six-week grid and readable clearance above the following month.
  const rowHeight=story?240:225,cell=story?24:22,gap=story?6:5;
  const weekdays=['S','M','T','W','T','F','S'];
  for(let month=0;month<12;month++){
    const x=72+month%columns*columnStep,y=top+Math.floor(month/columns)*rowHeight;
    svg+=text(x,y,new Date(year,month,1,12).toLocaleDateString('en',{month:'long'}).toUpperCase(),20,ink,600);
    weekdays.forEach((label,i)=>{svg+=text(x+i*(cell+gap)+cell/2,y+28,label,14,secondary,400,false,'middle');});
    getMonthDays(year,month).forEach((day,index)=>{
      if(!day.inMonth)return;
      const entry=byDate.get(day.date),band=entry?getCheckInBand(entry,alcohol):null;
      const color=band?calendarBandColors[band.id as keyof typeof calendarBandColors].color:null;
      const cx=x+index%7*(cell+gap),cy=y+40+Math.floor(index/7)*(cell+gap);
      svg+=`<rect x="${cx}" y="${cy}" width="${cell}" height="${cell}" rx="${story?5:3}" fill="${color||(day.date>today?'#F3F0F5':'#FFFFFF')}" stroke="${color||'#E4DDEB'}" stroke-width="1"/>`;
      if(band?.id==='used')svg+=`<path d="M${cx+3} ${cy+cell-3}L${cx+cell-3} ${cy+3}" stroke="#FFFFFF" stroke-width="2"/>`;
    });
  }
  const bands=alcohol?[...ALCOHOL_BANDS,...(relevant.some(entry=>getCheckInBand(entry,true).id==='used')?[STATUS_BANDS[2]]:[])]:STATUS_BANDS;
  const legend=[...bands.map(band=>({label:alcohol&&band.id==='used'?'Used · unknown':band.short,color:calendarBandColors[band.id as keyof typeof calendarBandColors].color})),{label:'Unlogged / future',color:'#FFFFFF'}];
  const legendY=top+Math.ceil(12/columns)*rowHeight+10;
  legend.forEach((item,index)=>{
    const x=72+index%3*320,y=legendY+Math.floor(index/3)*36;
    svg+=`<rect x="${x}" y="${y-15}" width="16" height="16" rx="4" fill="${item.color}" stroke="${item.color==='#FFFFFF'?'#E4DDEB':item.color}"/>`+text(x+26,y,item.label,18);
  });
  if(story){
    const quoteY=height-285;
    svg+=`<rect x="72" y="${quoteY}" width="936" height="154" rx="28" fill="#FFFFFF" stroke="#E7DFEB"/>`;
    svg+=text(106,quoteY+48,'Small choices. A fuller life.',32,ink,400,true);
    svg+=text(106,quoteY+88,stats.logged?`${yearLoggedRate(stats.logged,year,today)}% of calendar days checked in`:'Every journey begins with one check-in.',23);
    svg+=text(106,quoteY+122,'Only recorded days are counted. Unlogged days stay open.',21);
  } else svg+=text(72,height-(legend.length>6?92:122),'Only recorded days are counted. Unlogged days stay open.',21);
  svg+=`<path d="M72 ${height-79}H1008" stroke="#E7DFEB"/>`;
  svg+=text(72,height-38,'Made with SobrMate',21,accent,600)+text(1008,height-38,'A little better, every day.',21,secondary,400,false,'end');
  return svg+'</svg>';
}
