import React from 'react';
import { TextInput as RNTextInput,TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { fontFamilies } from '../tokens/typography';
export type NativeTextInput=RNTextInput;
/** Native inputs share fonts, contrast, selection color, and font scaling. */
export const NativeTextInput=React.forwardRef<RNTextInput,TextInputProps>(function NativeTextInput(props,ref){
  const {colors}=useTheme();
  return <RNTextInput ref={ref} selectionColor={colors.accent.primary} placeholderTextColor={colors.text.muted} {...props} style={[{fontFamily:fontFamilies.sans,fontSize:15,lineHeight:24,color:colors.text.primary},props.style]}/>;
});
