import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Settings = Record<string, string>;

const SiteSettingsContext = createContext<Settings>({});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (data) {
        const map: Settings = {};
        data.forEach(r => { map[r.key] = r.value; });
        setSettings(map);
      }
    });
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
