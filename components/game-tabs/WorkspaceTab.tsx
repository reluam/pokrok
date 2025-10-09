'use client'

import { useState, memo } from 'react'
import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { CheckCircle, Clock, Target, BookOpen, Lightbulb, Calendar, Zap, Footprints } from 'lucide-react'

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
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showMaterials, setShowMaterials] = useState(false)
  const [editingValue, setEditingValue] = useState<string>('')

  // Calculate today's date for filtering (local time)
  const getToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    console.log('getToday() returning:', today, 'for local date:', today.toLocaleDateString())
    return today
  }

  const today = getToday()

  // Get current task (step or event)
  const getCurrentTask = () => {
    // Priority: selected step > selected event > first today's step > first today's event
    if (selectedStep) {
      return { type: 'step' as const, data: selectedStep }
    }
    if (selectedEvent) {
      return { type: 'event' as const, data: selectedEvent }
    }

    // Find first incomplete step for today
    const todaySteps = dailySteps.filter(step => {
      const stepDate = new Date(step.date)
      stepDate.setHours(0, 0, 0, 0)
      return stepDate.getTime() === today.getTime() && !step.completed
    })

    if (todaySteps.length > 0) {
      return { type: 'step' as const, data: todaySteps[0] }
    }

    // Find first incomplete event for today
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === today.getTime() && !event.completed
    })

    if (todayEvents.length > 0) {
      return { type: 'event' as const, data: todayEvents[0] }
    }

    return null
  }

  const currentTask = getCurrentTask()
  const currentStep = currentTask?.type === 'step' ? currentTask.data : null
  const currentEvent = currentTask?.type === 'event' ? currentTask.data : null
  const currentGoal = currentStep ? goals.find(g => g.id === currentStep.goal_id) : 
                     currentEvent ? goals.find(g => g.id === currentEvent.goal_id) : null

  // Early return if no current task
  if (!currentTask) {
    // Show inspirational tips when no tasks
    const inspirationalTips = [
      {
        icon: '🎯',
        title: 'Vytvořte si nový cíl',
        description: 'Začněte s něčím malým a postupně se posouvejte k větším výzvám.',
        action: 'Přidat cíl'
      },
      {
        icon: '📚',
        title: 'Prostudujte materiály',
        description: 'Využijte čas na čtení inspirativních článků a materiálů.',
        action: 'Prohlédnout materiály'
      },
      {
        icon: '💡',
        title: 'Reflektujte svůj pokrok',
        description: 'Zamyslete se nad tím, co jste dnes dokázali a co můžete zlepšit.',
        action: 'Reflektovat'
      }
    ]

    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Skvělá práce!
          </h2>
          <p className="text-gray-600 mb-8">
            Dnes už nemáte žádné úkoly. Můžete si odpočinout nebo se věnovat něčemu novému.
          </p>
          
          <div className="space-y-4">
            {inspirationalTips.map((tip, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      {tip.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getStepPriority = (step: DailyStep) => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    const today = getToday()
    
    if (stepDate < today) return 'overdue'
    if (stepDate.getTime() === today.getTime()) return 'today'
    return 'future'
  }

  const getEventPriority = (event: Event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    const today = getToday()
    
    if (eventDate < today) return 'overdue'
    if (eventDate.getTime() === today.getTime()) return 'today'
    return 'future'
  }

  const stepPriority = currentStep ? getStepPriority(currentStep) : 'today'
  const eventPriority = currentEvent ? getEventPriority(currentEvent) : 'today'

  const priorityConfig = {
    overdue: { color: 'text-red-600 bg-red-50 border-red-200', icon: '⚠️', label: 'Zpožděno' },
    today: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '📅', label: 'Dnes' },
    future: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '⏰', label: 'Nadcházející' }
  }

  const config = stepPriority === 'overdue' ? priorityConfig.overdue : 
                 stepPriority === 'today' ? priorityConfig.today : 
                 priorityConfig.future

  const handleUpdateStepValue = async (taskId: string, value: number) => {
    try {
      // Complete the task (step or event)
      const step = dailySteps.find(s => s.id === taskId)
      const event = events.find(e => e.id === taskId)
      
      if (step) {
        // Complete the step
        const completeResponse = await fetch(`/api/cesta/daily-steps/${taskId}/toggle`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: true })
        })

        if (completeResponse.ok) {
          const completeData = await completeResponse.json()
          const completedStep = completeData.step
          
          if (onStepUpdate) {
            onStepUpdate(completedStep)
          }
        }
      } else if (event) {
        // Complete the event
        if (onEventComplete) {
          onEventComplete(taskId)
        }
      }
    } catch (error) {
      console.error('Error updating step value:', error)
    }
  }

  const handleCompleteTask = async () => {
    if (!currentTask) return

    const taskId = currentTask.data.id
    await handleUpdateStepValue(taskId, 0)
  }

  const handlePostponeTask = async () => {
    if (!currentTask) return

    const taskId = currentTask.data.id
    
    if (currentStep && onStepUpdate) {
      // Postpone step to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const response = await fetch(`/api/cesta/daily-steps/${taskId}/postpone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: tomorrow.toISOString().split('T')[0] })
      })

      if (response.ok) {
        const data = await response.json()
        onStepUpdate(data.step)
      }
    } else if (currentEvent && onEventPostpone) {
      onEventPostpone(taskId)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
              <span className="text-lg">{config.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentStep ? 'Dnešní krok' : 'Dnešní událost'}
              </h2>
              <p className="text-sm text-gray-600">{config.label}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePostponeTask}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Odložit
            </button>
            <button
              onClick={handleCompleteTask}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Dokončit
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Task Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color}`}>
                <span className="text-xl">{config.icon}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentStep ? currentStep.title : currentEvent?.title}
                </h3>
                
                {(currentStep?.description || currentEvent?.description) && (
                  <p className="text-gray-600 mb-4">
                    {currentStep?.description || currentEvent?.description}
                  </p>
                )}

                {currentGoal && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>🎯</span>
                    <span>{currentGoal.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCompleteTask}
              className="flex-1 bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Dokončit úkol</span>
            </button>
            
            <button
              onClick={handlePostponeTask}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Odložit na zítra</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
