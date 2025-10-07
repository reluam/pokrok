'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { CoachingPackage } from '@/lib/admin-types'

const colorOptions = [
  { value: 'bg-primary-500', label: 'Primární (modrá)', textColor: 'text-primary-500', borderColor: 'border-primary-500' },
  { value: 'bg-green-500', label: 'Zelená', textColor: 'text-green-500', borderColor: 'border-green-500' },
  { value: 'bg-purple-500', label: 'Fialová', textColor: 'text-purple-500', borderColor: 'border-purple-500' },
  { value: 'bg-red-500', label: 'Červená', textColor: 'text-red-500', borderColor: 'border-red-500' },
  { value: 'bg-blue-500', label: 'Modrá', textColor: 'text-blue-500', borderColor: 'border-blue-500' },
  { value: 'bg-indigo-500', label: 'Indigo', textColor: 'text-indigo-500', borderColor: 'border-indigo-500' },
  { value: 'bg-pink-500', label: 'Růžová', textColor: 'text-pink-500', borderColor: 'border-pink-500' },
  { value: 'bg-yellow-500', label: 'Žlutá', textColor: 'text-yellow-500', borderColor: 'border-yellow-500' },
]

export default function EditCoachingPackagePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    duration: '',
    features: [''],
    color: 'bg-primary-500',
    textColor: 'text-primary-500',
    borderColor: 'border-primary-500',
    headerTextColor: 'text-white',
    enabled: true,
    order: 0
  })

  useEffect(() => {
    loadPackage()
  }, [params.id])

  const loadPackage = async () => {
    try {
      const response = await fetch(`/api/admin/coaching-packages/${params.id}`)
      if (response.ok) {
        const packageData: CoachingPackage = await response.json()
        setFormData({
          title: packageData.title,
          subtitle: packageData.subtitle,
          description: packageData.description,
          price: packageData.price,
          duration: packageData.duration,
          features: packageData.features.length > 0 ? packageData.features : [''],
          color: packageData.color,
          textColor: packageData.textColor,
          borderColor: packageData.borderColor,
          headerTextColor: packageData.headerTextColor || 'text-white',
          enabled: packageData.enabled,
          order: packageData.order
        })
      } else {
        alert('Balíček nebyl nalezen')
        router.push('/admin/coaching-packages')
      }
    } catch (error) {
      console.error('Error loading coaching package:', error)
      alert('Chyba při načítání balíčku')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Filter out empty features
      const cleanedFeatures = formData.features.filter(feature => feature.trim() !== '')
      
      const response = await fetch(`/api/admin/coaching-packages/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features: cleanedFeatures
        })
      })

      if (response.ok) {
        router.push('/admin/coaching-packages')
      } else {
        const error = await response.json()
        alert(`Chyba při aktualizaci balíčku: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating coaching package:', error)
      alert('Chyba při aktualizaci balíčku')
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (colorValue: string) => {
    const colorOption = colorOptions.find(option => option.value === colorValue)
    if (colorOption) {
      setFormData({
        ...formData,
        color: colorOption.value,
        textColor: colorOption.textColor,
        borderColor: colorOption.borderColor
      })
    }
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({
      ...formData,
      features: newFeatures
    })
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání balíčku...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/coaching-packages"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Zpět na balíčky</span>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Upravit koučovací balíček</h1>
          <p className="text-gray-600">Upravte koučovací balíček pro stránku rezervací</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Název balíčku *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="např. Koučovací balíček"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Podtitul *
                </label>
                <input
                  type="text"
                  id="subtitle"
                  required
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="např. Plně přizpůsobitelný"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Popis *
              </label>
              <textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Popište koučovací balíček..."
              />
            </div>

            {/* Price & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Cena *
                </label>
                <input
                  type="text"
                  id="price"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="např. 15 000 Kč nebo Cena na domluvě"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Doba trvání *
                </label>
                <input
                  type="text"
                  id="duration"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="např. 10 sezení nebo Od 6 sezení"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vlastnosti balíčku
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Vlastnost balíčku..."
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Přidat vlastnost</span>
                </button>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barva balíčku
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleColorChange(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.color === option.value
                        ? 'border-gray-900 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 ${option.value} rounded mx-auto mb-2`}></div>
                    <div className="text-xs text-gray-600">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                  Pořadí zobrazení
                </label>
                <input
                  type="number"
                  id="order"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Nižší číslo = vyšší pozice</p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                  Aktivní (zobrazit na webu)
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/admin/coaching-packages"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Zrušit
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Ukládání...' : 'Uložit změny'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

