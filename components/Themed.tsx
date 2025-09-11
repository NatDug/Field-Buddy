/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import * as React from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export function Text(props: ThemeProps & DefaultText['props']) {
	const { style, ...otherProps } = props;
	return <DefaultText style={style} {...otherProps} />;
}

export function View(props: ThemeProps & DefaultView['props']) {
	const { style, ...otherProps } = props;
	return <DefaultView style={style} {...otherProps} />;
}

// Simple override context for admin UI text changes
const UiOverrideContext = React.createContext<Record<string, string> | null>(null);
export function UiOverrideProvider({ value, children }: { value: Record<string, string> | null, children: React.ReactNode }) {
	return <UiOverrideContext.Provider value={value}>{children}</UiOverrideContext.Provider>;
}
export function useUiOverride(key: string, fallback: string): string {
	const map = React.useContext(UiOverrideContext);
	return (map && map[key]) || fallback;
}
