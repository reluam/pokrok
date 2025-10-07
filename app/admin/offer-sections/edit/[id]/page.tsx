'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lightbulb, Flag, MessageCircle, Target, Users, Star, Heart, Zap } from 'lucide-react'
import Link from 'next/link'
import { OfferSection } from '@/lib/admin-types'

const iconOptions = [
  { value: 'Lightbulb', label: 'Žárovka', component: Lightbulb },
  { value: 'Flag', label: 'Vlajka', component: Flag },
  { value: 'MessageCircle', label: 'Zpráva', component: MessageCircle },
  { value: 'Target', label: 'Cíl', component: Target },
  { value: 'Users', label: 'Lidé', component: Users },
  { value: 'Star', label: 'Hvězda', component: Star },
  { value: 'Heart', label: 'Srdce', component: Heart },
  { value: 'Zap', label: 'Blesk', component: Zap },
]

export default function EditOfferSectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Lightbulb',
    href: '',
    enabled: true,
    order: 0
  })

  useEffect(() => {
    loadSection()
  }, [params.id])

  const loadSection = async () => {
    try {
      const response = await fetch(`/api/admin/offer-sections/${params.id}`)
      if (response.ok) {
        const sectionData: OfferSection = await response.json()
        setFormData({
          title: sectionData.title,
          description: sectionData.description,
          icon: sectionData.icon,
          href: sectionData.href,
          enabled: sectionData.enabled,
          order: sectionData.order
        })
      } else {
        alert('Sekce nebyla nalezena')
        router.push('/admin/offer-sections')
      }
    } catch (error) {
      console.error('Error loading offer section:', error)
      alert('Chyba při načítání sekce')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/offer-sections/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/offer-sections')
      } else {
        const error = await response.json()
        alert(`Chyba při aktualizaci sekce: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating offer section:', error)
      alert('Chyba při aktualizaci sekce')
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName)
    return iconOption?.component || Lightbulb
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání sekce...</p>
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
              href="/admin/offer-sections"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Zpět na sekce</span>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Upravit sekci nabídky</h1>
          <p className="text-gray-600">Upravte sekci zobrazovanou na hlavní stránce</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Název sekce *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="např. Inspirace"
                />
              </div>

              <div>
                <label htmlFor="href" className="block text-sm font-medium text-gray-700 mb-2">
                  Odkaz *
                </label>
                <input
                  type="text"
                  id="href"
                  required
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="např. /inspirace nebo #zdroje"
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
                placeholder="Popište sekci nabídky..."
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ikona sekce
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {iconOptions.map((option) => {
                  const IconComponent = option.component
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: option.value })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.icon === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-xs text-gray-600">{option.label}</div>
                      </div>
                    </button>
                  )
                })}
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

            {/* Preview */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Náhled</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center space-y-4 max-w-xs mx-auto">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                      {(() => {
                        const IconComponent = getIconComponent(formData.icon)
                        return <IconComponent className="w-8 h-8 text-white" />
                      })()}
                    </div>
                  </div>
                  <h3 className="text-h3 text-text-primary underline decoration-primary-500 decoration-2 underline-offset-4">
                    {formData.title || 'Název sekce'}
                  </h3>
                  <p className="text-p16 text-gray-600">
                    {formData.description || 'Popis sekce'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/admin/offer-sections"
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

