import {colors,ColorTokens} from './colors';

export const calendarColors:ColorTokens = {
  ...colors,
  background:{...colors.background,subtle:'#F8F5FA',muted:'#EFE9F2',overlay:'rgba(48,43,64,0.45)'},
  text:{...colors.text,primary:'#302B40',secondary:'#7B6F85',tertiary:'#8A799A',muted:'#A497AE',accent:'#6755A5'},
  accent:{...colors.accent,primary:'#6755A5',primaryHover:'#594891',primaryDark:'#4E3F80',primaryLight:'#EFE9F6',primaryBorder:'#E1D7EE',
    success:'#10B981',successLight:'#E8F8F0',successBorder:'#C3ECD6',successDark:'#065F46',
    warning:'#EAB308',warningLight:'#FEF9C3',orange:'#F97316',orangeLight:'#FFEDD5',rose:'#EF4444',roseLight:'#FEE2E2',roseBorder:'#FCA5A5'},
  border:{subtle:'#E7DFEB',medium:'#DDD2EE',focus:'#6755A5',selected:'#6755A5'},
  status:{...colors.status,success:'#10B981',warning:'#EAB308',orange:'#F97316',danger:'#EF4444',blackout:'#18181B',info:'#6755A5'},
};

export const calendarBandColors = {
  clean:{color:'#10B981',background:'#E8F8F0',border:'#C3ECD6',text:'#065F46'},
  low:{color:'#EAB308',background:'#FEF9C3',border:'#FDE047',text:'#854D0E'},
  moderate:{color:'#F97316',background:'#FFEDD5',border:'#FDBA74',text:'#9A3412'},
  heavy:{color:'#EF4444',background:'#FEE2E2',border:'#FCA5A5',text:'#991B1B'},
  blackout:{color:'#18181B',background:'#27272A',border:'#18181B',text:'#FFFFFF'},
  urges:{color:'#6755A5',background:'#EFE9F6',border:'#E1D7EE',text:'#6755A5'},
  used:{color:'#EF4444',background:'#FEE2E2',border:'#FCA5A5',text:'#991B1B'},
};
