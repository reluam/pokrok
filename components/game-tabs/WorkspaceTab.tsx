'use client'

import { useState, memo } from 'react'
import { Goal, Value, DailyStep, Metric, Event } from '@/lib/cesta-db'
import { CheckCircle, Clock, Target, BookOpen, Lightbulb, Calendar, Zap, Footprints } from 'lucide-react'

interface WorkspaceTabProps {
  goals: Goal[]
  values: Value[]
  dailySteps: DailyStep[]
  events: Event[]
  metrics: Metric[]
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
  metrics, 
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get the current task (selected step/event or first today's task)
  const getCurrentTask = (): { type: 'step', data: DailyStep } | { type: 'event', data: Event } | null => {
    // If a step is selected, use it
    if (selectedStep) {
      return { type: 'step', data: selectedStep }
    }

    // If an event is selected, use it
    if (selectedEvent) {
      return { type: 'event', data: selectedEvent }
    }

    // Otherwise, show first today's task (step or event)
    const todaySteps = dailySteps.filter(step => {
      if (step.completed) return false
      const stepDate = new Date(step.date)
      stepDate.setHours(0, 0, 0, 0)
      const stepDateStr = stepDate.toLocaleDateString()
      const todayStr = today.toLocaleDateString()
      return stepDateStr === todayStr
    })

    const todayEvents = events.filter(event => {
      if (event.completed) return false
      const eventDate = new Date(event.date)
      eventDate.setHours(0, 0, 0, 0)
      const eventDateStr = eventDate.toLocaleDateString()
      const todayStr = today.toLocaleDateString()
      return eventDateStr === todayStr
    })

    // Combine and sort by priority
    const allTasks = [
      ...todaySteps.map(step => ({ type: 'step' as const, data: step, priority: (step.is_important ? 2 : 0) + (step.is_urgent ? 1 : 0) })),
      ...todayEvents.map(event => ({ type: 'event' as const, data: event, priority: (event.is_important ? 2 : 0) + (event.is_urgent ? 1 : 0) }))
    ]

    if (allTasks.length > 0) {
      // Sort by priority and time
      const sortedTasks = allTasks.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        
        // If same priority, sort by time
        return new Date(a.data.created_at || a.data.date).getTime() - new Date(b.data.created_at || b.data.date).getTime()
      })
      
      const firstTask = sortedTasks[0]
      return { type: firstTask.type, data: firstTask.data } as { type: 'step', data: DailyStep } | { type: 'event', data: Event }
    }

