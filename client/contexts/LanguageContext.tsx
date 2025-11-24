import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Language, getTranslation } from '@/i18n/translations';
import { supabase } from '@/utils/supabaseClient';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, replacements?: Record<string, string>) => string;
  loading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage) {
          setLanguageState(savedLanguage);
        }
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('language')
        .eq('user_id', user.id)
        .single();

      if (!profileError && profile) {
        setLanguageState((profile.language as Language) || 'en');
      } else {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage) {
          setLanguageState(savedLanguage);
        }
      }
    } catch (err) {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) return;

      await supabase
        .from('user_profiles')
        .update({ language: lang, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Failed to update language preference:', err);
    }
  };

  const t = (key: string, replacements?: Record<string, string>): string => {
    return getTranslation(language, key, replacements);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
