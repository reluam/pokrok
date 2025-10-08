'use client'

import { useState, useEffect, memo } from 'react'
import { Plus, Target, Check, Clock, Calendar } from 'lucide-react'

interface Goal {
  id: string
  title: string
  icon?: string
}

interface NeededStep {
  id: string
  title: string
  goal_id?: string
}

interface NeededStepsWorkspaceProps {
  isActive: boolean
  onSave: (steps: NeededStep[]) => void
  goals: Goal[]
  settings: {
    time_hour: number
    time_minute: number
    days_of_week: number[]
  } | null
}

export const NeededStepsWorkspace = memo(function NeededStepsWorkspace({ 
  isActive, 
  onSave, 
  goals,
  settings
}: NeededStepsWorkspaceProps) {
  const [steps, setSteps] = useState<NeededStep[]>([])
  const [currentStep, setCurrentStep] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')

  useEffect(() => {
    if (isActive) {
      // Reset form when activated
      setSteps([])
      setCurrentStep('')
      setSelectedGoalId('')
    }
  }, [isActive])

  const addStep = () => {
    if (currentStep.trim()) {
      const newStep: NeededStep = {
        id: crypto.randomUUID(),
        title: currentStep.trim(),
        goal_id: selectedGoalId || undefined
      }
      setSteps(prev => [...prev, newStep])
      setCurrentStep('')
      setSelectedGoalId('')
    }
  }

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId))
  }

  const handleSave = () => {
    if (steps.length > 0) {
      onSave(steps)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addStep()
    }
  }

  const getTimeDisplay = () => {
    if (!settings) return '9:00'
    return `${String(settings.time_hour).padStart(2, '0')}:${String(settings.time_minute).padStart(2, '0')}`
  }

  const getDaysDisplay = () => {
    if (!settings) return 'Po-Pá'
    const days = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
    return settings.days_of_week.map(day => days[day - 1]).join(', ')
  }

  console.log('NeededStepsWorkspace render:', { isActive, goals, settings })
  
  if (!isActive) {
    console.log('NeededStepsWorkspace not active, returning null')
    return null
  }

  console.log('NeededStepsWorkspace rendering content')
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Co je třeba dnes udělat?</h2>
            <p className="text-primary-100 text-sm mt-1">abys dosáhl svých cílů...</p>
          </div>
          <div className="text-right text-primary-100 text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{getTimeDisplay()}</span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <Calendar className="w-4 h-4" />
              <span>{getDaysDisplay()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-background p-4 space-y-4">
        {/* Add Step Form */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Přidat krok
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Např. Cvičit 30 minut..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={addStep}
                  disabled={!currentStep.trim()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Přidat</span>
                  <span className="sm:hidden">+</span>
                </button>
              </div>
            </div>

            {/* Goal Selection */}
            {goals.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vázat na cíl (volitelné)
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Žádný cíl</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.icon && `${goal.icon} `}{goal.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Steps List */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Přidané kroky ({steps.length})
            </h3>
            {steps.map((step, index) => (
              <div key={step.id} className="bg-white border-2 border-primary-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{step.title}</p>
                    {step.goal_id && (
                      <p className="text-sm text-gray-500 flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>
                          {goals.find(g => g.id === step.goal_id)?.title}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeStep(step.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {steps.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">Začni přidáváním prvního kroku výše</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
        <button
          onClick={handleSave}
          disabled={steps.length === 0}
          className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>Dokončit nastavení ({steps.length} kroků)</span>
        </button>
      </div>
    </div>
  )
})
