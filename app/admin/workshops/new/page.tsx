'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Workshop } from '@/lib/admin-types'

const colorOptions = [
  { name: 'Modrá', value: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500' },
  { name: 'Zelená', value: 'bg-green-500', text: 'text-green-700', border: 'border-green-500' },
  { name: 'Fialová', value: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500' },
  { name: 'Růžová', value: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-500' },
  { name: 'Oranžová', value: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500' },
  { name: 'Červená', value: 'bg-red-500', text: 'text-red-700', border: 'border-red-500' },
  { name: 'Primární', value: 'bg-primary-500', text: 'text-primary-700', border: 'border-primary-500' },
]

export default function NewWorkshopPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [features, setFeatures] = useState<string[]>([''])
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    duration: '',
    color: 'bg-primary-500',
    textColor: 'text-primary-700',
    borderColor: 'border-primary-500',
    headerTextColor: '',
    enabled: true,
    order: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const workshopData: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        features: features.filter(f => f.trim() !== '')
      }

      const response = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workshopData)
      })

      if (response.ok) {
        router.push('/admin/workshops')
      } else {
        console.error('Failed to create workshop')
      }
    } catch (error) {
      console.error('Error creating workshop:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFeature = () => {
    setFeatures([...features, ''])
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const handleColorChange = (colorOption: typeof colorOptions[0]) => {
    setFormData({
      ...formData,
      color: colorOption.value,
      textColor: colorOption.text,
      borderColor: colorOption.border
    })
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/admin/workshops"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-h2 text-text-primary font-poppins">Nový workshop</h1>
            <p className="text-asul16 text-gray-600 mt-1">Vytvořte nový workshop</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název workshopu *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Název workshopu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Podtitul
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Podtitul workshopu"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Popis *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Popis workshopu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cena *
              </label>
              <input
                type="text"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="např. 2000 Kč"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doba trvání *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="např. 4 hodiny"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pořadí
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barva
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleColorChange(option)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.color === option.value
                        ? 'border-gray-900 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-6 rounded ${option.value}`}></div>
                    <span className="text-xs mt-1 block">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vlastnosti workshopu
              </label>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Vlastnost workshopu"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Přidat vlastnost</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Aktivní workshop</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/admin/workshops"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Zrušit
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ukládám...' : 'Vytvořit workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


