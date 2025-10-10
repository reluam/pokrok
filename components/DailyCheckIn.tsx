'use client'

import { useState, useEffect, memo } from 'react'
import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { Plus, CheckCircle, Circle, Clock, AlertTriangle, Calendar, Target, Star, Zap, Footprints } from 'lucide-react'
import { getToday, getTodayString, isToday, isFuture, getDaysUntil } from '@/lib/utils'

interface DailyCheckInProps {
  goals: Goal[]
  dailySteps: DailyStep[]
  events: Event[]
  onStepComplete: (stepId: string) => void
  onEventComplete: (eventId: string) => void
  onStepAdd: (
    goalId: string, 
    title: string, 
    description: string, 
    date: Date, 
    isImportant: boolean, 
    isUrgent: boolean,
    stepType?: 'update' | 'revision' | 'custom',
    customTypeName?: string,
    frequency?: 'daily' | 'weekly' | 'monthly',
    frequencyTime?: string,
    updateProgressType?: 'percentage' | 'count' | 'amount',
    updateValue?: number,
    updateUnit?: string
  ) => void
  onStepPostpone?: (stepId: string) => void
  onEventPostpone?: (eventId: string) => void
  selectedStep?: DailyStep | null
  selectedEvent?: Event | null
  onStepSelect?: (step: DailyStep) => void
  onEventSelect?: (event: Event) => void
}

