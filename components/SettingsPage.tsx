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
  const [activeTab, setActiveTab] = useState<'categories' | 'language' | 'appearance' | 'workflow'>('categories')
  
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

  // Workflow settings state
  const [userSettings, setUserSettings] = useState<{ daily_steps_count: number, workflow: 'daily_planning' | 'no_workflow', daily_reset_hour: number, filters?: any } | null>(null)
  const [newDailyStepsCount, setNewDailyStepsCount] = useState(3)
  const [newWorkflow, setNewWorkflow] = useState<'denni_planovani' | 'zadna_workflow'>('denni_planovani')
  const [isSavingWorkflow, setIsSavingWorkflow] = useState(false)
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'denni_planovani' | 'zadna_workflow'>('denni_planovani')
  
  // Filter settings for No Workflow
  const [filterSettings, setFilterSettings] = useState({
    showToday: true,
    showOverdue: true,
    showFuture: false,
    showWithGoal: true,
    showWithoutGoal: true,
    sortBy: 'date' as 'date' | 'priority' | 'title'
  })

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
        
        // Load filter settings
        if (userData.settings?.filters) {
          setFilterSettings(userData.settings.filters)
        }
        setNewWorkflow(userData.settings?.workflow === 'daily_planning' ? 'denni_planovani' : 'zadna_workflow')
        setActiveWorkflowTab(userData.settings?.workflow === 'daily_planning' ? 'denni_planovani' : 'zadna_workflow')
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

  const handleQuickWorkflowChange = async (workflow: 'daily_planning' | 'no_workflow') => {
    setIsSavingWorkflow(true)
    try {
      const response = await fetch('/api/cesta/user-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow: workflow
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserSettings(data.settings)
        setNewWorkflow(workflow === 'daily_planning' ? 'denni_planovani' : 'zadna_workflow')
        setActiveWorkflowTab(workflow === 'daily_planning' ? 'denni_planovani' : 'zadna_workflow')
        alert(`Workflow změněn na ${workflow === 'daily_planning' ? 'Denní plánování' : 'Žádná workflow'}!`)
      } else {
        const error = await response.json()
        alert(`Chyba při změně workflow: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error changing workflow:', error)
      alert('Chyba při změně workflow')
    } finally {
      setIsSavingWorkflow(false)
    }
  }

  const handleSettingChange = async (field: string, value: any) => {
    if (!userSettings) return
    
    try {
      const response = await fetch('/api/cesta/user-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserSettings(data.settings)
      } else {
        console.error('Error updating setting:', field, value)
      }
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  }

  const handleSaveWorkflowSettings = async () => {
    setIsSavingWorkflow(true)
    try {
      const response = await fetch('/api/cesta/user-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daily_steps_count: newDailyStepsCount,
          workflow: newWorkflow === 'denni_planovani' ? 'daily_planning' : 'no_workflow'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserSettings(data.settings)
        alert('Nastavení workflow bylo uloženo!')
      } else {
        const error = await response.json()
        alert(`Chyba při ukládání nastavení: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error saving workflow settings:', error)
      alert('Chyba při ukládání nastavení workflow')
    } finally {
      setIsSavingWorkflow(false)
    }
  }

  const handleSaveFilterSettings = async () => {
    setIsSavingWorkflow(true)
    try {
      const response = await fetch('/api/cesta/user-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: filterSettings
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserSettings(data.settings)
        alert('Nastavení filtrů bylo uloženo!')
      } else {
        const error = await response.json()
        alert(`Chyba při ukládání nastavení: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error saving filter settings:', error)
      alert('Chyba při ukládání nastavení filtrů')
    } finally {
      setIsSavingWorkflow(false)
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
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Nastavení</h2>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {translations?.settings.categories || 'Kategorie cílů'}
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'language'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            {translations?.settings.language || 'Jazyk'}
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'appearance'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {translations?.settings.appearance || 'Zobrazení'}
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'workflow'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Workflow
          </button>
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">

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

              {activeTab === 'workflow' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Workflow</h2>
                    <p className="text-gray-600">
                      Vyberte si způsob, jak chcete pracovat s kroky a cíli v aplikaci.
                    </p>
                  </div>

                  {/* Workflow Tabs */}
                  <div className="mb-8">
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8">
                        <button
                          onClick={() => setActiveWorkflowTab('denni_planovani')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                            activeWorkflowTab === 'denni_planovani'
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>📅</span>
                          <span>Denní plánování</span>
                          {userSettings?.workflow === 'daily_planning' && (
                            <span className="text-primary-500">✓</span>
                          )}
                        </button>
                        <button
                          onClick={() => setActiveWorkflowTab('zadna_workflow')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                            activeWorkflowTab === 'zadna_workflow'
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>📋</span>
                          <span>Žádná workflow</span>
                          {userSettings?.workflow === 'no_workflow' && (
                            <span className="text-primary-500">✓</span>
                          )}
                        </button>
                      </nav>
                    </div>
                  </div>

                  {/* Daily Planning Tab */}
                  {activeWorkflowTab === 'denni_planovani' && (
                    <div className="space-y-8">
                      {/* Description */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">📅</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Denní plánování</h3>
                            <p className="text-blue-800 mb-4">
                              Každý den si naplánujete 3-5 kroků a postupně je plníte. Aplikace vás bude vybízet k doplnění plánu, pokud nebude mít dostatek kroků na dnešek.
                            </p>
                            
                            {/* Workflow Diagram */}
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <h4 className="font-medium text-blue-900 mb-3">Jak to funguje:</h4>
                              <div className="flex items-center space-x-4 text-sm text-blue-800">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                  <span>Ráno si naplánujete kroky</span>
                                </div>
                                <div className="text-blue-300">→</div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                  <span>Postupně je plníte</span>
                                </div>
                                <div className="text-blue-300">→</div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                  <span>Inspirace po dokončení</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Nastavení</h3>
                          <div className="flex items-center space-x-3">
                            {userSettings?.workflow !== 'daily_planning' && (
                              <button
                                onClick={() => handleQuickWorkflowChange('daily_planning')}
                                disabled={isSavingWorkflow}
                                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                              >
                                <span>✓</span>
                                <span>Vybrat workflow</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Počet denních kroků - inline editace */}
                          <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-medium text-gray-900">Počet denních kroků</h4>
                                <p className="text-sm text-gray-600">
                                  Kolik kroků chcete plánovat každý den
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={newDailyStepsCount}
                                onChange={(e) => setNewDailyStepsCount(parseInt(e.target.value) || 3)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg font-semibold"
                              />
                              <span className="text-gray-600">kroků denně</span>
                            </div>
                          </div>

                          {/* Čas resetování denního plánu */}
                          <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-medium text-gray-900">Čas resetování denního plánu</h4>
                                <p className="text-sm text-gray-600">
                                  V kolik hodin se má denní plán vyresetovat (0-23)
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <input
                                type="number"
                                min="0"
                                max="23"
                                value={userSettings?.daily_reset_hour || 0}
                                onChange={(e) => handleSettingChange('daily_reset_hour', parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg font-semibold"
                              />
                              <span className="text-gray-600">hodin (00:00 = půlnoc)</span>
                            </div>
                          </div>

                          {/* Uložit tlačítko */}
                          <div className="flex justify-end">
                            <button
                              onClick={handleSaveWorkflowSettings}
                              disabled={isSavingWorkflow}
                              className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                            >
                              {isSavingWorkflow ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Ukládám...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  <span>Uložit nastavení</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Workflow Tab */}
                  {activeWorkflowTab === 'zadna_workflow' && (
                    <div className="space-y-8">
                      {/* Description */}
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">📋</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">Žádná workflow</h3>
                            <p className="text-green-800 mb-4">
                              Zobrazí se všechny kroky k dokončení (dnešní a zpožděné). Jednoduchý seznam bez plánování - můžete pracovat s kroky přímo.
                            </p>
                            
                            {/* Workflow Diagram */}
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                              <h4 className="font-medium text-green-900 mb-3">Jak to funguje:</h4>
                              <div className="flex items-center space-x-4 text-sm text-green-800">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                  <span>Zobrazí se všechny kroky</span>
                                </div>
                                <div className="text-green-300">→</div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                  <span>Označujete jako hotové</span>
                                </div>
                                <div className="text-green-300">→</div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                  <span>Přidáváte nové</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Nastavení</h3>
                          <div className="flex items-center space-x-3">
                            {userSettings?.workflow !== 'no_workflow' && (
                              <button
                                onClick={() => handleQuickWorkflowChange('no_workflow')}
                                disabled={isSavingWorkflow}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                <span>✓</span>
                                <span>Vybrat workflow</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Filter Settings */}
                          <div className="bg-white rounded-lg p-6 border border-gray-200">
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900">Nastavení filtrů</h4>
                              <p className="text-sm text-gray-600">
                                Nastavte, které kroky se mají zobrazovat v "Žádná workflow"
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Date Filters */}
                              <div>
                                <h5 className="font-medium text-gray-900 mb-3">Zobrazit kroky</h5>
                                <div className="space-y-2">
                                  <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={filterSettings.showOverdue}
                                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showOverdue: e.target.checked }))}
                                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                                    />
                                    <span className="text-gray-700">Zpožděné kroky</span>
                                  </label>
                                  <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={filterSettings.showToday}
                                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showToday: e.target.checked }))}
                                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                                    />
                                    <span className="text-gray-700">Dnešní kroky</span>
                                  </label>
                                  <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={filterSettings.showFuture}
                                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showFuture: e.target.checked }))}
                                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                                    />
                                    <span className="text-gray-700">Budoucí kroky</span>
                                  </label>
                                </div>
                              </div>

                              {/* Goal Filters */}
                              <div>
                                <h5 className="font-medium text-gray-900 mb-3">Typ kroků</h5>
                                <div className="space-y-2">
                                  <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={filterSettings.showWithGoal}
                                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showWithGoal: e.target.checked }))}
                                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                                    />
                                    <span className="text-gray-700">S cílem</span>
                                  </label>
                                  <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={filterSettings.showWithoutGoal}
                                      onChange={(e) => setFilterSettings(prev => ({ ...prev, showWithoutGoal: e.target.checked }))}
                                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                                    />
                                    <span className="text-gray-700">Bez cíle</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Sort Options */}
                            <div className="mt-6">
                              <h5 className="font-medium text-gray-900 mb-3">Řazení</h5>
                              <div className="flex flex-wrap gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="sortBy"
                                    value="priority"
                                    checked={filterSettings.sortBy === 'priority'}
                                    onChange={(e) => setFilterSettings(prev => ({ ...prev, sortBy: e.target.value as 'priority' }))}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-gray-700">Podle priority</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="sortBy"
                                    value="date"
                                    checked={filterSettings.sortBy === 'date'}
                                    onChange={(e) => setFilterSettings(prev => ({ ...prev, sortBy: e.target.value as 'date' }))}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-gray-700">Podle data</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="sortBy"
                                    value="title"
                                    checked={filterSettings.sortBy === 'title'}
                                    onChange={(e) => setFilterSettings(prev => ({ ...prev, sortBy: e.target.value as 'title' }))}
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-gray-700">Podle názvu</span>
                                </label>
                              </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end mt-6">
                              <button
                                onClick={handleSaveFilterSettings}
                                disabled={isSavingWorkflow}
                                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                {isSavingWorkflow ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Ukládám...</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4" />
                                    <span>Uložit filtry</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </>
              )}
            </div>
        </div>
      </div>
    </div>
  )
})
