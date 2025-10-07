'use client'

import { useState, useEffect } from 'react'
import { DailyStep, Goal } from '@/lib/cesta-db'
import { CheckCircle, Circle, Clock, AlertTriangle, Plus, X } from 'lucide-react'
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
    description: '',
    stepType: 'update' as 'update' | 'revision' | 'custom',
    customTypeName: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    frequencyTime: ''
  })

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
        method: 'POST'
      })

      if (response.ok) {
        setSteps(prev => prev.map(step => 
          step.id === stepId 
            ? { ...step, completed: true, completed_at: new Date() }
            : step
        ))
      }
    } catch (error) {
      console.error('Error completing step:', error)
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
          isImportant: false, // Always false for automated steps
          isUrgent: false, // Always false for automated steps
          stepType: newStep.stepType,
          customTypeName: newStep.stepType === 'custom' ? newStep.customTypeName : undefined,
          frequency: newStep.frequency,
          frequencyTime: newStep.frequencyTime
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSteps(prev => [...prev, result.step])
        setNewStep({
          goalId: '',
          title: '',
          description: '',
          stepType: 'update',
          customTypeName: '',
          frequency: 'daily',
          frequencyTime: ''
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Typ kroku
                  </label>
                  <select
                    value={newStep.stepType}
                    onChange={(e) => setNewStep(prev => ({ ...prev, stepType: e.target.value as 'update' | 'revision' | 'custom' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="update">Update</option>
                    <option value="revision">Revize</option>
                    <option value="custom">Vlastní</option>
                  </select>
                </div>

                {newStep.stepType === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Název vlastního typu
                    </label>
                    <input
                      type="text"
                      value={newStep.customTypeName}
                      onChange={(e) => setNewStep(prev => ({ ...prev, customTypeName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Např. Meditace, Cvičení"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frekvence
                  </label>
                  <select
                    value={newStep.frequency}
                    onChange={(e) => setNewStep(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="daily">Jednou denně</option>
                    <option value="weekly">Jednou týdně</option>
                    <option value="monthly">Jednou měsíčně</option>
                  </select>
                </div>

                {(newStep.frequency === 'weekly' || newStep.frequency === 'monthly') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Čas frekvence (volitelné)
                    </label>
                    <input
                      type="text"
                      value={newStep.frequencyTime}
                      onChange={(e) => setNewStep(prev => ({ ...prev, frequencyTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={newStep.frequency === 'weekly' ? 'Např. Pondělí 10:00' : 'Např. 1. den v měsíci 09:00'}
                    />
                  </div>
                )}

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
                      onClick={() => handleStepComplete(step.id)}
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
                        <button className="ml-4 p-2 hover:bg-white/50 rounded-full transition-colors">
                          <Circle className="w-5 h-5 text-red-400" />
                        </button>
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
                    onClick={() => handleStepComplete(step.id)}
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
                      <button className="ml-4 p-2 hover:bg-white/50 rounded-full transition-colors">
                        <Circle className="w-5 h-5 text-gray-400" />
                      </button>
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
    </div>
  )
}
