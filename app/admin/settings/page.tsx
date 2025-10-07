'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { AdminSettings } from '@/lib/admin-types'
import AdminLayout from '@/components/AdminLayout'

function SettingsContent() {
  const [settings, setSettings] = useState<AdminSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })

      if (response.ok) {
        const updatedSetting = await response.json()
        setSettings(prev => prev.map(setting => 
          setting.key === key ? updatedSetting : setting
        ))
        setSavedMessage('Nastavení uloženo!')
        setTimeout(() => setSavedMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error updating setting:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleBooleanSetting = (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true'
    updateSetting(key, newValue)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {savedMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Save className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{savedMessage}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Navigace</h2>
              <p className="text-sm text-gray-600 mb-6">
                Ovládejte, které sekce se zobrazí v hlavní navigaci webu. Vypnuté sekce nebudou viditelné pro návštěvníky ani pro vyhledávače.
              </p>
              
              <div className="space-y-6">
                {settings.filter(setting => setting.type === 'boolean').map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">
                          {setting.key === 'coaching_enabled' ? 'Koučing' : 'Workshopy'}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          setting.value === 'true' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {setting.value === 'true' ? 'Aktivní' : 'Neaktivní'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                    </div>
                    
                    <button
                      onClick={() => toggleBooleanSetting(setting.key, setting.value)}
                      disabled={saving}
                      className={`ml-4 p-1 rounded-full transition-colors ${
                        setting.value === 'true'
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-gray-400 hover:text-gray-500'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {setting.value === 'true' ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {settings.filter(setting => setting.type !== 'boolean').length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">Ostatní nastavení</h2>
                <div className="space-y-4">
                  {settings.filter(setting => setting.type !== 'boolean').map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {setting.key}
                      </label>
                      <p className="text-xs text-gray-500">{setting.description}</p>
                      {setting.type === 'textarea' ? (
                        <textarea
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={setting.type === 'number' ? 'number' : setting.type === 'url' ? 'url' : 'text'}
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Nastavení" description="Spravujte nastavení webu a navigace">
      <SettingsContent />
    </AdminLayout>
  )
}