    return null
  }

  const currentTask = getCurrentTask()
  const currentStep = currentTask?.type === 'step' ? currentTask.data : null
  const currentEvent = currentTask?.type === 'event' ? currentTask.data : null
  const currentGoal = currentStep ? goals.find(g => g.id === currentStep.goal_id) : 
                     currentEvent ? goals.find(g => g.id === currentEvent.goal_id) : null
  const currentMetric = currentStep && currentStep.metric_id ? metrics.find(m => m.id === currentStep.metric_id) : 
                       currentEvent && currentEvent.target_metric_id ? metrics.find(m => m.id === currentEvent.target_metric_id) : null

  // Early return if no current task
  if (!currentTask) {
    // Show inspirational tips when no tasks
    const inspirationalTips = [
      {
        icon: "🌱",
        title: "Odpočiňte si",
        description: "Někdy je nejlepší udělat krok zpět a nabrat síly pro další kroky.",
        action: "Vezměte si 10 minut na hluboké dýchání"
      },
      {
        icon: "🚶‍♂️",
        title: "Projděte se",
        description: "Čerstvý vzduch a pohyb mohou probudit kreativitu a energii.",
        action: "Vyjděte ven na 15 minut"
      },
      {
        icon: "📚",
        title: "Přečtěte si",
        description: "Inspirujte se knihami nebo články o osobním rozvoji.",
        action: "Otevřete knihu nebo článek"
      },
      {
        icon: "🎯",
        title: "Naplánujte si cíle",
        description: "Využijte čas na přemýšlení o svých dlouhodobých cílech.",
        action: "Napište si 3 věci, které chcete dosáhnout"
      },
      {
        icon: "💭",
        title: "Meditujte",
        description: "Klidná mysl je základem pro efektivní rozhodování.",
        action: "Sedněte si v klidu na 5 minut"
      }
    ]

    const randomTip = inspirationalTips[Math.floor(Math.random() * inspirationalTips.length)]

    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">{randomTip.icon}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{randomTip.title}</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">{randomTip.description}</p>
          
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 max-w-sm mx-auto">
            <p className="text-primary-800 font-medium">{randomTip.action}</p>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>💡 Tip: Přidejte nový cíl nebo krok pro pokračování ve vaší cestě</p>
          </div>
        </div>
      </div>
    )
  }


  const getTaskPriority = (task: DailyStep | Event) => {
    const taskDate = new Date(task.date)
    taskDate.setHours(0, 0, 0, 0)
    const taskDateStr = taskDate.toLocaleDateString()
    const todayStr = today.toLocaleDateString()
    const taskDateObj = new Date(taskDateStr)
    const todayObj = new Date(todayStr)

    if (taskDateObj < todayObj) return 'overdue'
    if (taskDateStr === todayStr) return 'today'
    return 'future'
  }

  const stepPriority = currentTask ? getTaskPriority(currentTask.data) : 'today'
  const priorityConfig = {
    overdue: { color: 'text-red-600 bg-red-50 border-red-200', icon: '🚨', label: 'Zpožděno' },
    today: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '📅', label: 'Dnes' },
    future: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '⏰', label: 'Nadcházející' }
  }

  const config = priorityConfig[stepPriority]

  const handleUpdateStepValue = async (taskId: string, value: number) => {
    try {
      // Check if this is a step or event with a metric
      const step = dailySteps.find(s => s.id === taskId)
      const event = events.find(e => e.id === taskId)
      const metric = step && step.metric_id ? metrics.find(m => m.id === step.metric_id) : 
                    event && event.target_metric_id ? metrics.find(m => m.id === event.target_metric_id) : null

      if (metric) {
        // Update the metric
        const response = await fetch(`/api/cesta/metrics/${metric.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_value: value
          })
        })

        if (response.ok) {
          const data = await response.json()
          const updatedMetric = data.metric

          // Update the metric in local state
          if (onValueUpdate) {
            // We need to trigger a refresh of the metrics
            // For now, we'll just complete the step
          }

          // Complete the task (step or event)
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
              const updatedGoal = completeData.goal

              // Update the completed step in local state
              if (onStepUpdate) {
                onStepUpdate(completedStep)
              }

              // Update the goal in local state if it was updated
              if (updatedGoal && onGoalUpdate) {
                onGoalUpdate(updatedGoal)
              }
            } else {
              alert('Hodnota byla uložena, ale krok se nepodařilo dokončit')
            }
          } else if (event) {
            // Complete the event
            if (onEventComplete) {
              onEventComplete(taskId)
            }
          }

          // Clear the editing value
          setEditingValue('')
        } else {
          const error = await response.json()
          alert(`Chyba při aktualizaci metriky: ${error.error || 'Neznámá chyba'}`)
        }
      } else {
        // Fallback to original step value update
        const response = await fetch(`/api/cesta/daily-steps/${taskId}/update-value`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            updateValue: value
          })
        })

        if (response.ok) {
          const data = await response.json()
          const updatedStep = data.step

          // Update the step in local state
          if (onStepUpdate) {
            onStepUpdate(updatedStep)
          }

          // Then complete the step
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
            const updatedGoal = completeData.goal

            // Update the completed step in local state
            if (onStepUpdate) {
              onStepUpdate(completedStep)
            }

            // Update the goal in local state if it was updated
            if (updatedGoal && onGoalUpdate) {
              onGoalUpdate(updatedGoal)
            }

            // Clear the editing value
            setEditingValue('')
          } else {
            alert('Hodnota byla uložena, ale krok se nepodařilo dokončit')
          }
        } else {
          const error = await response.json()
          alert(`Chyba při aktualizaci hodnoty: ${error.error || 'Neznámá chyba'}`)
        }
      }
    } catch (error) {
      console.error('Error updating step value:', error)
      alert('Chyba při aktualizaci hodnoty')
    }
  }

  const handlePostponeStep = async (stepId: string) => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowString = tomorrow.toISOString().split('T')[0]

      const response = await fetch(`/api/cesta/daily-steps/${stepId}/postpone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newDate: tomorrowString })
      })

      if (response.ok) {
        const data = await response.json()
        const postponedStep = data.step

        // Update the step in local state
        if (onStepUpdate) {
          onStepUpdate(postponedStep)
        }
      } else {
        const error = await response.json()
        alert(`Chyba při odložení kroku: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error postponing step:', error)
      alert('Chyba při odložení kroku')
    }
  }


  return (
    <div className="p-6">
      {/* Current Task Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentTask.type === 'step' ? 'Aktuální krok' : 'Aktuální připomínka'}
              </h2>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                stepPriority === 'overdue' ? 'text-red-600 bg-red-50 border-red-200' :
                stepPriority === 'today' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                'text-blue-600 bg-blue-50 border-blue-200'
              }`}>
                {stepPriority === 'overdue' ? 'Zpožděno' :
                 stepPriority === 'today' ? 'Dnes' :
                 'Nadcházející'}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showSuggestions 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Návrhy
            </button>
            <button
              onClick={() => setShowMaterials(!showMaterials)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showMaterials 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              Materiály
            </button>
          </div>
        </div>
      </div>

      {/* Current Step Card */}
      <div className={`rounded-xl shadow-lg border-2 mb-6 relative ${
        stepPriority === 'overdue' ? 'bg-red-50 border-red-200' :
        stepPriority === 'today' ? 'bg-orange-50 border-orange-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        {/* Icon in left border */}
        <div className={`absolute -left-3 top-1/2 -translate-y-1/2 ${
          currentTask.type === 'step' ? (
            stepPriority === 'overdue' ? 'text-red-500 opacity-90' :
            stepPriority === 'today' ? 'text-gray-500 opacity-90' :
            'text-gray-400 opacity-70'
          ) : (
            'text-primary-500 opacity-90'
          )
        }`}>
          {currentTask.type === 'step' ? (
            <Footprints className="w-45 h-45 fill-current" />
          ) : (
            <Zap className="w-45 h-45 fill-current" />
          )}
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentTask.type === 'step' ? currentStep!.title : currentEvent!.title}
                </h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                  {config.label}
                </div>
              </div>
            </div>
            {(currentTask.type === 'step' ? currentStep!.description : currentEvent!.description) && (
              <p className="text-gray-600 mb-4">
                {currentTask.type === 'step' ? currentStep!.description : currentEvent!.description}
              </p>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
              {currentTask.type === 'step' ? (
                // Step actions
                <>
                  {/* Update Value Input for update steps or steps with metrics */}
                  {(currentStep!.step_type === 'update') || currentMetric ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editingValue || (currentMetric ? currentMetric.current_value : 0) || 0}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">
                      {currentMetric ? currentMetric.unit : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const value = editingValue || (currentMetric ? currentMetric.current_value : 0)?.toString() || '0'
                      if (value) {
                        handleUpdateStepValue(currentStep!.id, parseFloat(value))
                        setEditingValue('')
                      }
                    }}
                    className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium ${
                      stepPriority === 'overdue' ? 'bg-red-500 hover:bg-red-600' :
                      stepPriority === 'today' ? 'bg-orange-500 hover:bg-orange-600' :
                      'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Dokončit
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    // For non-update steps, just complete them directly
                    fetch(`/api/cesta/daily-steps/${currentStep!.id}/toggle`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ completed: true })
                    })
                    .then(response => response.json())
                    .then(data => {
                      if (data.step && onStepUpdate) {
                        onStepUpdate(data.step)
                      }
                      if (data.goal && onGoalUpdate) {
                        onGoalUpdate(data.goal)
                      }
                    })
                    .catch(error => {
                      console.error('Error completing step:', error)
                      alert('Chyba při dokončování kroku')
                    })
                  }}
                  className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium ${
                    stepPriority === 'overdue' ? 'bg-red-500 hover:bg-red-600' :
                    stepPriority === 'today' ? 'bg-orange-500 hover:bg-orange-600' :
                    'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Dokončit
                </button>
              )}
              
                  <button
                    onClick={() => handlePostponeStep(currentStep!.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Odložit
                  </button>
                </>
              ) : (
                // Event actions
                <>
                  {/* Update Value Input for events with metrics */}
                  {currentEvent!.event_type === 'metric_update' && currentMetric ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editingValue || (currentMetric ? currentMetric.current_value : 0) || 0}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <span className="text-sm text-gray-500">
                          {currentMetric ? currentMetric.unit : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const value = editingValue || (currentMetric ? currentMetric.current_value : 0)?.toString() || '0'
                          if (value) {
                            handleUpdateStepValue(currentEvent!.id, parseFloat(value))
                            setEditingValue('')
                          }
                        }}
                        className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium ${
                          stepPriority === 'overdue' ? 'bg-red-500 hover:bg-red-600' :
                          stepPriority === 'today' ? 'bg-orange-500 hover:bg-orange-600' :
                          'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Dokončit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onEventComplete?.(currentEvent!.id)}
                      className={`px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium ${
                        stepPriority === 'overdue' ? 'bg-red-500 hover:bg-red-600' :
                        stepPriority === 'today' ? 'bg-orange-500 hover:bg-orange-600' :
                        'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Dokončit
                    </button>
                  )}
                  
                  <button
                    onClick={() => onEventPostpone?.(currentEvent!.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Odložit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Step Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Target className={`w-4 h-4 ${
                stepPriority === 'overdue' ? 'text-red-500' :
                stepPriority === 'today' ? 'text-orange-500' :
                'text-blue-500'
              }`} />
              <span className="text-sm text-gray-600">Cíl:</span>
              <span className="text-sm font-medium text-gray-900">{currentGoal?.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className={`w-4 h-4 ${
                stepPriority === 'overdue' ? 'text-red-500' :
                stepPriority === 'today' ? 'text-orange-500' :
                'text-blue-500'
              }`} />
              <span className="text-sm text-gray-600">Datum:</span>
              <span className={`text-sm font-medium ${
                stepPriority === 'overdue' ? 'text-red-700' :
                stepPriority === 'today' ? 'text-orange-700' :
                'text-blue-700'
              }`}>
                {new Date(currentTask.type === 'step' ? currentStep!.date : currentEvent!.date).toLocaleDateString('cs-CZ')}
              </span>
            </div>
          </div>

          {/* Goal Progress */}
          <div className={`rounded-lg p-4 ${
            stepPriority === 'overdue' ? 'bg-red-100' :
            stepPriority === 'today' ? 'bg-orange-100' :
            'bg-blue-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Pokrok cíle</span>
              <span className={`text-sm font-bold ${
                stepPriority === 'overdue' ? 'text-red-600' :
                stepPriority === 'today' ? 'text-orange-600' :
                'text-blue-600'
              }`}>
                {currentMetric ? (
                  <span>
                    {currentGoal?.progress_percentage}% → {
                      (() => {
                        const currentValue = parseFloat(editingValue || currentMetric.current_value?.toString() || '0')
                        const targetValue = currentMetric.target_value
                        const newPercentage = Math.min(100, Math.round((currentValue / targetValue) * 100))
                        return `${newPercentage}%`
                      })()
                    }
                  </span>
                ) : (
                  `${currentGoal?.progress_percentage}%`
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 relative">
              {/* Current progress (background) */}
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  stepPriority === 'overdue' ? 'bg-red-500' :
                  stepPriority === 'today' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}
                style={{ 
                  width: `${currentGoal?.progress_percentage || 0}%` 
                }}
              ></div>
              
              {/* Delta visualization for update steps or steps with metrics */}
              {currentMetric && (
                (() => {
                  const currentValue = parseFloat(editingValue || currentMetric.current_value?.toString() || '0')
                  const targetValue = currentMetric.target_value
                  const newPercentage = Math.min(100, Math.round((currentValue / targetValue) * 100))
                  const delta = newPercentage - (currentGoal?.progress_percentage || 0)
                  
                  if (Math.abs(delta) > 0) {
                    const deltaWidth = Math.abs(delta)
                    const deltaPosition = currentGoal?.progress_percentage || 0
                    const isIncrease = delta > 0
                    
                    return (
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isIncrease ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${deltaWidth}%`,
                          marginLeft: `${deltaPosition}%`,
                          position: 'absolute',
                          top: 0,
                          opacity: 0.8
                        }}
                      ></div>
                    )
                  }
                  return null
                })()
              )}
            </div>
            {currentMetric && (
              <div className="mt-2 space-y-1">
                {(() => {
                  const currentValue = parseFloat(editingValue || currentMetric.current_value?.toString() || '0')
                  const targetValue = currentMetric.target_value
                  const newPercentage = Math.min(100, Math.round((currentValue / targetValue) * 100))
                  const delta = newPercentage - (currentGoal?.progress_percentage || 0)
                  const remaining = Math.max(0, targetValue - currentValue)
                  
                  return (
                    <>
                      {/* Delta feedback */}
                      {Math.abs(delta) > 0 && (
                        <div className={`text-xs font-medium ${
                          delta > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {delta > 0 ? '↗️' : '↘️'} {Math.abs(delta)}% {delta > 0 ? 'nárůst' : 'pokles'}
                        </div>
                      )}
                      
                      {/* Remaining value */}
                      <div className="text-xs text-gray-600">
                        {remaining > 0 ? 
                          `Zbývá: ${remaining} ${currentMetric.unit}` : 
                          'Cíl splněn! 🎉'
                        }
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      {showSuggestions && (
        <div className={`rounded-xl border mb-6 ${
          stepPriority === 'overdue' ? 'bg-red-50 border-red-200' :
          stepPriority === 'today' ? 'bg-orange-50 border-orange-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              stepPriority === 'overdue' ? 'text-red-900' :
              stepPriority === 'today' ? 'text-orange-900' :
              'text-blue-900'
            }`}>
              <Lightbulb className="w-5 h-5 mr-2" />
              Návrhy na řešení
            </h3>
            <div className="space-y-3">
              <div className={`bg-white rounded-lg p-4 border ${
                stepPriority === 'overdue' ? 'border-red-100' :
                stepPriority === 'today' ? 'border-orange-100' :
                'border-blue-100'
              }`}>
                <h4 className="font-medium text-gray-900 mb-2">Rozdělte úkol na menší části</h4>
                <p className="text-sm text-gray-600">
                  Velké úkoly mohou být zastrašující. Zkuste rozdělit "{currentTask.type === 'step' ? currentStep!.title : currentEvent!.title}" na 2-3 menší kroky.
                </p>
              </div>
              <div className={`bg-white rounded-lg p-4 border ${
                stepPriority === 'overdue' ? 'border-red-100' :
                stepPriority === 'today' ? 'border-orange-100' :
                'border-blue-100'
              }`}>
                <h4 className="font-medium text-gray-900 mb-2">Najděte si časový blok</h4>
                <p className="text-sm text-gray-600">
                  Vyhraďte si konkrétní čas (např. 25 minut) a soustřeďte se pouze na tento úkol.
                </p>
              </div>
              <div className={`bg-white rounded-lg p-4 border ${
                stepPriority === 'overdue' ? 'border-red-100' :
                stepPriority === 'today' ? 'border-orange-100' :
                'border-blue-100'
              }`}>
                <h4 className="font-medium text-gray-900 mb-2">Začněte s nejjednodušší částí</h4>
                <p className="text-sm text-gray-600">
                  Identifikujte nejmenší možný první krok a začněte tam. Momentum vás dovede dál.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Materials Section */}
      {showMaterials && (
        <div className={`rounded-xl border mb-6 ${
          stepPriority === 'overdue' ? 'bg-red-50 border-red-200' :
          stepPriority === 'today' ? 'bg-orange-50 border-orange-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              stepPriority === 'overdue' ? 'text-red-900' :
              stepPriority === 'today' ? 'text-orange-900' :
              'text-blue-900'
            }`}>
              <BookOpen className="w-5 h-5 mr-2" />
              Materiály a zdroje
            </h3>
            <div className="space-y-3">
              <div className={`bg-white rounded-lg p-4 border ${
                stepPriority === 'overdue' ? 'border-red-100' :
                stepPriority === 'today' ? 'border-orange-100' :
                'border-blue-100'
              }`}>
                <h4 className="font-medium text-gray-900 mb-2">Související cíle</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Tento krok souvisí s cílem: <strong>{currentGoal?.title}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {currentGoal?.description || 'Žádný popis cíle není k dispozici.'}
                </p>
              </div>
              <div className={`bg-white rounded-lg p-4 border ${
                stepPriority === 'overdue' ? 'border-red-100' :
                stepPriority === 'today' ? 'border-orange-100' :
                'border-blue-100'
              }`}>
                <h4 className="font-medium text-gray-900 mb-2">Doporučené zdroje</h4>
                <p className="text-sm text-gray-600">
                  Pro dokončení tohoto kroku doporučujeme prozkoumat materiály v sekci "Inspirace" 
                  nebo se podívat na podobné cíle v aplikaci.
                </p>
              </div>
              <div className={`bg-white rounded-lg p-4 border ${
                stepPriority === 'overdue' ? 'border-red-100' :
                stepPriority === 'today' ? 'border-orange-100' :
                'border-blue-100'
              }`}>
                <h4 className="font-medium text-gray-900 mb-2">Tipy pro produktivitu</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Eliminujte rozptylování během práce</li>
                  <li>• Použijte techniku Pomodoro (25 min práce, 5 min pauza)</li>
                  <li>• Zaznamenejte si pokrok pro motivaci</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
})
