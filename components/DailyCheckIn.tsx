'use client'

import { useState, useEffect, memo } from 'react'
import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { Plus, CheckCircle, Circle, Clock, AlertTriangle, Calendar, Target, Star, Zap, Footprints } from 'lucide-react'

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
  const [showAddForm, setShowAddForm] = useState(false)
  // Function to get today's date string
  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    console.log('getTodayString() returning:', dateString, 'for local date:', today.toLocaleDateString())
    return dateString
  }

  // Function to get today's date object
  const getToday = () => {
    const today = new Date()
    // Create a new date with local timezone at midnight
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    console.log('getToday() returning:', localToday, 'for local date:', localToday.toLocaleDateString())
    return localToday
  }

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
  const hasAnyStepsToDisplay = sortedTodaySteps.length > 0 || sortedTodayEvents.length > 0 || sortedFutureSteps.length > 0


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
          {/* Today's steps */}
          {sortedTodaySteps.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Dnešní kroky</h3>
              {sortedTodaySteps.map((step) => {
            const goal = goals.find(g => g.id === step.goal_id)
            const stepDate = new Date(step.date)
            stepDate.setHours(0, 0, 0, 0)
            const stepDateStr = stepDate.toLocaleDateString()
            const todayStr = getToday().toLocaleDateString()
            const stepDateObj = new Date(stepDateStr)
            const todayObj = new Date(todayStr)
            
            // Determine step status and styling
            const isOverdue = stepDateObj < todayObj
            const isToday = stepDateStr === todayStr
            const isFuture = stepDateObj > todayObj
            
            const getStepStatus = () => {
              if (isOverdue) {
                const daysOverdue = Math.floor((getToday().getTime() - stepDate.getTime()) / (1000 * 60 * 60 * 24))
                return { 
                  text: daysOverdue === 0 ? 'Dnes' : `${daysOverdue} dní zpožděno`,
                  color: 'text-red-600',
                  bgColor: 'bg-red-50',
                  borderColor: 'border-red-200',
                  buttonColor: 'bg-red-600 hover:bg-red-700'
                }
              }
              if (isToday) {
                return { 
                  text: 'Dnes',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-50',
                  borderColor: 'border-orange-200',
                  buttonColor: 'bg-orange-600 hover:bg-orange-700'
                }
              }
              if (isFuture) {
                const daysUntil = Math.ceil((stepDate.getTime() - getToday().getTime()) / (1000 * 60 * 60 * 24))
                return { 
                  text: daysUntil === 1 ? 'Zítra' : `Za ${daysUntil} dní`,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50',
                  borderColor: 'border-blue-200',
                  buttonColor: 'bg-blue-600 hover:bg-blue-700'
                }
              }
              return { 
                text: '',
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                buttonColor: 'bg-gray-600 hover:bg-gray-700'
              }
            }
            
            const status = getStepStatus()
            
            // Priority indicators
            const getPriorityIndicators = () => {
              const indicators = []
              if (step.is_important) indicators.push('⭐')
              if (step.is_urgent) indicators.push('🚨')
              return indicators.join(' ')
            }
            
            const isSelected = selectedStep && selectedStep.id === step.id
            
            return (
              <div
                key={step.id}
                onClick={() => onStepSelect && onStepSelect(step)}
                className={`${status.bgColor} rounded-lg p-3 border-l-4 ${status.borderColor} shadow-sm relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary-500 ring-opacity-50 shadow-lg' : ''
                }`}
              >
                {/* Footprints icon for user-created steps */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-gray-500 opacity-90">
                  <Footprints className="w-4 h-4 fill-current" />
                </div>
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                      {getPriorityIndicators() && (
                        <span className="text-xs">{getPriorityIndicators()}</span>
                      )}
                    </div>
                    
                    {/* Step Type and Frequency Info */}
                    <div className="flex items-center space-x-2 mb-1">
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
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                      {goal && (
                        <span className="flex items-center">
                          <span className="mr-1">🎯</span>
                          {goal.title}
                        </span>
                      )}
                      <span className={`font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-3">
                    <button
                      onClick={() => onStepComplete(step.id)}
                      className={`px-3 py-1 text-white rounded-lg transition-colors text-xs font-medium ${status.buttonColor}`}
                    >
                      ✓
                    </button>
                    {onStepPostpone && (
                      <button
                        onClick={() => onStepPostpone(step.id)}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs font-medium"
                        title="Odložit na zítra"
                      >
                        ⏰
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
            </div>
          )}

          {/* Today's events */}
          {sortedTodayEvents.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Dnešní eventy</h3>
              {sortedTodayEvents.map((event) => {
                const goal = goals.find(g => g.id === event.goal_id)
                const eventDate = new Date(event.date)
                eventDate.setHours(0, 0, 0, 0)
                const eventDateStr = eventDate.toLocaleDateString()
                const todayStr = getToday().toLocaleDateString()
                const eventDateObj = new Date(eventDateStr)
                const todayObj = new Date(todayStr)
                
                // Determine event status and styling
                const isOverdue = eventDateObj < todayObj
                const isToday = eventDateStr === todayStr
                const isFuture = eventDateObj > todayObj
                
                const getEventStatus = () => {
                  if (isOverdue) {
                    const daysOverdue = Math.floor((getToday().getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
                    return { 
                      text: daysOverdue === 0 ? 'Dnes' : `${daysOverdue} dní zpožděno`,
                      color: 'text-red-600',
                      bgColor: 'bg-red-50',
                      borderColor: 'border-red-200',
                      buttonColor: 'bg-red-600 hover:bg-red-700'
                    }
                  }
                  if (isToday) {
                    return { 
                      text: 'Dnes',
                      color: 'text-orange-600',
                      bgColor: 'bg-orange-50',
                      borderColor: 'border-orange-200',
                      buttonColor: 'bg-orange-600 hover:bg-orange-700'
                    }
                  }
                  if (isFuture) {
                    const daysUntil = Math.ceil((eventDate.getTime() - getToday().getTime()) / (1000 * 60 * 60 * 24))
                    return { 
                      text: daysUntil === 1 ? 'Zítra' : `Za ${daysUntil} dní`,
                      color: 'text-blue-600',
                      bgColor: 'bg-blue-50',
                      borderColor: 'border-blue-200',
                      buttonColor: 'bg-blue-600 hover:bg-blue-700'
                    }
                  }
                  return { 
                    text: '',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    buttonColor: 'bg-gray-600 hover:bg-gray-700'
                  }
                }
                
                const status = getEventStatus()
                
                // Priority indicators
                const getPriorityIndicators = () => {
                  const indicators = []
                  if (event.is_important) indicators.push('⭐')
                  if (event.is_urgent) indicators.push('🚨')
                  return indicators.join(' ')
                }
                
                const isSelected = selectedEvent && selectedEvent.id === event.id
                
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventSelect && onEventSelect(event)}
                    className={`${status.bgColor} rounded-lg p-3 border-l-4 ${status.borderColor} shadow-sm relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary-500 ring-opacity-50 shadow-lg' : ''
                    }`}
                  >
                    {/* Lightning bolt icon for events */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-primary-500 opacity-90">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          {getPriorityIndicators() && (
                            <span className="text-xs">{getPriorityIndicators()}</span>
                          )}
                        </div>
                        
                        {/* Event Type Info */}
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            event.event_type === 'metric_update' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {event.event_type === 'metric_update' ? 'Metrika' : 'Připomínka'}
                          </span>
                        </div>
                        
                        {event.description && (
                          <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {goal && (
                            <span className="flex items-center">
                              <span className="mr-1">🎯</span>
                              {goal.title}
                            </span>
                          )}
                          <span className={`font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-3">
                        <button
                          onClick={() => onEventComplete(event.id)}
                          className={`px-3 py-1 text-white rounded-lg transition-colors text-xs font-medium ${status.buttonColor}`}
                        >
                          ✓
                        </button>
                        {onEventPostpone && (
                          <button
                            onClick={() => onEventPostpone(event.id)}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs font-medium"
                            title="Odložit na zítra"
                          >
                            ⏰
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Future steps */}
          {sortedFutureSteps.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Budoucí kroky</h3>
              {sortedFutureSteps.map((step) => {
                const goal = goals.find(g => g.id === step.goal_id)
                const stepDate = new Date(step.date)
                const isFuture = true
                
                const isSelected = selectedStep && selectedStep.id === step.id
                
                return (
                  <div 
                    key={step.id} 
                    onClick={() => onStepSelect && onStepSelect(step)}
                    className={`bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md relative ${
                      isSelected ? 'ring-2 ring-primary-500 ring-opacity-50 shadow-lg' : ''
                    }`}
                  >
                    {/* Footprints icon for future steps (gray design) */}
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
                        <p className="text-xs text-gray-400 mt-1">
                          {stepDate.toLocaleDateString('cs-CZ')}
                        </p>
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
    </div>
  )
})