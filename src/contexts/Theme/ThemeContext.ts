import { createContext } from 'react';
import { Theme } from '../../utils/theme';

export const ThemeContext = createContext<Theme | null>(null);
