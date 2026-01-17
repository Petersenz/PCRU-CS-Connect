import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/types';
import { getTranslation } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'th',
      setLanguage: (language) => set({ language }),
      t: (key: string, params?: Record<string, string | number>) => {
        const { language } = get();
        return getTranslation(key, language, params);
      },
    }),
    {
      name: 'pcru-language-storage',
    }
  )
);