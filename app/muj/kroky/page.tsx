'use client'

import { useState, useEffect } from 'react'
import { DailyStep, Goal } from '@/lib/cesta-db'
import { CheckCircle, Circle, Clock, AlertTriangle, Plus, X, Edit } from 'lucide-react'
import { usePageContext } from '@/components/PageContext'

export default function StepsPage() {
  const { setTitle, setSubtitle } = usePageContext()
  const [steps, setSteps] = useState<DailyStep[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newStep, setNewStep] = useState({
    goalId: '',
    title: '',
    description: ''
  })
  const [editingStep, setEditingStep] = useState<DailyStep | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [stepsRes, goalsRes] = await Promise.all([
        fetch('/api/cesta/daily-steps'),
        fetch('/api/cesta/goals')
      ])

      const [stepsData, goalsData] = await Promise.all([
        stepsRes.json(),
        goalsRes.json()
      ])

      setSteps(stepsData.steps || [])
      setGoals(goalsData.goals || [])
      
      // Set page title and subtitle
      setTitle('Kroky')
      setSubtitle(`${(stepsData.steps || []).length} kroků`)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepComplete = async (stepId: string) => {
    try {
      const response = await fetch(`/api/cesta/daily-steps/${stepId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Chyba při dokončování kroku: ${error.error || 'Neznámá chyba'}`)
        return
      }

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error completing step:', error)
      alert('Chyba při dokončování kroku')
    }
  }

  const handleStepEdit = (step: DailyStep) => {
    setEditingStep({ ...step })
  }

  const handleStepDelete = async () => {
    if (!editingStep || !confirm('Opravdu chcete smazat tento krok?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/cesta/daily-steps/${editingStep.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSteps(prev => prev.filter(step => step.id !== editingStep.id))
        setEditingStep(null)
        // Refresh data to ensure UI is updated
        await fetchData()
      } else {
        console.error('Error deleting step:', await response.text())
        alert('Chyba při mazání kroku')
      }
    } catch (error) {
      console.error('Error deleting step:', error)
      alert('Chyba při mazání kroku')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStepSave = async () => {
    if (!editingStep || isSaving) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/cesta/daily-steps/${editingStep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingStep.title,
          description: editingStep.description,
          date: editingStep.date
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSteps(prev => prev.map(step => step.id === editingStep.id ? data.step : step))
        setEditingStep(null)
      } else {
        console.error('Error saving step:', await response.text())
        alert('Chyba při ukládání kroku')
      }
    } catch (error) {
      console.error('Error saving step:', error)
      alert('Chyba při ukládání kroku')
    } finally {
      setIsSaving(false)
    }
  }

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    return goal?.title || 'Neznámý cíl'
  }

  const getGoalColor = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return 'bg-gray-100'
    
    switch (goal.status) {
      case 'completed': return 'bg-green-100 border-green-200'
      case 'active': return 'bg-orange-100 border-orange-200'
      default: return 'bg-gray-100 border-gray-200'
    }
  }

  // Function to get today's date string
  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Function to get today's date object
  const getToday = () => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!newStep.goalId || !newStep.title) {
        alert('Prosím vyplňte všechna povinná pole')
        return
      }

      const response = await fetch('/api/cesta/daily-steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId: newStep.goalId,
          title: newStep.title.trim(),
          description: newStep.description.trim(),
          date: getTodayString(),
          stepType: 'custom'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSteps(prev => [...prev, result.step])
        setNewStep({
          goalId: '',
          title: '',
          description: ''
        })
        setShowAddForm(false)
      } else {
        const error = await response.json()
        alert(`Chyba při vytváření kroku: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error adding step:', error)
      alert('Chyba při vytváření kroku')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Categorize steps
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const pendingSteps = steps.filter(step => !step.completed)
  const completedSteps = steps.filter(step => step.completed)
  
  // Overdue steps: not completed and date is before today
  const overdueSteps = pendingSteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate < today
  })
  
  // Current pending steps: not completed and date is today or future
  const currentPendingSteps = pendingSteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate >= today
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám kroky...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Add Step Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Přidat nový krok</span>
          </button>
        </div>

      {/* Add Step Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Přidat nový krok</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddStep} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cíl *
                  </label>
                  <select
                    value={newStep.goalId}
                    onChange={(e) => setNewStep(prev => ({ ...prev, goalId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Vyberte cíl</option>
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název kroku *
                  </label>
                  <input
                    type="text"
                    value={newStep.title}
                    onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Např. Přečíst 10 stránek"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popis (volitelné)
                  </label>
                  <textarea
                    value={newStep.description}
                    onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Dodatečné informace..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? 'Přidávám...' : 'Přidat krok'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Zrušit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overdue Steps */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="p-6 border-b border-red-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Zpožděné kroky
                </h2>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                  {overdueSteps.length}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {overdueSteps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Žádné zpožděné kroky</p>
                  <p className="text-sm text-gray-400 mt-2">Výborně! Jste v termínu</p>
                </div>
              ) : (
                overdueSteps.map((step) => {
                  const stepDate = new Date(step.date)
                  const daysOverdue = Math.floor((today.getTime() - stepDate.getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg border-2 bg-red-50 border-red-200 hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => handleStepEdit(step)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                          
                          {/* Step Type and Frequency Info */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              step.step_type === 'update' ? 'bg-blue-100 text-blue-800' :
                              step.step_type === 'revision' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {step.step_type === 'update' ? 'Update' :
                               step.step_type === 'revision' ? 'Revize' :
                               step.custom_type_name || 'Vlastní'}
                            </span>
                            
                          </div>
                          
                          {step.description && (
                            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          )}
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>🎯 {getGoalTitle(step.goal_id)}</span>
                            <span>•</span>
                            <span className="text-red-600 font-medium">
                              {daysOverdue === 0 ? 'Dnes' : `${daysOverdue} dní zpožděno`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStepComplete(step.id)
                            }}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Hotovo
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Current Pending Steps */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Circle className="w-5 h-5 mr-2 text-orange-500" />
                  Čekající kroky
                </h2>
                <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                  {currentPendingSteps.length}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {currentPendingSteps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Circle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Žádné čekající kroky</p>
                </div>
              ) : (
                currentPendingSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border-2 ${getGoalColor(step.goal_id)} hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => handleStepEdit(step)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                        
                        {/* Step Type and Frequency Info */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            step.step_type === 'update' ? 'bg-blue-100 text-blue-800' :
                            step.step_type === 'revision' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {step.step_type === 'update' ? 'Update' :
                             step.step_type === 'revision' ? 'Revize' :
                             step.custom_type_name || 'Vlastní'}
                          </span>
                          
                        </div>
                        
                        {step.description && (
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>🎯 {getGoalTitle(step.goal_id)}</span>
                          <span>•</span>
                          <span>{new Date(step.date).toLocaleDateString('cs-CZ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStepComplete(step.id)
                          }}
                          className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Hotovo
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Steps */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Dokončené kroky
                </h2>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {completedSteps.length}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {completedSteps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Žádné dokončené kroky</p>
                </div>
              ) : (
                completedSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border-2 ${getGoalColor(step.goal_id)} opacity-75`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1 line-through">{step.title}</h3>
                        
                        {/* Step Type and Frequency Info */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            step.step_type === 'update' ? 'bg-blue-100 text-blue-800' :
                            step.step_type === 'revision' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {step.step_type === 'update' ? 'Update' :
                             step.step_type === 'revision' ? 'Revize' :
                             step.custom_type_name || 'Vlastní'}
                          </span>
                          
                        </div>
                        
                        {step.description && (
                          <p className="text-sm text-gray-600 mb-2 line-through">{step.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>🎯 {getGoalTitle(step.goal_id)}</span>
                          <span>•</span>
                          <span>{new Date(step.date).toLocaleDateString('cs-CZ')}</span>
                          {step.completed_at && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">Dokončeno {new Date(step.completed_at).toLocaleDateString('cs-CZ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 ml-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step Edit Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upravit krok</h3>
              <button
                onClick={() => setEditingStep(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              handleStepSave()
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
                <input
                  type="text"
                  value={editingStep.title}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Název kroku"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                <textarea
                  value={editingStep.description || ''}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Popis kroku (volitelné)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Datum</label>
                <input
                  type="date"
                  value={new Date(editingStep.date).toISOString().split('T')[0]}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, date: new Date(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {editingStep.goal_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cíl</label>
                  <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    {goals.find(g => g.id === editingStep.goal_id)?.title || 'Nepřiřazený cíl'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-2">
                <div className="flex items-center space-x-2">
                  {editingStep.completed ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">Dokončeno</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-5 h-5 text-gray-300" />
                      <span className="text-gray-600">Nedokončeno</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Ukládám...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Uložit</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleStepDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Mažu...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Smazat</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setEditingStep(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
