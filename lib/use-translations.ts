'use client'

import { useState, useEffect } from 'react'

export type Locale = 'cs' | 'en'

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(() => {
    // Initialize with the correct locale from localStorage immediately
    if (typeof window !== 'undefined') {
      const appLanguagePreference = localStorage.getItem('app-language-preference') as Locale
      if (appLanguagePreference && ['cs', 'en'].includes(appLanguagePreference)) {
        return appLanguagePreference
      }
      
      const savedLocale = localStorage.getItem('preferred-locale') as Locale
      if (savedLocale && ['cs', 'en'].includes(savedLocale)) {
        return savedLocale
      }
    }
    return 'cs'
  })
  
  useEffect(() => {
    // Listen for locale changes
    const handleLocaleChange = (event: CustomEvent) => {
      setLocale(event.detail.locale)
    }
    
    window.addEventListener('locale-change', handleLocaleChange as EventListener)
    
    return () => {
      window.removeEventListener('locale-change', handleLocaleChange as EventListener)
    }
  }, [])
  
  return locale
}

export function useTranslations() {
  const locale = useLocale()
  const [translations, setTranslations] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const t = await import(`../locales/${locale}/common.json`)
        setTranslations(t.default)
      } catch (error) {
        console.error('Error loading translations:', error)
        // Fallback to Czech if English fails
        if (locale === 'en') {
          try {
            const fallback = await import('../locales/cs/common.json')
            setTranslations(fallback.default)
          } catch (fallbackError) {
            console.error('Error loading fallback translations:', fallbackError)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [locale])

  return { translations, loading, locale }
}
