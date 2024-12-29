import { createContext, useContext } from 'react';

interface A11yContextType {
  announceMessage: (message: string) => void;
  highContrast: boolean;
  reduceMotion: boolean;
}

export const A11yContext = createContext<A11yContextType>({} as A11yContextType); 