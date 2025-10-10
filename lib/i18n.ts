import { GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

// Type definitions for translations
export type Locale = 'cs' | 'en'

export interface Translations {
  navigation: {
    home: string
    about: string
    coaching: string
    workshops: string
    materials: string
    inspiration: string
    contact: string
    reservations: string
    myApp: string
  }
  hero: {
    tagline: string
    title: string
    subtitle: string
    cta: string
  }
  about: {
    title: string
    description1: string
    description2: string
    description3: string
    pageTitle: string
    pageSubtitle: string
    featuresTitle: string
    featuresSubtitle: string
    goalSetting: string
    goalSettingDesc: string
    progressTracking: string
    progressTrackingDesc: string
    personalDevelopment: string
    personalDevelopmentDesc: string
    inspiration: string
    inspirationDesc: string
    support: string
    supportDesc: string
    ctaTitle: string
    ctaSubtitle: string
  }
  onboarding: {
    welcome: string
    subtitle: string
    description: string
    valuesTitle: string
    valuesSubtitle: string
    valuesDescription: string
    addCustomValue: string
    customValuePlaceholder: string
    customValueDescription: string
    continue: string
    complete: string
    clearGoals: string
    clearGoalsDesc: string
    dailySteps: string
    dailyStepsDesc: string
    progressTracking: string
    progressTrackingDesc: string
  }
  values: {
    health: string
    healthDescription: string
    family: string
    familyDescription: string
    career: string
    careerDescription: string
    learning: string
    learningDescription: string
    adventure: string
    adventureDescription: string
    creativity: string
    creativityDescription: string
    community: string
    communityDescription: string
    spirituality: string
    spiritualityDescription: string
  }
  settings: {
    title: string
    subtitle: string
    addValue: string
    editValue: string
    deleteValue: string
    valueName: string
    valueDescription: string
    valueColor: string
    valueIcon: string
    save: string
    cancel: string
    delete: string
    language: string
    languageDescription: string
    values: string
    categories: string
    myValues: string
    categorySettings: string
    editSettings: string
    shortTermGoals: string
    mediumTermGoals: string
    longTermGoals: string
    days: string
    yearPlus: string
    loadingSettings: string
    autoUpdateGoals: string
    autoUpdateDescription: string
  }
  app: {
    title: string
    description: string
    signInTitle: string
    signInSubtitle: string
    signUpTitle: string
    signUpSubtitle: string
    mainDashboard: string
    goals: string
    steps: string
    values: string
    settings: string
    overview: string
    automations: string
    addGoal: string
    addStep: string
    editGoal: string
    deleteGoal: string
    goalTitle: string
    goalDescription: string
    goalDeadline: string
    goalProgress: string
    stepTitle: string
    stepDescription: string
    stepCompleted: string
    stepPending: string
    loading: string
    error: string
    success: string
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    close: string
    back: string
    next: string
    previous: string
    yes: string
    no: string
  }
  common: {
    loading: string
    error: string
    success: string
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    close: string
    back: string
    next: string
    previous: string
    yes: string
    no: string
  }
}

// Load translations dynamically
export async function getTranslations(locale: Locale): Promise<Translations> {
  try {
    const translations = await import(`../locales/${locale}/common.json`)
    return translations.default
  } catch (error) {
    console.error(`Failed to load translations for locale ${locale}:`, error)
    // Fallback to Czech if English fails
    if (locale === 'en') {
      const fallback = await import('../locales/cs/common.json')
      return fallback.default
    }
    throw error
  }
}

// Hook for using translations in components
export function useTranslations(): Translations {
  const { locale } = useRouter()
  
  return useMemo(() => {
    // This is a simplified version - in a real app you'd load translations dynamically
    // For now, we'll return empty object and handle loading in components
    return {} as Translations
  }, [locale])
}

// Helper function for server-side props
export async function getStaticPropsWithTranslations(
  context: GetStaticPropsContext,
  additionalProps: any = {}
) {
  const locale = (context.locale || 'cs') as Locale
  const translations = await getTranslations(locale)
  
  return {
    props: {
      translations,
      ...additionalProps
    }
  }
}

// Helper function for client-side translation loading
export async function loadTranslations(locale: Locale): Promise<Translations> {
  return getTranslations(locale)
}
