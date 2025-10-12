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
  const [editingStep, setEditingStep] = useState<DailyStep | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleStepEdit = (step: DailyStep) => {
    setEditingStep({ ...step })
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
        // Note: We can't directly update the parent state here, 
        // but the parent should refresh the data
        setEditingStep(null)
        alert('Krok byl úspěšně uložen!')
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

  const handleStepDelete = async () => {
    if (!editingStep || !confirm('Opravdu chcete smazat tento krok?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/cesta/daily-steps/${editingStep.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEditingStep(null)
        // Force parent to refresh data
        window.location.reload()
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
  
  
  // Future steps (for right column) - includes overdue steps but excludes today's steps
  const futureSteps = dailySteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate.getTime() !== today.getTime() // Proper date comparison
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
              {sortedFutureSteps.map((step) => {
                const goal = goals.find(g => g.id === step.goal_id)
                const stepDate = new Date(step.date)
                stepDate.setHours(0, 0, 0, 0)
                const today = getToday()
                
                // Calculate days until step or days overdue
                const daysDiff = Math.ceil((stepDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                let daysText = ''
                let isOverdue = false
                
                if (daysDiff < 0) {
                  // Overdue
                  isOverdue = true
                  const daysOverdue = Math.abs(daysDiff)
                  daysText = `${daysOverdue} dní zpožděno`
                } else if (daysDiff === 1) {
                  // Tomorrow
                  daysText = 'Zítra'
                } else {
                  // Future
                  daysText = `Za ${daysDiff} dní`
                }
                
                const isSelected = selectedStep && selectedStep.id === step.id
                
                return (
                  <div 
                    key={step.id} 
                    onClick={() => handleStepEdit(step)}
                    className={`rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200 hover:shadow-md relative ${
                      isOverdue 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-gray-50 border border-gray-200'
                    } ${isSelected ? 'ring-2 ring-primary-500 ring-opacity-50 shadow-lg' : ''}`}
                  >
                    {/* Footprints icon for future steps */}
                    <div className={`absolute -left-2 top-1/2 -translate-y-1/2 opacity-70 ${
                      isOverdue ? 'text-red-400' : 'text-gray-400'
                    }`}>
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
                        <p className={`text-xs font-medium mt-1 ${
                          isOverdue ? 'text-red-500' : 'text-primary-500'
                        }`}>
                          {daysText}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStepComplete(step.id)
                          }}
                          className={`px-3 py-1 text-white rounded-lg hover:opacity-80 transition-colors text-xs font-medium ${
                            isOverdue ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'
                          }`}
                        >
                          ✓
                        </button>
                        {onStepPostpone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onStepPostpone(step.id)
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs font-medium"
                            title="Odložit na zítra"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
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
})