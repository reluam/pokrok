'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import { Workshop } from '@/lib/admin-types'
import AdminLayout from '@/components/AdminLayout'

function WorkshopsContent() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkshops()
  }, [])

  const loadWorkshops = async () => {
    try {
      const response = await fetch('/api/admin/workshops')
      if (response.ok) {
        const data = await response.json()
        const workshopsWithParsedFeatures = data.map((workshop: any) => ({
          ...workshop,
          features: typeof workshop.features === 'string' ? JSON.parse(workshop.features) : workshop.features,
          enabled: Boolean(workshop.enabled)
        }))
        setWorkshops(workshopsWithParsedFeatures)
      }
    } catch (error) {
      console.error('Error loading workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const workshop = workshops.find(w => w.id === id)
      if (!workshop) return

      const response = await fetch(`/api/admin/workshops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workshop, enabled })
      })

      if (response.ok) {
        loadWorkshops()
      }
    } catch (error) {
      console.error('Error toggling workshop:', error)
    }
  }

  const deleteWorkshop = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento workshop?')) return

    try {
      const response = await fetch(`/api/admin/workshops/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadWorkshops()
      }
    } catch (error) {
      console.error('Error deleting workshop:', error)
    }
  }

  const moveWorkshop = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = workshops.findIndex(w => w.id === id)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= workshops.length) return

    const updatedWorkshops = [...workshops]
    const [movedWorkshop] = updatedWorkshops.splice(currentIndex, 1)
    updatedWorkshops.splice(newIndex, 0, movedWorkshop)

    // Update order values
    const workshopsWithNewOrder = updatedWorkshops.map((workshop, index) => ({
      ...workshop,
      order: index + 1
    }))

    try {
      // Update all workshops with new order
      await Promise.all(
        workshopsWithNewOrder.map(workshop =>
          fetch(`/api/admin/workshops/${workshop.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workshop)
          })
        )
      )
      
      loadWorkshops()
    } catch (error) {
      console.error('Error reordering workshops:', error)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/admin/workshops/new"
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nový workshop</span>
        </Link>
      </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {workshops.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné workshopy</h3>
              <p className="text-gray-600 mb-4">Začněte vytvořením prvního workshopu</p>
              <Link
                href="/admin/workshops/new"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Vytvořit workshop</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Workshop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doba trvání
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
                  {workshops.map((workshop, index) => (
                    <tr key={workshop.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{workshop.title}</div>
                          <div className="text-sm text-gray-500">{workshop.subtitle}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {workshop.price}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {workshop.duration}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleEnabled(workshop.id, !workshop.enabled)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            workshop.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {workshop.enabled ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Aktivní
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Neaktivní
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => moveWorkshop(workshop.id, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:text-primary-600'
                            }`}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-500 min-w-[2rem] text-center">
                            {workshop.order}
                          </span>
                          <button
                            onClick={() => moveWorkshop(workshop.id, 'down')}
                            disabled={index === workshops.length - 1}
                            className={`p-1 rounded ${
                              index === workshops.length - 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:text-primary-600'
                            }`}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/workshops/edit/${workshop.id}`}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteWorkshop(workshop.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
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
    </div>
  )
}

export default function WorkshopsPage() {
  return (
    <AdminLayout title="Workshopy" description="Spravujte workshopy a jejich obsah">
      <WorkshopsContent />
    </AdminLayout>
  )
}
