'use client'

import { useState, useEffect } from 'react'
import { Automation, Metric, DailyStep, Goal } from '@/lib/cesta-db'
import { Plus, Settings, Clock, Target, Calendar, Play, Pause, Trash2, Edit, X } from 'lucide-react'
import { usePageContext } from '@/components/PageContext'

export default function AutomatizacePage() {
  const { setTitle, setSubtitle } = usePageContext()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [steps, setSteps] = useState<DailyStep[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    type: 'metric' as 'metric' | 'step',
    target_id: '',
    frequency_type: 'recurring' as 'one-time' | 'recurring',
    frequency_time: '',
    scheduled_date: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [automationsRes, metricsRes, stepsRes, goalsRes] = await Promise.all([
        fetch('/api/cesta/automations'),
        fetch('/api/cesta/metrics'),
        fetch('/api/cesta/daily-steps'),
        fetch('/api/cesta/goals')
      ])

      const [automationsData, metricsData, stepsData, goalsData] = await Promise.all([
        automationsRes.json(),
        metricsRes.json(),
        stepsRes.json(),
        goalsRes.json()
      ])

      setAutomations(automationsData.automations || [])
      setMetrics(metricsData.metrics || [])
      setSteps(stepsData.steps || [])
      setGoals(goalsData.goals || [])
      
      // Update page title and subtitle
      setTitle('Automatizace')
      setSubtitle(`${(automationsData.automations || []).length} automatizací`)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAutomationTarget = (automation: Automation) => {
    if (automation.type === 'metric') {
      const metric = metrics.find(m => m.id === automation.target_id)
      if (metric) {
        const step = steps.find(s => s.id === metric.step_id)
        const goal = goals.find(g => g.id === step?.goal_id)
        return {
          type: 'metric',
          name: metric.name,
          step: step?.title,
          goal: goal?.title
        }
      }
    } else {
      const step = steps.find(s => s.id === automation.target_id)
      const goal = goals.find(g => g.id === step?.goal_id)
      return {
        type: 'step',
        name: step?.title,
        goal: goal?.title
      }
    }
    return null
  }

  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/cesta/automations/${automationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      })

      if (response.ok) {
        setAutomations(prev => 
          prev.map(automation => 
            automation.id === automationId 
              ? { ...automation, is_active: isActive }
              : automation
          )
        )
      }
    } catch (error) {
      console.error('Error toggling automation:', error)
    }
  }

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Opravdu chcete smazat tuto automatizaci?')) return

    try {
      const response = await fetch(`/api/cesta/automations/${automationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAutomations(prev => prev.filter(automation => automation.id !== automationId))
      }
    } catch (error) {
      console.error('Error deleting automation:', error)
    }
  }

  const handleCreateAutomation = async () => {
    if (!newAutomation.name || !newAutomation.target_id) {
      alert('Vyplňte název a vyberte cíl')
      return
    }

    if (newAutomation.frequency_type === 'recurring' && !newAutomation.frequency_time) {
      alert('Vyplňte frekvenci pro opakovanou automatizaci')
      return
    }

    if (newAutomation.frequency_type === 'one-time' && !newAutomation.scheduled_date) {
      alert('Vyplňte datum pro jednorázovou automatizaci')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/cesta/automations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAutomation.name,
          description: newAutomation.description,
          type: newAutomation.type,
          target_id: newAutomation.target_id,
          frequency_type: newAutomation.frequency_type,
          frequency_time: newAutomation.frequency_time || null,
          scheduled_date: newAutomation.scheduled_date || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAutomations(prev => [...prev, data.automation])
        setShowCreateModal(false)
        setNewAutomation({
          name: '',
          description: '',
          type: 'metric',
          target_id: '',
          frequency_type: 'recurring',
          frequency_time: '',
          scheduled_date: ''
        })
      } else {
        const error = await response.json()
        alert(`Chyba při vytváření automatizace: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating automation:', error)
      alert('Chyba při vytváření automatizace')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám automatizace...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Automatizace</h1>
              <p className="text-gray-600 mt-2">Spravujte automatické připomínky a akce</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Přidat automatizaci</span>
            </button>
          </div>
        </div>

        {/* Automations List */}
        <div className="space-y-6">
          {automations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné automatizace</h3>
              <p className="text-gray-500 mb-4">Začněte vytvořením první automatizace</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Vytvořit automatizaci
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automations.map((automation) => {
                const target = getAutomationTarget(automation)
                
                return (
                  <div
                    key={automation.id}
                    className={`bg-white rounded-lg shadow-sm border p-6 ${
                      automation.is_active ? 'border-green-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {automation.name}
                        </h3>
                        {automation.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {automation.description}
                          </p>
                        )}
                        {target && (
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>
                                {target.type === 'metric' ? 'Metrika' : 'Krok'}: {target.name}
                              </span>
                            </div>
                            {target.goal && (
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="text-xs">Cíl: {target.goal}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleAutomation(automation.id, !automation.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            automation.is_active
                              ? 'text-green-600 bg-green-100 hover:bg-green-200'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={automation.is_active ? 'Deaktivovat' : 'Aktivovat'}
                        >
                          {automation.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAutomation(automation.id)}
                          className="p-2 text-red-400 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {automation.frequency_type === 'one-time' ? 'Jednorázová' : 'Opakovaná'}
                        </span>
                      </div>
                      
                      {automation.frequency_type === 'one-time' && automation.scheduled_date && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(automation.scheduled_date).toLocaleDateString('cs-CZ')} {new Date(automation.scheduled_date).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      
                      {automation.frequency_type === 'recurring' && automation.frequency_time && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{automation.frequency_time}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          automation.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {automation.is_active ? 'Aktivní' : 'Neaktivní'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Vytvořeno: {new Date(automation.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create Automation Modal */}
        {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nová automatizace</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název automatizace *
                  </label>
                  <input
                    type="text"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Např. Připomínka k šetření"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Popis
                  </label>
                  <textarea
                    value={newAutomation.description}
                    onChange={(e) => setNewAutomation({...newAutomation, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Popis automatizace (volitelné)"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ automatizace *
                  </label>
                  <select
                    value={newAutomation.type}
                    onChange={(e) => setNewAutomation({...newAutomation, type: e.target.value as 'metric' | 'step', target_id: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="metric">Pro metriku</option>
                    <option value="step">Pro krok</option>
                  </select>
                </div>

                {/* Target Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newAutomation.type === 'metric' ? 'Metrika' : 'Krok'} *
                  </label>
                  <select
                    value={newAutomation.target_id}
                    onChange={(e) => setNewAutomation({...newAutomation, target_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Vyberte {newAutomation.type === 'metric' ? 'metriku' : 'krok'}</option>
                    {newAutomation.type === 'metric' ? (
                      metrics.map(metric => {
                        const step = steps.find(s => s.id === metric.step_id)
                        const goal = goals.find(g => g.id === step?.goal_id)
                        return (
                          <option key={metric.id} value={metric.id}>
                            {metric.name} ({step?.title} - {goal?.title})
                          </option>
                        )
                      })
                    ) : (
                      steps.map(step => {
                        const goal = goals.find(g => g.id === step.goal_id)
                        return (
                          <option key={step.id} value={step.id}>
                            {step.title} ({goal?.title})
                          </option>
                        )
                      })
                    )}
                  </select>
                </div>

                {/* Frequency Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ frekvence *
                  </label>
                  <select
                    value={newAutomation.frequency_type}
                    onChange={(e) => setNewAutomation({...newAutomation, frequency_type: e.target.value as 'one-time' | 'recurring'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="recurring">Opakovaná</option>
                    <option value="one-time">Jednorázová</option>
                  </select>
                </div>

                {/* Frequency Time (for recurring) */}
                {newAutomation.frequency_type === 'recurring' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frekvence *
                    </label>
                    <input
                      type="text"
                      value={newAutomation.frequency_time}
                      onChange={(e) => setNewAutomation({...newAutomation, frequency_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Např. Každý den ve 20:00, Každou první neděli v měsíci"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Použijte přirozený jazyk pro popis frekvence
                    </p>
                  </div>
                )}

                {/* Scheduled Date (for one-time) */}
                {newAutomation.frequency_type === 'one-time' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datum a čas *
                    </label>
                    <input
                      type="datetime-local"
                      value={newAutomation.scheduled_date}
                      onChange={(e) => setNewAutomation({...newAutomation, scheduled_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleCreateAutomation}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Vytváření...' : 'Vytvořit'}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    )
  }
