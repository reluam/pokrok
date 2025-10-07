'use client'

import { useState, useEffect } from 'react'
import { OfferSection } from '@/lib/admin-types'
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Lightbulb, Flag, MessageCircle, Target, Users, Star, Heart, Zap } from 'lucide-react'
import Link from 'next/link'
import AdminDatabaseBanner from '@/components/AdminDatabaseBanner'
import AdminLayout from '@/components/AdminLayout'

const iconMap = {
  Lightbulb,
  Flag,
  MessageCircle,
  Target,
  Users,
  Star,
  Heart,
  Zap
}

function OfferSectionsContent() {
  const [sections, setSections] = useState<OfferSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      const response = await fetch('/api/admin/offer-sections')
      if (response.ok) {
        const allSections = await response.json()
        setSections(allSections)
      } else {
        console.error('Failed to load offer sections')
      }
    } catch (error) {
      console.error('Error loading offer sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat tuto sekci nabídky?')) {
      try {
        const response = await fetch(`/api/admin/offer-sections/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setSections(sections.filter(section => section.id !== id))
        } else {
          alert('Chyba při mazání sekce')
        }
      } catch (error) {
        console.error('Error deleting offer section:', error)
        alert('Chyba při mazání sekce')
      }
    }
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/offer-sections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !enabled })
      })
      
      if (response.ok) {
        const updatedSection = await response.json()
        setSections(sections.map(section => 
          section.id === id ? updatedSection : section
        ))
      } else {
        alert('Chyba při změně stavu sekce')
      }
    } catch (error) {
      console.error('Error toggling section status:', error)
      alert('Chyba při změně stavu sekce')
    }
  }


  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent || Lightbulb
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání sekcí nabídky...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/admin/offer-sections/new"
          className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nová sekce</span>
        </Link>
      </div>

      <AdminDatabaseBanner />

        {/* Sections List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-primary-100">
          {sections.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">#</span>
                </div>
              </div>
              <p className="text-gray-500 mb-4 font-asul">Zatím žádné sekce nabídky</p>
              <Link
                href="/admin/offer-sections/new"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Vytvořte první sekci
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sekce
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Odkaz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stav
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pořadí
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akce
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sections.map((section) => {
                    const IconComponent = getIconComponent(section.icon)
                    return (
                      <tr key={section.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-4">
                              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text-primary">
                                {section.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {section.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{section.href}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleEnabled(section.id, section.enabled)}
                            className="flex items-center space-x-2"
                          >
                            {section.enabled ? (
                              <>
                                <ToggleRight className="w-6 h-6 text-green-500" />
                                <span className="text-sm text-green-600">Aktivní</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-6 h-6 text-gray-400" />
                                <span className="text-sm text-gray-500">Neaktivní</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {section.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={section.href}
                              className="text-gray-400 hover:text-gray-600"
                              title="Zobrazit"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/offer-sections/edit/${section.id}`}
                              className="text-primary-600 hover:text-primary-900"
                              title="Upravit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(section.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Smazat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-purple-900 mb-2">Informace o sekcích nabídky</h3>
          <div className="text-sm text-purple-800 space-y-2">
            <p>• Sekce se zobrazují na hlavní stránce v pořadí podle čísla pořadí</p>
            <p>• Pouze aktivní sekce jsou viditelné pro návštěvníky</p>
            <p>• Musíte mít minimálně 2 a maximálně 5 aktivních sekcí současně</p>
            <p>• Pokud máte více než 3 sekce, návštěvníci budou moci procházet pomocí šipek</p>
            <p>• Standardní sekce: Inspirace (/inspirace), Zdroje (#zdroje), Koučing (/koucink)</p>
          </div>
        </div>
    </div>
  )
}

export default function OfferSectionsPage() {
  return (
    <AdminLayout title="Nabídka služeb" description="Spravujte sekce nabídky zobrazované na hlavní stránce">
      <OfferSectionsContent />
    </AdminLayout>
  )
}

