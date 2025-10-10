'use client'

import { useState, useEffect, memo } from 'react'
import { Plus, Edit2, Trash2, Save, X, Globe } from 'lucide-react'
import { usePageContext } from './PageContext'
import { useTranslations, useLocale, type Locale } from '@/lib/use-translations'

interface Value {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  is_custom: boolean
}


interface CategorySettings {
  id: string
  user_id: string
  short_term_days: number
  long_term_days: number
  created_at: Date
  updated_at: Date
}


interface SettingsPageProps {
  onValuesChange?: (values: Value[]) => void
}

export const SettingsPage = memo(function SettingsPage({ onValuesChange }: SettingsPageProps = {}) {
  const { setTitle, setSubtitle } = usePageContext()
  const { translations } = useTranslations()
  const currentLocale = useLocale()
  const [values, setValues] = useState<Value[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'values' | 'categories' | 'language'>('values')
  
  // Values editing state
  const [editingValue, setEditingValue] = useState<Value | null>(null)
  const [newValue, setNewValue] = useState({ name: '', description: '', color: '#3B82F6', icon: 'heart' })
  
  // Category settings state
  const [categorySettings, setCategorySettings] = useState<CategorySettings | null>(null)
  const [editingCategorySettings, setEditingCategorySettings] = useState(false)
  const [newCategorySettings, setNewCategorySettings] = useState({ shortTermDays: 90, longTermDays: 365 })
  const [isUpdatingGoals, setIsUpdatingGoals] = useState(false)

  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(currentLocale)

  const iconOptions = [
    'heart', 'star', 'compass', 'trending-up', 'palette', 'briefcase', 
    'map', 'moon', 'sun', 'shield', 'zap', 'target'
  ]

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [valuesRes, categorySettingsRes] = await Promise.all([
        fetch('/api/cesta/values'),
        fetch('/api/cesta/category-settings')
      ])
      
      if (valuesRes.ok) {
        const valuesData = await valuesRes.json()
        setValues(valuesData.values || [])
        
        // Update page title and subtitle
        setTitle(translations?.settings.title || 'Nastavení')
        setSubtitle(`${(valuesData.values || []).length} ${translations?.settings.values || 'hodnot'}`)
      }
      
      if (categorySettingsRes.ok) {
        const categoryData = await categorySettingsRes.json()
        setCategorySettings(categoryData.settings)
        setNewCategorySettings({
          shortTermDays: categoryData.settings?.short_term_days || 90,
          longTermDays: categoryData.settings?.long_term_days || 365
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (locale: Locale) => {
    setSelectedLanguage(locale)
    
    // Save to localStorage with higher priority
    localStorage.setItem('app-language-preference', locale)
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('locale-change', { detail: { locale } }))
    
    // Reload the page to apply the new locale
    window.location.reload()
  }

  const handleCreateValue = async () => {
    try {
      const response = await fetch('/api/cesta/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newValue)
      })
      
      if (response.ok) {
        const data = await response.json()
        const updatedValues = [...values, data.value]
        setValues(updatedValues)
        onValuesChange?.(updatedValues)
        // Trigger storage event to sync across tabs
        localStorage.setItem('cesta-values-updated', Date.now().toString())
        setNewValue({ name: '', description: '', color: '#3B82F6', icon: 'heart' })
        setEditingValue(null)
      }
    } catch (error) {
      console.error('Error creating value:', error)
    }
  }

  const handleUpdateValue = async (value: Value) => {
    try {
      const response = await fetch(`/api/cesta/values/${value.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      })
      
      if (response.ok) {
        const updatedValues = values.map(v => v.id === value.id ? value : v)
        setValues(updatedValues)
        onValuesChange?.(updatedValues)
        // Trigger storage event to sync across tabs
        localStorage.setItem('cesta-values-updated', Date.now().toString())
        setEditingValue(null)
      }
    } catch (error) {
      console.error('Error updating value:', error)
    }
  }

  const handleDeleteValue = async (id: string) => {
    try {
      const response = await fetch(`/api/cesta/values/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const updatedValues = values.filter(v => v.id !== id)
        setValues(updatedValues)
        onValuesChange?.(updatedValues)
        // Trigger storage event to sync across tabs
        localStorage.setItem('cesta-values-updated', Date.now().toString())
      }
    } catch (error) {
      console.error('Error deleting value:', error)
    }
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
        alert(`Chyba při ukládání nastavení: ${error.error || 'Neznámá chyba'}`)
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
      alert('Chyba při ukládání nastavení')
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
                  onClick={() => setActiveTab('values')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'values'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {translations?.settings.values || 'Hodnoty'}
                </button>
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
              </nav>
            </div>

            <div className="space-y-6">
              {activeTab === 'values' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Moje hodnoty</h2>
                  <button
                    onClick={() => {
                      setNewValue({ name: '', description: '', color: '#3B82F6', icon: 'heart' })
                      setEditingValue({ id: '', name: '', description: '', color: '#3B82F6', icon: 'heart', is_custom: true })
                    }}
                    className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Přidat hodnotu</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {values.map((value) => (
                    <div key={value.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: value.color }}
                          >
                            <span className="text-sm">📌</span>
                          </div>
                          <span className="font-medium text-gray-900">{value.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingValue(value)}
                            className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteValue(value.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {value.description && (
                        <p className="text-sm text-gray-600">{value.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Nastavení kategorií cílů</h2>
                    <button
                      onClick={() => setEditingCategorySettings(true)}
                      className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Upravit nastavení</span>
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-blue-500 text-xl">ℹ️</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">Automatická aktualizace cílů</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Při uložení nového nastavení kategorií se automaticky aktualizují všechny existující cíle, 
                          aby měly správnou kategorii podle svého data dokončení.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Krátkodobé cíle</h3>
                          <p className="text-sm text-gray-600">Cíle s datem dokončení do {categorySettings?.short_term_days || 90} dnů</p>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">{categorySettings?.short_term_days || 90} dnů</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Střednědobé cíle</h3>
                          <p className="text-sm text-gray-600">Cíle s datem dokončení od {categorySettings?.short_term_days || 90} do {categorySettings?.long_term_days || 365} dnů</p>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">{(categorySettings?.long_term_days || 365) - (categorySettings?.short_term_days || 90)} dnů</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Dlouhodobé cíle</h3>
                          <p className="text-sm text-gray-600">Cíle s datem dokončení nad {categorySettings?.long_term_days || 365} dnů</p>
                        </div>
                        <span className="text-2xl font-bold text-primary-500">1+ rok</span>
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
                          Změna jazyka se projeví okamžitě v celé aplikaci. Toto nastavení má prioritu nad automatickou detekcí jazyka.
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

            </div>
          </div>
        </div>
      </div>
    )
  })
