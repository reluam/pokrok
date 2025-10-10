'use client'

import { useState, memo, useRef, useEffect } from 'react'
import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { CheckCircle, Clock, Target, BookOpen, Lightbulb, Calendar, Zap, Footprints, Plus, Circle } from 'lucide-react'
import { getToday, getTodayString, formatDateForInput } from '@/lib/utils'

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
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isAddingStep, setIsAddingStep] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedStepForDetails, setSelectedStepForDetails] = useState<DailyStep | null>(null)
  
  // Ref for detecting clicks outside the form
  const formRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the form to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (isExpanded && !newStepTitle.trim()) {
          // Only close if there's no text entered
          setIsExpanded(false)
          setNewStepDescription('')
          setSelectedGoalId(null)
        }
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded, newStepTitle])

  // Calculate today's date for filtering (local time)
  const getToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  const today = getToday()

  // Initialize selected date to today
  const todayString = getTodayString()
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayString)
    }
  }, [selectedDate, todayString])

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
          goalId: selectedGoalId,
          title: newStepTitle.trim(),
          description: newStepDescription.trim() || undefined,
          date: selectedDate
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (onStepUpdate) {
          onStepUpdate(data.step)
        }
        setNewStepTitle('')
        setNewStepDescription('')
        setSelectedGoalId(null)
        setSelectedDate(todayString)
        setIsExpanded(false)
      } else {
        const error = await response.json()
        console.error('Error adding step:', error)
        alert(`Chyba při přidávání kroku: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error adding step:', error)
      alert('Chyba při přidávání kroku')
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
          <div ref={formRef} className="relative">
            {/* Collapsed state - button to open modal */}
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full px-4 py-2 rounded-full bg-gray-50 border border-gray-200 hover:bg-white hover:border-primary-300 hover:ring-2 hover:ring-primary-500 hover:border-transparent transition-all duration-200 subtle-cursor text-left"
              >
                <span className="text-gray-500">Přidat nový krok</span>
              </button>
            )}
            
            {/* Expanded Options - Connected modal */}
            {isExpanded && (
              <div className="bg-white rounded-2xl border border-primary-300 shadow-xl transition-all duration-300 animate-in slide-in-from-top-2">
                {/* Input Field - Same size as collapsed */}
                <div className="px-4 py-2">
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-full bg-transparent border-0 focus:ring-0 focus:outline-none transition-all duration-200"
                    placeholder="Přidat nový krok"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                  />
                </div>
                
                {/* Expanded Options */}
                <div className="border-t border-gray-100 px-4 pb-4">
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Popis (volitelné)
                      </label>
                      <textarea
                        value={newStepDescription}
                        onChange={(e) => setNewStepDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-0 focus:outline-none focus:border-primary-300 rounded-lg transition-colors"
                        rows={2}
                        placeholder="Popište krok podrobněji..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Přiřadit k cíli (volitelné)
                        </label>
                        <select
                          value={selectedGoalId || ''}
                          onChange={(e) => setSelectedGoalId(e.target.value || null)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-0 focus:outline-none focus:border-primary-300 rounded-lg transition-colors"
                        >
                          <option value="">Bez přiřazení k cíli</option>
                          {goals.filter(goal => goal.status === 'active').map((goal) => (
                            <option key={goal.id} value={goal.id}>
                              {goal.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Datum
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-0 focus:outline-none focus:border-primary-300 rounded-lg transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={handleAddStep}
                        disabled={!newStepTitle.trim() || isAddingStep}
                        className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
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
                      
                      <button
                        onClick={() => {
                          setIsExpanded(false)
                          setNewStepTitle('')
                          setNewStepDescription('')
                          setSelectedGoalId(null)
                          setSelectedDate(todayString)
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Zrušit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                    className={`p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                      step.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-primary-50 border-primary-200'
                    }`}
                    onClick={() => setSelectedStepForDetails(step)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Footprints className={`w-5 h-5 ${step.completed ? 'text-green-500' : 'text-primary-500'}`} />
                      </div>
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
                      <div className="flex space-x-2">
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
                          {step.completed ? 'Vrátit' : 'Hotovo'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStepForDetails(step)
                          }}
                          className="px-3 py-1 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  handleStepComplete(selectedStepForDetails.id)
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
