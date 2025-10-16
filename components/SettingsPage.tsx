'use client'

import { useState, useEffect, memo } from 'react'
import { Save, Globe, Edit2 } from 'lucide-react'
import { usePageContext } from './PageContext'
import { useTranslations, useLocale, type Locale } from '@/lib/use-translations'
import { colorPalettes, applyColorTheme } from '@/lib/color-utils'

interface CategorySettings {
  id: string
  user_id: string
  short_term_days: number
  long_term_days: number
  created_at: Date
  updated_at: Date
}

interface SettingsPageProps {}

export const SettingsPage = memo(function SettingsPage({}: SettingsPageProps = {}) {
  const { setTitle, setSubtitle } = usePageContext()
  const { translations, locale } = useTranslations()
  const currentLocale = useLocale()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'categories' | 'language' | 'appearance' | 'daily-planning'>('categories')
  
  // Category settings state
  const [categorySettings, setCategorySettings] = useState<CategorySettings | null>(null)
  const [editingCategorySettings, setEditingCategorySettings] = useState(false)
  const [newCategorySettings, setNewCategorySettings] = useState({ shortTermDays: 90, longTermDays: 365 })
  const [isUpdatingGoals, setIsUpdatingGoals] = useState(false)

  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(currentLocale)

  // Appearance settings state
  const [primaryColor, setPrimaryColor] = useState('#E8871E') // Default orange
  const [isSavingAppearance, setIsSavingAppearance] = useState(false)

  // Daily planning settings state
  const [userSettings, setUserSettings] = useState<{ daily_steps_count: number } | null>(null)
  const [editingDailyPlanning, setEditingDailyPlanning] = useState(false)
  const [newDailyStepsCount, setNewDailyStepsCount] = useState(3)
  const [isSavingDailyPlanning, setIsSavingDailyPlanning] = useState(false)

  const colorOptions = colorPalettes

  useEffect(() => {
    if (translations) {
      loadData()
    }
  }, [translations])

  // Update page title and subtitle when translations are loaded
  useEffect(() => {
    if (translations) {
      setTitle(translations?.settings.title || 'Nastavení')
      setSubtitle(translations?.settings.appManagement || 'Správa aplikace')
    }
  }, [translations])

  const loadData = async () => {
    try {
      setLoading(true)
      const [categorySettingsRes, userSettingsRes] = await Promise.all([
        fetch('/api/cesta/category-settings'),
        fetch('/api/cesta/user-settings')
      ])
      
      if (categorySettingsRes.ok) {
        const categoryData = await categorySettingsRes.json()
        setCategorySettings(categoryData.settings)
        setNewCategorySettings({
          shortTermDays: categoryData.settings?.short_term_days || 90,
          longTermDays: categoryData.settings?.long_term_days || 365
        })
      }

      if (userSettingsRes.ok) {
        const userData = await userSettingsRes.json()
        setUserSettings(userData.settings)
        setNewDailyStepsCount(userData.settings?.daily_steps_count || 3)
      }
      
      // Load appearance settings
      const savedPrimaryColor = localStorage.getItem('app-primary-color')
      if (savedPrimaryColor) {
        setPrimaryColor(savedPrimaryColor)
        // Apply the theme immediately when loading
        applyColorTheme(savedPrimaryColor)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAppearance = async () => {
    setIsSavingAppearance(true)
    try {
      // Apply the theme immediately
      applyColorTheme(primaryColor)
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('appearance-change', { 
        detail: { primaryColor } 
      }))
      
      // Show success message
      alert(translations?.settings.saveAppearance || 'Nastavení zobrazení bylo uloženo!')
    } catch (error) {
      console.error('Error saving appearance settings:', error)
      alert(translations?.common.error || 'Chyba při ukládání nastavení')
    } finally {
      setIsSavingAppearance(false)
    }
  }

  const handleLanguageChange = (locale: Locale) => {
    setSelectedLanguage(locale)
    
    // Save to localStorage with higher priority
    localStorage.setItem('app-language-preference', locale)
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('locale-change', { detail: { locale } }))
    
    // Show success message
    alert(translations?.settings.languageChanged || 'Jazyk byl změněn!')
  }

  const handleSaveCategorySettings = async () => {
    try {
      // First, save the category settings
      const settingsResponse = await fetch('/api/cesta/category-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shortTermDays: newCategorySettings.shortTermDays,
          longTermDays: newCategorySettings.longTermDays
        })
      })

      if (!settingsResponse.ok) {
        const error = await settingsResponse.json()
        alert(`${translations?.settings.errorSavingSettings || 'Chyba při ukládání nastavení'}: ${error.error || (translations?.common.unknownError || 'Neznámá chyba')}`)
        return
      }

      const settingsResult = await settingsResponse.json()
      setCategorySettings(settingsResult.settings)
      setEditingCategorySettings(false)

      // Then, automatically update existing goals
      setIsUpdatingGoals(true)
      try {
        const goalsResponse = await fetch('/api/cesta/update-existing-goals-categories')
        
        if (goalsResponse.ok) {
          const goalsResult = await goalsResponse.json()
          alert(`Nastavení kategorií bylo uloženo a ${goalsResult.updatedCount} existujících cílů bylo aktualizováno!`)
        } else {
          // Settings were saved, but goals update failed
          alert('Nastavení kategorií bylo uloženo, ale nepodařilo se aktualizovat existující cíle. Můžete to zkusit později.')
        }
      } catch (goalsError) {
        console.error('Error updating existing goals:', goalsError)
        alert('Nastavení kategorií bylo uloženo, ale nepodařilo se aktualizovat existující cíle. Můžete to zkusit později.')
      } finally {
        setIsUpdatingGoals(false)
      }

    } catch (error) {
      console.error('Error saving category settings:', error)
      alert(translations?.settings.errorSavingSettings || 'Chyba při ukládání nastavení')
    }
  }

  const handleSaveDailyPlanningSettings = async () => {
    setIsSavingDailyPlanning(true)
    try {
      const response = await fetch('/api/cesta/user-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_steps_count: newDailyStepsCount
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserSettings(data.settings)
        setEditingDailyPlanning(false)
        alert('Nastavení denního plánování bylo uloženo!')
      } else {
        const error = await response.json()
        alert(`Chyba při ukládání nastavení: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error saving daily planning settings:', error)
      alert('Chyba při ukládání nastavení denního plánování')
    } finally {
      setIsSavingDailyPlanning(false)
    }
  }




  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{translations?.settings.loadingSettings || 'Načítám nastavení...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'categories'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {translations?.settings.categories || 'Kategorie cílů'}
                </button>
                <button
                  onClick={() => setActiveTab('language')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'language'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  {translations?.settings.language || 'Jazyk'}
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'appearance'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {translations?.settings.appearance || 'Zobrazení'}
                </button>
                <button
                  onClick={() => setActiveTab('daily-planning')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'daily-planning'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Denní plánování
                </button>
              </nav>
            </div>

            <div className="space-y-6">
              {activeTab === 'appearance' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">{translations?.settings.appAppearance || 'Zobrazení aplikace'}</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Primary Color Selection */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">{translations?.settings.primaryColor || 'Primární barva'}</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {translations?.settings.selectPrimaryColor || 'Vyberte si primární barvu, která se použije v celé aplikaci.'}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setPrimaryColor(color.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              primaryColor === color.value
                                ? 'border-gray-900 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color.bg }}
                          >
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: color.value }}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {color.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Náhled</h3>
                      <div className="p-6 rounded-lg border" style={{ backgroundColor: colorOptions.find(c => c.value === primaryColor)?.bg || '#FFF7ED' }}>
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Ukázkový cíl</h4>
                            <p className="text-sm text-gray-600">Toto je náhled, jak bude vypadat aplikace</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                backgroundColor: primaryColor,
                                width: '60%'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveAppearance}
                        disabled={isSavingAppearance}
                        className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {isSavingAppearance ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{translations?.common.saving || 'Ukládám...'}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{translations?.settings.saveSettings || 'Uložit nastavení'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">{translations?.settings.categorySettings || 'Nastavení kategorií cílů'}</h2>
                    <button
                      onClick={() => setEditingCategorySettings(true)}
                      className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>{translations?.settings.editSettings || 'Upravit nastavení'}</span>
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-blue-500 text-xl">ℹ️</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">{translations?.settings.automaticGoalUpdate || 'Automatická aktualizace cílů'}</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          {translations?.settings.automaticGoalUpdateDescription || 'Při uložení nového nastavení kategorií se automaticky aktualizují všechny existující cíle, aby měly správnou kategorii podle svého data dokončení.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{translations?.settings.shortTermGoals || 'Krátkodobé cíle'}</h3>
                          <p className="text-sm text-gray-600">{translations?.settings.goalsWithDeadline || 'Cíle s datem dokončení do'} {categorySettings?.short_term_days || 90} {translations?.app.days || 'dnů'}</p>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">{categorySettings?.short_term_days || 90} {translations?.app.days || 'dnů'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{translations?.settings.mediumTermGoals || 'Střednědobé cíle'}</h3>
                          <p className="text-sm text-gray-600">{translations?.settings.goalsWithDeadlineRange || 'Cíle s datem dokončení od'} {categorySettings?.short_term_days || 90} {translations?.settings.to || 'do'} {categorySettings?.long_term_days || 365} {translations?.app.days || 'dnů'}</p>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">{(categorySettings?.long_term_days || 365) - (categorySettings?.short_term_days || 90)} {translations?.app.days || 'dnů'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{translations?.settings.longTermGoals || 'Dlouhodobé cíle'}</h3>
                          <p className="text-sm text-gray-600">{translations?.settings.goalsWithDeadlineOver || 'Cíle s datem dokončení nad'} {categorySettings?.long_term_days || 365} {translations?.app.days || 'dnů'}</p>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">{translations?.settings.onePlusYear || '1+ rok'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'language' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {translations?.settings.language || 'Jazyk'}
                    </h2>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">
                          {translations?.settings.languageDescription || 'Vyberte si jazyk aplikace'}
                        </h3>
                        <p className="text-sm text-blue-700 mt-1">
                          {translations?.settings.languageChangeDescription || 'Změna jazyka se projeví okamžitě v celé aplikaci. Toto nastavení má prioritu nad automatickou detekcí jazyka.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleLanguageChange('cs')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedLanguage === 'cs'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🇨🇿</span>
                          <div className="text-left">
                            <h3 className="font-semibold">Čeština</h3>
                            <p className="text-sm text-gray-600">Czech</p>
                          </div>
                          {selectedLanguage === 'cs' && (
                            <div className="ml-auto">
                              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedLanguage === 'en'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🇺🇸</span>
                          <div className="text-left">
                            <h3 className="font-semibold">English</h3>
                            <p className="text-sm text-gray-600">Angličtina</p>
                          </div>
                          {selectedLanguage === 'en' && (
                            <div className="ml-auto">
                              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'daily-planning' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Denní plánování</h2>
                    <button
                      onClick={() => setEditingDailyPlanning(true)}
                      className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Upravit nastavení</span>
                    </button>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-green-500 text-xl">📅</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-green-900">Denní plánování kroků</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Nastavte si, kolik kroků chcete plánovat každý den. Aplikace vás bude vybízet k doplnění plánu, pokud nebude mít dostatek kroků na dnešek.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Počet denních kroků</h3>
                          <p className="text-sm text-gray-600">
                            {userSettings?.daily_steps_count || 3} kroků denně
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">
                          {userSettings?.daily_steps_count || 3}
                        </span>
                      </div>
                      
                      {editingDailyPlanning && (
                        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-4">Upravit počet denních kroků</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Počet kroků (1-10)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={newDailyStepsCount}
                                onChange={(e) => setNewDailyStepsCount(parseInt(e.target.value) || 3)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleSaveDailyPlanningSettings}
                                disabled={isSavingDailyPlanning}
                                className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                              >
                                {isSavingDailyPlanning ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Ukládám...</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    <span>Uložit</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDailyPlanning(false)
                                  setNewDailyStepsCount(userSettings?.daily_steps_count || 3)
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Zrušit
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    )
  })
