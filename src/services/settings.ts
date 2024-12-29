interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  customScoring: Record<string, number>;
}

export const exportSettings = () => {
  const settings = localStorage.getItem('settings');
  return btoa(settings || '');
}; 