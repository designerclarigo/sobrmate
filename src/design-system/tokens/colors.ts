/** Semantic palette shared by screens, controls, and both themes. */
export const colors = {
  background: { canvas:'#FAF9F6', surface:'#FFFFFF', subtle:'#F7F4F8', muted:'#F1EDF3', elevated:'#FFFFFF', overlay:'rgba(48,43,64,0.48)' },
  text: { primary:'#302B40', secondary:'#79658E', tertiary:'#887097', muted:'#A69BB0', inverse:'#FFFFFF', accent:'#79658E', success:'#45866B' },
  accent: {
    primary:'#79658E', primaryHover:'#66517F', primaryLight:'#F5F0F7', primaryBorder:'#E7DEED', primaryDark:'#66517F',
    success:'#45866B', successLight:'#EEF5F0', successBorder:'#D5E6D9', successDark:'#326A50',
    champagne:'#C69B45', champagneLight:'#FAF4E8', amber:'#C69B45', amberLight:'#FAF4E8', amberBorder:'#EAD9B5',
    warning:'#E7B84B', warningLight:'#FBF5E5', orange:'#E58A38', orangeLight:'#FCF0E4',
    sky:'#5682A9', skyLight:'#EDF3F8', rose:'#D95656', roseLight:'#FBECEC', roseBorder:'#F0CECE',
  },
  border: { subtle:'#E8E2EB', medium:'#D8CEDF', focus:'#79658E', selected:'#B6A5C1' },
  status: { success:'#45866B', warning:'#C69B45', orange:'#E58A38', danger:'#D95656', blackout:'#302B40', info:'#79658E' },
} as const;
export type ColorTokens = { [K in keyof typeof colors]: { [P in keyof typeof colors[K]]:string } };
export const darkColors:ColorTokens = {
  background: { canvas:'#17171D', surface:'#232329', subtle:'#2A2931', muted:'#38353F', elevated:'#27262F', overlay:'rgba(0,0,0,0.68)' },
  text: { primary:'#F3F2F7', secondary:'#B4B1C0', tertiary:'#B4B1C0', muted:'#9E99AC', inverse:'#17171D', accent:'#B5A6EF', success:'#77BF98' },
  accent: {
    primary:'#A191E0', primaryHover:'#B5A6EF', primaryLight:'#302A45', primaryBorder:'#4A405F', primaryDark:'#C2B5F5',
    success:'#77BF98', successLight:'#20362C', successBorder:'#395C49', successDark:'#98D6B4',
    champagne:'#DAB66C', champagneLight:'#393022', amber:'#DAB66C', amberLight:'#393022', amberBorder:'#605033',
    warning:'#E7C567', warningLight:'#3A3423', orange:'#EDA666', orangeLight:'#3D2E24',
    sky:'#8CB5D8', skyLight:'#233340', rose:'#ED8787', roseLight:'#40292D', roseBorder:'#6B4147',
  },
  border: { subtle:'#39353F', medium:'#514B5D', focus:'#A191E0', selected:'#A191E0' },
  status: { success:'#77BF98', warning:'#E7C567', orange:'#EDA666', danger:'#ED8787', blackout:'#B4B1C0', info:'#A191E0' },
};
