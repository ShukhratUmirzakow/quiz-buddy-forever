import { useState, useEffect } from 'react';
import { openDB } from 'idb';

const THEME_DB_NAME = 'quizmaster-settings';
const THEME_STORE_NAME = 'settings';
const THEME_KEY = 'theme';

async function getThemeDB() {
  return openDB(THEME_DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(THEME_STORE_NAME)) {
        db.createObjectStore(THEME_STORE_NAME);
      }
    },
  });
}

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const db = await getThemeDB();
        const savedTheme = await db.get(THEME_STORE_NAME, THEME_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isLoaded]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    try {
      const db = await getThemeDB();
      await db.put(THEME_STORE_NAME, newTheme, THEME_KEY);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const setThemeValue = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      const db = await getThemeDB();
      await db.put(THEME_STORE_NAME, newTheme, THEME_KEY);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return { theme, toggleTheme, setTheme: setThemeValue, isLoaded };
}