export const DailyCheckIn = memo(function DailyCheckIn({ 
  goals, 
  dailySteps, 
  events, 
  onStepComplete, 
  onEventComplete, 
  onStepAdd, 
  onStepPostpone, 
  onEventPostpone, 
  selectedStep, 
  selectedEvent, 
  onStepSelect, 
  onEventSelect 
}: DailyCheckInProps) {
  const [selectedStepForDetails, setSelectedStepForDetails] = useState<DailyStep | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const [newStep, setNewStep] = useState({
    goalId: '',
    title: '',
    description: '',
    stepType: 'update' as 'update' | 'revision' | 'custom',
    customTypeName: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    frequencyTime: '',
    updateProgressType: 'percentage' as 'percentage' | 'count' | 'amount',
    updateValue: '',
    updateUnit: ''
  })

  // Reset form when form is shown
  useEffect(() => {
    if (showAddForm) {
      console.log('Form shown, resetting form')
      setNewStep({ 
        goalId: '', 
        title: '', 
        description: '', 
        stepType: 'update', 
        customTypeName: '', 
        frequency: 'daily', 
        frequencyTime: '',
        updateProgressType: 'percentage',
        updateValue: '',
        updateUnit: ''
      })
    }
  }, [showAddForm])

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault()
    const currentDate = getToday()
    console.log('Form submitted with:', newStep, 'using date:', currentDate)
    console.log('Available goals:', goals)
    if (newStep.goalId && newStep.title) {
      onStepAdd(
        newStep.goalId, 
        newStep.title, 
        newStep.description, 
        currentDate, 
        false, // isImportant - always false for automated steps
        false, // isUrgent - always false for automated steps
        newStep.stepType,
        newStep.stepType === 'custom' ? newStep.customTypeName : undefined,
        newStep.frequency,
        newStep.frequencyTime,
        newStep.updateProgressType,
        newStep.updateValue ? parseFloat(newStep.updateValue) : undefined,
        newStep.updateUnit
      )
      setNewStep({ 
        goalId: '', 
        title: '', 
        description: '', 
        stepType: 'update',
        customTypeName: '',
        frequency: 'daily',
        frequencyTime: '',
        updateProgressType: 'percentage',
        updateValue: '',
        updateUnit: ''
      })
      setShowAddForm(false)
    } else {
      console.error('Missing required fields:', { goalId: newStep.goalId, title: newStep.title })
    }
  }
  
  // Filter steps by date and automation status
  const today = getToday()
  const todayStr = today.toLocaleDateString()
  
  // Today's steps (only user-created steps, not automated)
  const todaySteps = dailySteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    const stepDateStr = stepDate.toLocaleDateString()
    return stepDateStr === todayStr
  })
  
  // Today's events (generated from automations)
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    const eventDateStr = eventDate.toLocaleDateString()
    return eventDateStr === todayStr
  })
  
  
  // Future steps (for right column)
  const futureSteps = dailySteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate > today
  })
  
  // Filter out completed steps and events
  const incompleteTodaySteps = todaySteps.filter(step => !step.completed)
  const incompleteTodayEvents = todayEvents.filter(event => !event.completed)
  const incompleteFutureSteps = futureSteps.filter(step => !step.completed)
  
  // Sort today's steps by priority and time
  const sortedTodaySteps = incompleteTodaySteps.sort((a, b) => {
    const getPriorityScore = (step: DailyStep) => {
      let score = 0
      if (step.is_important) score += 2
      if (step.is_urgent) score += 1
      return score
    }
    
    const scoreA = getPriorityScore(a)
    const scoreB = getPriorityScore(b)
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }
    
    // If same priority, sort by time (if available) or creation order
    return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime()
  })
  
  // Sort today's events by priority and time
  const sortedTodayEvents = incompleteTodayEvents.sort((a, b) => {
    const getPriorityScore = (event: Event) => {
      let score = 0
      if (event.is_important) score += 2
      if (event.is_urgent) score += 1
      return score
    }
    
    const scoreA = getPriorityScore(a)
    const scoreB = getPriorityScore(b)
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA
    }
    
    // If same priority, sort by time (if available) or creation order
    return new Date(a.created_at || a.date).getTime() - new Date(b.created_at || b.date).getTime()
  })
  
  // Sort future steps by date
  const sortedFutureSteps = incompleteFutureSteps.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  
  // Calculate statistics for progress overview
  const overdueSteps = dailySteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate < today && !step.completed
  })
  
  // Calculate completed steps only from today and overdue (not future)
  const completedTodaySteps = todaySteps.filter(step => step.completed)
  const completedOverdueSteps = overdueSteps.filter(step => step.completed)
  const completedSteps = completedTodaySteps.length + completedOverdueSteps.length
  
  // Total steps includes overdue steps
  const totalSteps = todaySteps.length + overdueSteps.length

  // Determine if any steps or events are currently being displayed
  const hasAnyStepsToDisplay = sortedFutureSteps.length > 0


  return (
    <div className="h-full flex flex-col">

      {/* Add Step Button */}
      <div className="p-3 border-b border-gray-200">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm)
            if (!showAddForm) {
      setNewStep({ 
        goalId: '', 
        title: '', 
        description: '', 
        stepType: 'update', 
        customTypeName: '', 
        frequency: 'daily', 
        frequencyTime: '',
        updateProgressType: 'percentage',
        updateValue: '',
        updateUnit: ''
      })
            }
          }}
          className="w-full px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
        >
          {showAddForm ? 'Zrušit' : '+ Přidat krok'}
        </button>
      </div>

      {/* Add Step Form */}
      {showAddForm && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-900 mb-2">Přidat nový krok</h3>
          <form onSubmit={handleAddStep} className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cíl
              </label>
              <select
                value={newStep.goalId}
                onChange={(e) => setNewStep(prev => ({ ...prev, goalId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                required
              >
                <option value="">Vyberte cíl</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Název kroku
              </label>
              <input
                type="text"
                value={newStep.title}
                onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                placeholder="Např. Přečíst 10 stránek"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Popis (volitelné)
              </label>
              <textarea
                value={newStep.description}
                onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                rows={2}
                placeholder="Dodatečné informace..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Typ kroku
              </label>
              <select
                value={newStep.stepType}
                onChange={(e) => setNewStep(prev => ({ ...prev, stepType: e.target.value as 'update' | 'revision' | 'custom' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="update">Update</option>
                <option value="revision">Revize</option>
                <option value="custom">Vlastní</option>
              </select>
            </div>

            {newStep.stepType === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Název vlastního typu
                </label>
                <input
                  type="text"
                  value={newStep.customTypeName}
                  onChange={(e) => setNewStep(prev => ({ ...prev, customTypeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="Např. Meditace, Cvičení"
                  required
                />
              </div>
            )}

            {newStep.stepType === 'update' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Co chcete aktualizovat?
                  </label>
                  <select
                    value={newStep.updateProgressType}
                    onChange={(e) => setNewStep(prev => ({ ...prev, updateProgressType: e.target.value as 'percentage' | 'count' | 'amount' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="percentage">Procenta</option>
                    <option value="count">Počet</option>
                    <option value="amount">Částka</option>
                  </select>
                </div>

                {newStep.updateProgressType !== 'percentage' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Hodnota
                      </label>
                      <input
                        type="number"
                        value={newStep.updateValue}
                        onChange={(e) => setNewStep(prev => ({ ...prev, updateValue: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Jednotka
                      </label>
                      <input
                        type="text"
                        value={newStep.updateUnit}
                        onChange={(e) => setNewStep(prev => ({ ...prev, updateUnit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        placeholder="krát, Kč, kg..."
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Frekvence
              </label>
              <select
                value={newStep.frequency}
                onChange={(e) => setNewStep(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="daily">Jednou denně</option>
                <option value="weekly">Jednou týdně</option>
                <option value="monthly">Jednou měsíčně</option>
              </select>
            </div>

            {(newStep.frequency === 'weekly' || newStep.frequency === 'monthly') && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Čas frekvence (volitelné)
                </label>
                <input
                  type="text"
                  value={newStep.frequencyTime}
                  onChange={(e) => setNewStep(prev => ({ ...prev, frequencyTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder={newStep.frequency === 'weekly' ? 'Např. Pondělí 10:00' : 'Např. 1. den v měsíci 09:00'}
                />
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
              >
                Přidat
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
      setNewStep({ 
        goalId: '', 
        title: '', 
        description: '', 
        stepType: 'update', 
        customTypeName: '', 
        frequency: 'daily', 
        frequencyTime: '',
        updateProgressType: 'percentage',
        updateValue: '',
        updateUnit: ''
      })
                }}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Infinite Feed - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">


          {/* Future steps */}
          {sortedFutureSteps.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Budoucí kroky</h3>
              {sortedFutureSteps.map((step) => {
                const goal = goals.find(g => g.id === step.goal_id)
                const stepDate = new Date(step.date)
                stepDate.setHours(0, 0, 0, 0)
                const today = getToday()
                
                // Calculate days until step
                const daysUntil = getDaysUntil(stepDate)
                const daysText = daysUntil === 1 ? 'Zítra' : `Za ${daysUntil} dní`
                
                const isSelected = selectedStep && selectedStep.id === step.id
                
                return (
                  <div 
                    key={step.id} 
                    onClick={() => setSelectedStepForDetails(step)}
                    className={`bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md relative ${
                      isSelected ? 'ring-2 ring-primary-500 ring-opacity-50 shadow-lg' : ''
                    }`}
                  >
                    {/* Footprints icon for future steps */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-gray-400 opacity-70">
                      <Footprints className="w-4 h-4 fill-current" />
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-600">{step.title}</h4>
                          {step.is_important && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Důležité
                            </span>
                          )}
                          {step.is_urgent && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                              Urgentní
                            </span>
                          )}
                        </div>
                        {step.description && (
                          <p className="text-xs text-gray-500 mb-2">{step.description}</p>
                        )}
                        {goal && (
                          <p className="text-xs text-gray-400">Cíl: {goal.title}</p>
                        )}
                        <p className="text-xs text-primary-500 font-medium mt-1">
                          {daysText}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStepComplete(step.id)
                          }}
                          className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs font-medium"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        {/* Empty State */}
        {!hasAnyStepsToDisplay && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👣</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Ještě žádné kroky</h3>
              <p className="text-xs text-gray-600 mb-4">Přidejte svůj první krok!</p>
              <button
                onClick={() => {
                  setShowAddForm(true)
      setNewStep({ 
        goalId: '', 
        title: '', 
        description: '', 
        stepType: 'update', 
        customTypeName: '', 
        frequency: 'daily', 
        frequencyTime: '',
        updateProgressType: 'percentage',
        updateValue: '',
        updateUnit: ''
      })
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm"
              >
                Přidat první krok
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Step Details Modal */}
      {selectedStepForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detail kroku</h3>
              <button
                onClick={() => setSelectedStepForDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
                <p className="text-gray-900 font-medium">{selectedStepForDetails.title}</p>
              </div>
              
              {selectedStepForDetails.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                  <p className="text-gray-600">{selectedStepForDetails.description}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Datum</label>
                <p className="text-gray-600">{new Date(selectedStepForDetails.date).toLocaleDateString('cs-CZ')}</p>
              </div>
              
              {selectedStepForDetails.goal_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cíl</label>
                  <p className="text-gray-600">{goals.find(g => g.id === selectedStepForDetails.goal_id)?.title || 'Nepřiřazený cíl'}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stav</label>
                <div className="flex items-center space-x-2">
                  {selectedStepForDetails.completed ? (
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
              
              {(selectedStepForDetails.is_important || selectedStepForDetails.is_urgent) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorita</label>
                  <div className="flex space-x-2">
                    {selectedStepForDetails.is_important && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Důležité
                      </span>
                    )}
                    {selectedStepForDetails.is_urgent && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Urgentní
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  onStepComplete(selectedStepForDetails.id)
                  setSelectedStepForDetails(null)
                }}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                {selectedStepForDetails.completed ? (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Označit jako nedokončené</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Označit jako dokončené</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setSelectedStepForDetails(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})