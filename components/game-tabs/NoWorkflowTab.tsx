'use client'

import { useState, useEffect, memo } from 'react'
import { CheckCircle, Circle, Plus, Calendar, Clock, Target } from 'lucide-react'
import { usePageContext } from '../PageContext'
import { useTranslations } from '@/lib/use-translations'
import { DailyStep, Goal } from '@/lib/cesta-db'
import { UnifiedStepModal } from '../UnifiedStepModal'

interface NoWorkflowTabProps {}

export const NoWorkflowTab = memo(function NoWorkflowTab({}: NoWorkflowTabProps = {}) {
  const { setTitle, setSubtitle } = usePageContext()
  const { translations } = useTranslations()
  const [isLoading, setIsLoading] = useState(true)
  const [dailySteps, setDailySteps] = useState<DailyStep[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [selectedStepForDetails, setSelectedStepForDetails] = useState<DailyStep | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    if (translations) {
      setTitle(translations.workspace.title)
      setSubtitle(translations.workspace.subtitle)
      fetchData()
    }
  }, [translations, setTitle, setSubtitle])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [stepsRes, goalsRes] = await Promise.all([
        fetch('/api/cesta/daily-steps'),
        fetch('/api/cesta/goals')
      ])

      if (stepsRes.ok) {
        const stepsData = await stepsRes.json()
        setDailySteps(stepsData.steps || [])
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        setGoals(goalsData.goals || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStep = async (stepData: any) => {
    try {
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setDailySteps(prev => [...prev, result.step])
        setShowAddStepModal(false)
      }
    } catch (error) {
      console.error('Error adding step:', error)
    }
  }

  const handleStepComplete = async (stepId: string) => {
    try {
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          completed: true
        })
      })

      if (response.ok) {
        setDailySteps(prev => 
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

  const getStepGoal = (step: DailyStep) => {
    return goals.find(goal => goal.id === step.goal_id)
  }

  const isOverdue = (step: DailyStep) => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate < today && !step.completed
  }

  const isToday = (step: DailyStep) => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate.getTime() === today.getTime()
  }

  // Get all incomplete steps up to today (including today and overdue)
  const allIncompleteSteps = dailySteps.filter(step => {
    if (step.completed) return false
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate <= today
  })

  // Sort steps: overdue first, then today, then by date
  const sortedSteps = allIncompleteSteps.sort((a, b) => {
    const aOverdue = isOverdue(a)
    const bOverdue = isOverdue(b)
    const aToday = isToday(a)
    const bToday = isToday(b)

    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1
    if (aToday && !bToday) return -1
    if (!aToday && bToday) return 1

    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Všechny kroky</h1>
          <p className="text-gray-600 mt-1">
            Zobrazují se všechny kroky k dokončení (dnešní a zpožděné)
          </p>
        </div>
        <button
          onClick={() => setShowAddStepModal(true)}
          className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Přidat krok</span>
        </button>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto">
        {sortedSteps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Všechno hotové!</h3>
            <p className="text-gray-600 mb-6">
              Nemáte žádné kroky k dokončení. Můžete si přidat nové kroky nebo si odpočinout.
            </p>
            <button
              onClick={() => setShowAddStepModal(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Přidat nový krok
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSteps.map((step) => {
              const goal = getStepGoal(step)
              const overdue = isOverdue(step)
              const today = isToday(step)

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    overdue
                      ? 'bg-red-50 border-red-200 hover:border-red-300'
                      : today
                      ? 'bg-green-50 border-green-200 hover:border-green-300'
                      : 'bg-white border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedStepForDetails(step)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {overdue && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Zpožděno
                          </span>
                        )}
                        {today && !overdue && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Calendar className="w-3 h-3 mr-1" />
                            Dnes
                          </span>
                        )}
                        {goal && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            <Target className="w-3 h-3 mr-1" />
                            {goal.title}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
                      {step.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{step.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>
                          {new Date(step.date).toLocaleDateString('cs-CZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        {step.step_type && (
                          <span className="capitalize">{step.step_type}</span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStepComplete(step.id)
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddStepModal && (
        <UnifiedStepModal
          isOpen={showAddStepModal}
          onClose={() => setShowAddStepModal(false)}
          onSave={handleAddStep}
          goals={goals}
        />
      )}

      {selectedStepForDetails && (
        <UnifiedStepModal
          isOpen={!!selectedStepForDetails}
          onClose={() => setSelectedStepForDetails(null)}
          onSave={async (stepData) => {
            // Handle step update if needed
            setSelectedStepForDetails(null)
          }}
          goals={goals}
          initialTitle={selectedStepForDetails.title}
          preselectedGoalId={selectedStepForDetails.goal_id}
        />
      )}
    </div>
  )
})
