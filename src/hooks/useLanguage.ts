import { useState, useEffect, useCallback } from 'react';
import { Language, getCurrentLanguage, setCurrentLanguage, t as translate } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(getCurrentLanguage());
  const [, forceUpdate] = useState({});

  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang);
    setLanguage(lang);
    forceUpdate({});
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return translate(key, params);
  }, [language]);

  return { language, changeLanguage, t };
}
