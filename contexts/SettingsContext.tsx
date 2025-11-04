import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const SETTINGS_KEY = 'app_settings';

interface Settings {
  serverUrl: string;
  serverPort: string;
}

const DEFAULT_SETTINGS: Settings = {
  serverUrl: '185.120.251.246',
  serverPort: '80',
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('[Settings] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('[Settings] Save error:', error);
      throw error;
    }
  }, []);

  const getBaseUrl = useCallback(() => {
    const port = settings.serverPort === '80' || settings.serverPort === '' 
      ? '' 
      : `:${settings.serverPort}`;
    return `http://${settings.serverUrl}${port}`;
  }, [settings.serverUrl, settings.serverPort]);

  return useMemo(() => ({
    settings,
    isLoading,
    saveSettings,
    getBaseUrl,
  }), [settings, isLoading, saveSettings, getBaseUrl]);
});
