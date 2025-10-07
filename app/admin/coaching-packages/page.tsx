'use client'

import { useState, useEffect } from 'react'
import { CoachingPackage } from '@/lib/admin-types'
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

function CoachingPackagesContent() {
  const [packages, setPackages] = useState<CoachingPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      const response = await fetch('/api/admin/coaching-packages')
      if (response.ok) {
        const allPackages = await response.json()
        setPackages(allPackages)
      } else {
        console.error('Failed to load coaching packages')
      }
    } catch (error) {
      console.error('Error loading coaching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat tento koučovací balíček?')) {
      try {
        const response = await fetch(`/api/admin/coaching-packages/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setPackages(packages.filter(pkg => pkg.id !== id))
        } else {
          alert('Chyba při mazání balíčku')
        }
      } catch (error) {
        console.error('Error deleting coaching package:', error)
        alert('Chyba při mazání balíčku')
      }
    }
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/coaching-packages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !enabled })
      })
      
      if (response.ok) {
        const updatedPackage = await response.json()
        setPackages(packages.map(pkg => 
          pkg.id === id ? updatedPackage : pkg
        ))
      } else {
        alert('Chyba při změně stavu balíčku')
      }
    } catch (error) {
      console.error('Error toggling package status:', error)
      alert('Chyba při změně stavu balíčku')
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání koučovacích balíčků...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/admin/coaching-packages/new"
          className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors flex items-center space-x-2 shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nový balíček</span>
        </Link>
      </div>

        {/* Packages List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-primary-100">
          {packages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
              </div>
              <p className="text-gray-500 mb-4 font-asul">Zatím žádné koučovací balíčky</p>
              <Link
                href="/admin/coaching-packages/new"
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Vytvořte první balíček</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balíček
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena & Doba trvání
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
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {pkg.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pkg.subtitle}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                            {pkg.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.price}</div>
                        <div className="text-sm text-gray-500">{pkg.duration}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleEnabled(pkg.id, pkg.enabled)}
                          className="flex items-center space-x-2"
                        >
                          {pkg.enabled ? (
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
                        {pkg.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/rezervace/${pkg.id}`}
                            className="text-gray-400 hover:text-gray-600"
                            title="Zobrazit"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/coaching-packages/edit/${pkg.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Upravit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Smazat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Informace o koučovacích balíčcích</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Balíčky se zobrazují na stránce rezervací v pořadí podle čísla pořadí</p>
            <p>• Pouze aktivní balíčky jsou viditelné pro návštěvníky</p>
            <p>• Můžete mít minimálně 2 a maximálně 5 aktivních balíčků současně</p>
            <p>• Pokud máte více než 3 balíčky, návštěvníci budou moci procházet pomocí šipek</p>
          </div>
        </div>
    </div>
  )
}

export default function CoachingPackagesPage() {
  return (
    <AdminLayout title="Koučovací balíčky" description="Spravujte koučovací služby a balíčky">
      <CoachingPackagesContent />
    </AdminLayout>
  )
}

