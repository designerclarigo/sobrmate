import React, { useId } from 'react';
import { Platform } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { fontFamilies } from '../design-system/tokens/typography';

const ink = '#66517F';
const lavender = '#887097';
const pale = '#E7DEED';
const gold = '#B6936E';
const decorativeAccessibility = Platform.select({
  web: { 'aria-hidden': true as const },
  default: { accessible: false, accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const },
});

export function BrandMark({ size = 88 }: { size?: number }) {
  const id = `brand${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return <Svg width={size} height={size} viewBox="0 0 88 88" {...decorativeAccessibility}>
    <Defs><LinearGradient id={id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#F6F1FF" /><Stop offset="1" stopColor="#DAD0ED" /></LinearGradient></Defs>
    <Rect x="0.5" y="0.5" width="87" height="87" rx="26" fill={`url(#${id})`} stroke="#FFFFFF" />
    <Circle cx="44" cy="35" r="16" fill="#EACDAB" />
    <Path d="M44 66V43" stroke="#776091" strokeWidth="2.3" strokeLinecap="round" />
    <Path d="M44 48C28 50 22 42 24 30C37 29 47 35 44 48Z" fill="#80699D" />
    <Path d="M43 43C42 29 51 22 64 24C65 36 56 44 43 43Z" fill="#75608E" />
    <Path d="M23 68H65" stroke="#A99CBD" strokeWidth="2" strokeLinecap="round" />
  </Svg>;
}

function Sparkle({ x, y, color = '#C7B7D6', size = 10 }: { x: number; y: number; color?: string; size?: number }) {
  return <Path d={`M${x - size / 2} ${y}H${x + size / 2}M${x} ${y - size / 2}V${y + size / 2}`} stroke={color} strokeWidth="1" strokeLinecap="round" />;
}

function LeafIcon({ x, y }: { x: number; y: number }) {
  return <G transform={`translate(${x} ${y})`}>
    <Path d="M3 12C-1 3 7 1 13 1C14 7 12 13 5 13M2 15L10 5" fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </G>;
}

function HeartIcon({ x, y }: { x: number; y: number }) {
  return <Path d={`M${x + 8} ${y + 14}L${x + 2} ${y + 8}C${x - 3} ${y + 2} ${x + 4} ${y - 2} ${x + 8} ${y + 3}C${x + 12} ${y - 2} ${x + 19} ${y + 2} ${x + 14} ${y + 8}Z`} fill="none" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />;
}

function Badge({ x, y, width, label, kind }: { x: number; y: number; width: number; label: string; kind: 'leaf' | 'heart' | 'check' }) {
  return <G>
    <Rect x={x - 2} y={y + 4} width={width + 4} height="48" rx="17" fill="#CFC5CF" opacity="0.09" />
    <Rect x={x} y={y} width={width} height="48" rx="16" fill="#FFFFFF" />
    <Rect x={x + 14} y={y + 12} width="25" height="25" rx="8" fill="#EEE8F6" />
    {kind === 'leaf' ? <LeafIcon x={x + 20} y={y + 17} /> : kind === 'heart' ? <HeartIcon x={x + 18} y={y + 17} /> : <Path d={`M${x + 20} ${y + 24}L${x + 24} ${y + 28}L${x + 32} ${y + 20}`} stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    <SvgText x={x + 48} y={y + 28.5} fontSize="12" fontWeight="500" fontFamily={fontFamilies.medium} fill="#66517F">{label}</SvgText>
  </G>;
}

function Whisper({ x, y, width, label }: { x: number; y: number; width: number; label: string }) {
  return <G>
    <Rect x={x - 2} y={y + 4} width={width + 4} height="34" rx="18" fill="#D4CBCD" opacity="0.08" />
    <Rect x={x} y={y} width={width} height="34" rx="17" fill="#FFFFFF" />
    <Circle cx={x + 13} cy={y + 17} r="2.3" fill={gold} />
    <SvgText x={x + 23} y={y + 20.5} fontSize="12" fontWeight="500" fontFamily={fontFamilies.medium} fill="#77618F">{label}</SvgText>
  </G>;
}

export function OnboardingIllustration({ step, width = 342, height = 284 }: { step: 0 | 1 | 2; width?: number; height?: number }) {
  const id = `hero${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return <Svg width={width} height={height} viewBox="0 0 342 284" {...decorativeAccessibility}>
    <Defs>
      <LinearGradient id={`${id}arch`} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#EEE7F3" /><Stop offset="1" stopColor="#EDE4DA" /></LinearGradient>
      <LinearGradient id={`${id}sun`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#F6DEC0" /><Stop offset="1" stopColor="#D5B494" /></LinearGradient>
      <LinearGradient id={`${id}pot`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#E3D9CB" /><Stop offset="1" stopColor="#C8BAAA" /></LinearGradient>
      <LinearGradient id={`${id}medal`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#F0DEC2" /><Stop offset="1" stopColor="#C8A47D" /></LinearGradient>
    </Defs>
    <Path d="M77 255V133C77 80 117 39 169 39C221 39 261 80 261 133V255" fill="none" stroke={pale} strokeWidth="1" />
    <Path d="M86 254V139C86 91 122 51 169 51C216 51 252 91 252 139V254Z" fill={`url(#${id}arch)`} />
    <Ellipse cx="170" cy="254" rx="90" ry="6" fill="#D9CFD1" opacity="0.14" />
    {step === 0 && <G>
      <Circle cx="169" cy="130" r="56" fill="none" stroke="#FFFFFF" opacity="0.66" />
      <Circle cx="169" cy="130" r="45" fill={`url(#${id}sun)`} />
      <Path d="M87 218Q172 189 251 222M89 231Q174 204 252 235" stroke="#FFFFFF" opacity="0.76" strokeWidth="1.1" fill="none" />
      <Path d="M143 199L150 233Q169 250 190 233L197 199Z" fill={`url(#${id}pot)`} />
      <Ellipse cx="170" cy="199" rx="27" ry="8" fill="#D4C7B5" />
      <Ellipse cx="170" cy="198" rx="22" ry="4.5" fill="#A9967E" />
      <Path d="M171 200V143Q171 127 167 111" stroke="#77618E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M171 174C148 179 131 165 130 146C152 144 171 154 171 174Z" fill="#9B87AC" />
      <Path d="M172 164C171 142 188 132 208 133C207 154 194 168 172 164Z" fill="#806B99" />
      <Path d="M168 141C150 135 146 123 151 108C168 108 177 122 168 141Z" fill="#9A85AB" />
      <Path d="M136 151L170 174M177 158L201 140M159 115L170 142" stroke="#CDBDD9" strokeWidth="1" fill="none" />
      <Sparkle x={105} y={113} /><Sparkle x={229} y={173} size={9} />
      <Whisper x={242} y={89} width={96} label="A fresh start" />
      <Badge x={5} y={216} width={157} label="One day at a time" kind="leaf" />
    </G>}
    {step === 1 && <G>
      <Circle cx="168" cy="137" r="57" fill="#F1EADD" opacity="0.42" />
      <G transform="rotate(-6 174 168)">
        <Rect x="101" y="88" width="159" height="158" rx="19" fill="#D7CADB" opacity="0.28" />
        <Rect x="96" y="82" width="159" height="158" rx="18" fill="#FFFFFF" />
        <SvgText x="111" y="103" fontSize="12" letterSpacing="0.4" fontWeight="500" fontFamily={fontFamilies.medium} fill="#79658E">YOUR PROGRESS</SvgText>
        <SvgText x="111" y="139" fontSize="30" fontFamily={fontFamilies.serif} fill="#66517F">07</SvgText>
        <SvgText x="151" y="133" fontSize="12" fontFamily={fontFamilies.sans} fill="#79658E">days</SvgText>
        <Path d="M113 188L131 179L149 184L168 166L188 162L207 148L227 155V203H113Z" fill="#F1ECF8" />
        <Path d="M113 188L131 179L149 184L168 166L188 162L207 148L227 155" stroke="#A18ACC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Circle cx="227" cy="155" r="2.9" fill="#7860A6" stroke="#FFFFFF" strokeWidth="1" />
        {[0, 1, 2, 3, 4, 5, 6].map(day => <G key={day}>
          <Circle cx={115 + day * 18.5} cy="219" r="4.7" fill={day === 6 ? '#7760A6' : '#EEE7F5'} />
          <Path d={`M${112.5 + day * 18.5} 219L${114.5 + day * 18.5} 221L${117.5 + day * 18.5} 217`} stroke={day === 6 ? '#FFFFFF' : '#B4A3CF'} strokeWidth="0.9" fill="none" strokeLinecap="round" />
        </G>)}
      </G>
      <Circle cx="87" cy="125" r="4" stroke="#CBBADA" strokeWidth="1" fill="none" />
      <Sparkle x={258} y={166} /><Whisper x={224} y={89} width={117} label="Your own rhythm" />
      <Badge x={8} y={216} width={151} label="Every day counts" kind="heart" />
    </G>}
    {step === 2 && <G>
      <Path d="M148 177L139 247L161 231L177 249L182 179Z" fill="#C5B4D8" />
      <Path d="M173 177L180 243L193 230L214 238L197 174Z" fill="#B7A3CE" />
      <Path d="M157 183L151 239M184 183L192 233" stroke="#EDE5F5" strokeWidth="1.2" fill="none" />
      <Circle cx="172" cy="141" r="53" fill={`url(#${id}medal)`} />
      <Circle cx="172" cy="141" r="45" fill="none" stroke="#FFF6E7" strokeWidth="1.2" />
      <Circle cx="172" cy="141" r="37" fill="#F7EDDD" stroke="#FFFFFF" strokeWidth="1" />
      <Circle cx="172" cy="141" r="31" fill="none" stroke="#DCC6AA" strokeWidth="0.8" strokeDasharray="1.2 3.1" />
      <Path d="M172 120L178 134L193 136L182 146L185 161L172 153L159 161L162 146L151 136L166 134Z" fill="#B58F6D" />
      <Path d="M173 125L177 136L188 138" fill="none" stroke="#D7B492" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M114 205Q95 183 103 135M225 205Q244 183 236 135" fill="none" stroke="#A3A58C" strokeWidth="1" />
      <Ellipse cx="102" cy="153" rx="4" ry="8" fill="#B0B199" transform="rotate(-30 102 153)" />
      <Ellipse cx="106" cy="141" rx="4" ry="7" fill="#B0B199" transform="rotate(-35 106 141)" />
      <Ellipse cx="102" cy="167" rx="4" ry="8" fill="#B0B199" transform="rotate(-29 102 167)" />
      <Ellipse cx="237" cy="153" rx="4" ry="8" fill="#B0B199" transform="rotate(30 237 153)" />
      <Ellipse cx="233" cy="141" rx="4" ry="7" fill="#B0B199" transform="rotate(35 233 141)" />
      <Ellipse cx="237" cy="167" rx="4" ry="8" fill="#B0B199" transform="rotate(29 237 167)" />
      <Sparkle x={111} y={106} color="#CEB392" /><Sparkle x={232} y={111} color="#CEB392" />
      <Whisper x={235} y={89} width={102} label="Made for you" />
      <Badge x={5} y={216} width={208} label="Celebrate the little wins" kind="check" />
    </G>}
  </Svg>;
}
