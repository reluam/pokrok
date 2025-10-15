'use client'

import { useState, useEffect } from 'react'
import { DailyStep, Goal } from '@/lib/cesta-db'
import { CheckCircle, Circle, Clock, AlertTriangle, Plus, X, Edit } from 'lucide-react'
import { usePageContext } from '@/components/PageContext'
import { UnifiedStepModal } from '@/components/UnifiedStepModal'
import { useTranslations } from '@/lib/use-translations'

export default function StepsPage() {
  const { setTitle, setSubtitle } = usePageContext()
  const { translations } = useTranslations()
  const [steps, setSteps] = useState<DailyStep[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingStep, setEditingStep] = useState<DailyStep | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (translations) {
      fetchData()
    }
  }, [translations])

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
      setTitle(translations?.app.steps || 'Kroky')
      setSubtitle(`${(stepsData.steps || []).length} ${translations?.app.stepsCount || 'kroků'}`)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepComplete = async (stepId: string) => {
    try {
      const response = await fetch(`/api/cesta/daily-steps/${stepId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      })

      if (response.ok) {
        const data = await response.json()
        setSteps(prev => 
          prev.map(step => 
            step.id === stepId 
              ? { ...step, completed: true, completed_at: new Date() }
              : step
          )
        )
      }
    } catch (error) {
      console.error('Error completing step:', error)
    }
  }

  const handleAddStep = async (stepData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goalId: stepData.goalId,
          title: stepData.title.trim(),
          description: stepData.description.trim(),
          date: stepData.date,
          stepType: 'custom'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSteps(prev => [...prev, result.step])
        setShowAddStepModal(false)
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
        setSteps(prev => 
          prev.map(step => 
            step.id === editingStep.id ? data.step : step
          )
        )
        setEditingStep(null)
      } else {
        console.error('Error saving step:', await response.text())
      }
    } catch (error) {
      console.error('Error saving step:', error)
    } finally {
      setIsSaving(false)
    }
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

  const getToday = () => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }

  const getTodayString = () => {
    const today = getToday()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Categorize steps
  const today = getToday()
  const todaySteps = steps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate.getTime() === today.getTime()
  })

  const futureSteps = steps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate > today
  })

  const overdueSteps = steps.filter(step => {
    if (step.completed) return false
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate < today
  })

  const completedSteps = steps.filter(step => step.completed)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kroky</h1>
            <p className="text-gray-600 mt-2">{translations?.app.manageSteps || 'Spravujte své denní kroky a úkoly'}</p>
          </div>
          <button
            onClick={() => setShowAddStepModal(true)}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{translations?.app.addStep || 'Přidat krok'}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{translations?.app.todaysSteps || 'Dnešní kroky'}</p>
                <p className="text-2xl font-bold text-gray-900">{todaySteps.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{translations?.app.completed || 'Dokončené'}</p>
                <p className="text-2xl font-bold text-gray-900">{completedSteps.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{translations?.app.overdue || 'Zpožděné'}</p>
                <p className="text-2xl font-bold text-gray-900">{overdueSteps.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Circle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{translations?.app.future || 'Budoucí'}</p>
                <p className="text-2xl font-bold text-gray-900">{futureSteps.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Steps */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{translations?.app.todaysSteps || 'Dnešní kroky'}</h2>
            {todaySteps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">{translations?.app.noStepsToday || 'Žádné kroky na dnešek'}</p>
                <p className="text-sm">{translations?.app.addStepsToday || 'Přidejte kroky pro dnešek'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                      step.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-primary-50 border-primary-200'
                    }`}
                    onClick={() => setEditingStep(step)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          step.completed ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h3>
                        {step.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {step.description}
                          </p>
                        )}
                        {step.goal_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            {translations?.app.goal || 'Cíl'}: {goals.find(g => g.id === step.goal_id)?.title || (translations?.app.unassigned || 'Nepřiřazený')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStepComplete(step.id)
                        }}
                        className={`px-3 py-1 rounded-lg text-white text-sm font-medium transition-colors ${
                          step.completed
                            ? 'bg-gray-500 hover:bg-gray-600'
                            : 'bg-primary-500 hover:bg-primary-600'
                        }`}
                      >
                        {step.completed ? (translations?.app.revert || 'Vrátit') : (translations?.app.done || 'Hotovo')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Future Steps */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{translations?.app.futureSteps || 'Budoucí kroky'}</h2>
            {futureSteps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Circle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">{translations?.app.noFutureSteps || 'Žádné budoucí kroky'}</p>
                <p className="text-sm">{translations?.app.addFutureSteps || 'Přidejte kroky pro budoucí dny'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {futureSteps.map((step) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white transition-colors cursor-pointer hover:shadow-md"
                    onClick={() => setEditingStep(step)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Circle className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {step.title}
                        </h3>
                        {step.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {step.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(step.date).toLocaleDateString('cs-CZ')}
                          </span>
                          {step.goal_id && (
                            <span>
                              {translations?.app.goal || 'Cíl'}: {goals.find(g => g.id === step.goal_id)?.title || (translations?.app.unassigned || 'Nepřiřazený')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Steps */}
        {overdueSteps.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{translations?.app.overdueSteps || 'Zpožděné kroky'}</h2>
            <div className="space-y-3">
              {overdueSteps.map((step) => (
                <div
                  key={step.id}
                  className="p-4 rounded-lg border border-red-200 bg-red-50 transition-colors cursor-pointer hover:shadow-md"
                  onClick={() => setEditingStep(step)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-red-800">
                        {step.title}
                      </h3>
                      {step.description && (
                        <p className="text-sm text-red-600 mt-1">
                          {step.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-red-600">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(step.date).toLocaleDateString('cs-CZ')} (zpožděno)
                        </span>
                        {step.goal_id && (
                          <span>
                            {translations?.app.goal || 'Cíl'}: {goals.find(g => g.id === step.goal_id)?.title || (translations?.app.unassigned || 'Nepřiřazený')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStepComplete(step.id)
                      }}
                      className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Hotovo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unified Step Modal */}
      <UnifiedStepModal
        isOpen={showAddStepModal}
        onClose={() => setShowAddStepModal(false)}
        onSave={handleAddStep}
        goals={goals}
        width="medium"
      />

      {/* Step Edit Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{translations?.modals.stepModal.editTitle || 'Upravit krok'}</h3>
              <button
                onClick={() => setEditingStep(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
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
                  placeholder={translations?.modals.stepModal.titlePlaceholder || "Název kroku"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{translations?.modals.stepModal.description || 'Popis'}</label>
                <textarea
                  value={editingStep.description || ''}
                  onChange={(e) => setEditingStep(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder={translations?.modals.stepModal.descriptionPlaceholder || "Popis kroku (volitelné)"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{translations?.modals.stepModal.date || 'Datum'}</label>
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
                      <span>{translations?.common.saving || 'Ukládám...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{translations?.common.save || 'Uložit'}</span>
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
                      <span>{translations?.common.deleting || 'Mažu...'}</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>{translations?.common.delete || 'Smazat'}</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setEditingStep(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {translations?.common.cancel || 'Zrušit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}