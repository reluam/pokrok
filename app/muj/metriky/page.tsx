'use client'

import { useState, useEffect } from 'react'
import { Metric, DailyStep, Goal } from '@/lib/cesta-db'
import { Plus, Target, Settings, Trash2, Edit, BarChart3, X } from 'lucide-react'
import { usePageContext } from '@/components/PageContext'

export default function MetrikyPage() {
  const { setTitle, setSubtitle } = usePageContext()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [steps, setSteps] = useState<DailyStep[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [metricsRes, stepsRes, goalsRes] = await Promise.all([
        fetch('/api/cesta/metrics'),
        fetch('/api/cesta/daily-steps'),
        fetch('/api/cesta/goals')
      ])

      const [metricsData, stepsData, goalsData] = await Promise.all([
        metricsRes.json(),
        stepsRes.json(),
        goalsRes.json()
      ])

      setMetrics(metricsData.metrics || [])
      setSteps(stepsData.steps || [])
      setGoals(goalsData.goals || [])
      
      // Update page title and subtitle
      setTitle('Metriky')
      setSubtitle(`${(metricsData.metrics || []).length} metrik`)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMetricStep = (metric: Metric) => {
    const step = steps.find(s => s.id === metric.step_id)
    const goal = goals.find(g => g.id === step?.goal_id)
    return { step, goal }
  }

  const handleDeleteMetric = async (metricId: string) => {
    if (!confirm('Opravdu chcete smazat tuto metriku?')) return

    try {
      const response = await fetch(`/api/cesta/metrics/${metricId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMetrics(prev => prev.filter(metric => metric.id !== metricId))
      }
    } catch (error) {
      console.error('Error deleting metric:', error)
    }
  }

  const handleCreateMetric = async (metricData: Partial<Metric>) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/cesta/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData)
      })

      if (response.ok) {
        const data = await response.json()
        setMetrics(prev => [...prev, data.metric])
        setShowCreateModal(false)
        setEditingMetric(null)
      } else {
        const error = await response.json()
        alert(`Chyba při vytváření metriky: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating metric:', error)
      alert('Chyba při vytváření metriky')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateMetric = async (metricId: string, metricData: Partial<Metric>) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/cesta/metrics/${metricId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData)
      })

      if (response.ok) {
        const data = await response.json()
        setMetrics(prev => prev.map(metric => 
          metric.id === metricId ? data.metric : metric
        ))
        setEditingMetric(null)
      } else {
        const error = await response.json()
        alert(`Chyba při aktualizaci metriky: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating metric:', error)
      alert('Chyba při aktualizaci metriky')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám metriky...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Metriky</h1>
            <p className="text-gray-600 mt-2">Spravujte metriky pro měření pokroku kroků</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Přidat metriku</span>
          </button>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-6">
        {metrics.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné metriky</h3>
            <p className="text-gray-500 mb-4">Začněte vytvořením první metriky</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Vytvořit metriku
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => {
              const { step, goal } = getMetricStep(metric)
              const progressPercentage = metric.target_value > 0 
                ? Math.min(100, Math.round((metric.current_value / metric.target_value) * 100))
                : 0

              return (
                <div
                  key={metric.id}
                  className="bg-white rounded-lg shadow-sm border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {metric.name}
                      </h3>
                      {metric.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {metric.description}
                        </p>
                      )}
                      {step && goal && (
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>Krok: {step.title}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs">Cíl: {goal.title}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingMetric(metric)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Upravit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMetric(metric.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Smazat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Pokrok</span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Values */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {metric.current_value} / {metric.target_value} {metric.unit}
                      </span>
                      <span className="text-gray-500">
                        Zbývá: {Math.max(0, metric.target_value - metric.current_value)} {metric.unit}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Vytvořeno: {new Date(metric.created_at).toLocaleDateString('cs-CZ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        Aktualizováno: {new Date(metric.updated_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Metric Modal */}
      {(showCreateModal || editingMetric) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingMetric ? 'Upravit metriku' : 'Nová metrika'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingMetric(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název metriky *
                  </label>
                  <input
                    type="text"
                    value={editingMetric?.name || ''}
                    onChange={(e) => setEditingMetric(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Např. Ušetřená částka"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Popis
                  </label>
                  <textarea
                    value={editingMetric?.description || ''}
                    onChange={(e) => setEditingMetric(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Popis metriky (volitelné)"
                  />
                </div>

                {/* Step Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Krok *
                  </label>
                  <select
                    value={editingMetric?.step_id || ''}
                    onChange={(e) => setEditingMetric(prev => prev ? {...prev, step_id: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Vyberte krok</option>
                    {steps.map(step => {
                      const goal = goals.find(g => g.id === step.goal_id)
                      return (
                        <option key={step.id} value={step.id}>
                          {step.title} ({goal?.title})
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Target Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cílová hodnota *
                  </label>
                  <input
                    type="number"
                    value={editingMetric?.target_value || ''}
                    onChange={(e) => setEditingMetric(prev => prev ? {...prev, target_value: parseFloat(e.target.value) || 0} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                {/* Current Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aktuální hodnota
                  </label>
                  <input
                    type="number"
                    value={editingMetric?.current_value || ''}
                    onChange={(e) => setEditingMetric(prev => prev ? {...prev, current_value: parseFloat(e.target.value) || 0} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jednotka *
                  </label>
                  <input
                    type="text"
                    value={editingMetric?.unit || ''}
                    onChange={(e) => setEditingMetric(prev => prev ? {...prev, unit: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Kč, km, kg, atd."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingMetric(null)
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={() => {
                    if (editingMetric) {
                      handleUpdateMetric(editingMetric.id, editingMetric)
                    } else {
                      handleCreateMetric(editingMetric || {})
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Ukládání...' : (editingMetric ? 'Uložit' : 'Vytvořit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
