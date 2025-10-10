'use client'

import { useState, memo } from 'react'
import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { CheckCircle, Clock, Target, BookOpen, Lightbulb, Calendar, Zap, Footprints, Plus, Circle } from 'lucide-react'

interface WorkspaceTabProps {
  goals: Goal[]
  values: Value[]
  dailySteps: DailyStep[]
  events: Event[]
  selectedStep?: DailyStep | null
  selectedEvent?: Event | null
  onValueUpdate?: (value: Value) => void
  onGoalUpdate?: (goal: Goal) => void
  onStepUpdate?: (step: DailyStep) => void
  onEventComplete?: (eventId: string) => void
  onEventPostpone?: (eventId: string) => void
}

export const WorkspaceTab = memo(function WorkspaceTab({ 
  goals, 
  values, 
  dailySteps, 
  events, 
  selectedStep, 
  selectedEvent, 
  onValueUpdate, 
  onGoalUpdate, 
  onStepUpdate, 
  onEventComplete, 
  onEventPostpone
}: WorkspaceTabProps) {
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepDescription, setNewStepDescription] = useState('')
  const [isAddingStep, setIsAddingStep] = useState(false)

  // Calculate today's date for filtering (local time)
  const getToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  const today = getToday()

  // Get today's steps
  const todaySteps = dailySteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate.getTime() === today.getTime()
  })

  // Sort today's steps: incomplete first, then completed
  const sortedTodaySteps = todaySteps.sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  const handleAddStep = async () => {
    if (!newStepTitle.trim() || isAddingStep) {
      return
    }

    setIsAddingStep(true)
    try {
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newStepTitle.trim(),
          description: newStepDescription.trim() || undefined,
          date: today
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (onStepUpdate) {
          onStepUpdate(data.step)
        }
        setNewStepTitle('')
        setNewStepDescription('')
      }
    } catch (error) {
      console.error('Error adding step:', error)
    } finally {
      setIsAddingStep(false)
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
        if (onStepUpdate) {
          onStepUpdate(data.step)
        }
      }
    } catch (error) {
      console.error('Error completing step:', error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-100">
            <span className="text-lg">📝</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Co je třeba dnes udělat</h2>
            <p className="text-sm text-gray-600">Přidejte kroky pro dnešek</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Add New Step Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Přidat nový krok</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název kroku *
                </label>
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Např. Pravidelně šetřit"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popis (volitelné)
                </label>
                <textarea
                  value={newStepDescription}
                  onChange={(e) => setNewStepDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="Popište krok podrobněji..."
                />
              </div>
              
              <button
                onClick={handleAddStep}
                disabled={!newStepTitle.trim() || isAddingStep}
                className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {isAddingStep ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Přidávám...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Přidat krok</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Today's Steps */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Dnešní kroky ({sortedTodaySteps.filter(s => !s.completed).length} zbývá)
            </h3>
            
            {sortedTodaySteps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Footprints className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">Žádné kroky na dnešek</p>
                <p className="text-sm">Přidejte první krok pomocí formuláře výše.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTodaySteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      step.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleStepComplete(step.id)}
                        className="flex-shrink-0"
                      >
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 hover:text-green-500 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {step.title}
                          </h4>
                        </div>
                        {step.description && (
                          <p className={`text-sm ${step.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {step.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(step.date).toLocaleDateString('cs-CZ')}
                          </span>
                          {step.goal_id && (
                            <span className="flex items-center">
                              <Target className="w-3 h-3 mr-1" />
                              {goals.find(g => g.id === step.goal_id)?.title || 'Nepřiřazený cíl'}
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
      </div>
    </div>
  )
})
