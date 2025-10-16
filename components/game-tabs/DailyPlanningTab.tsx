'use client'

import { useState, useEffect, memo } from 'react'
import { Goal, Value, DailyStep, Event, UserSettings, DailyPlanning, UserStreak } from '@/lib/cesta-db'
import { CheckCircle, Clock, Target, BookOpen, Lightbulb, Calendar, Zap, Footprints, Plus, Circle, Star, TrendingUp, AlertCircle } from 'lucide-react'
import { getToday, getTodayString, formatDateForInput } from '@/lib/utils'
import { UnifiedStepModal } from '../UnifiedStepModal'
import { useTranslations } from '@/lib/use-translations'

interface DailyPlanningTabProps {
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

export const DailyPlanningTab = memo(function DailyPlanningTab({
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
}: DailyPlanningTabProps) {
  const { translations } = useTranslations()
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [dailyPlanning, setDailyPlanning] = useState<DailyPlanning | null>(null)
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null)
  const [stepStats, setStepStats] = useState<{ completed: number, total: number }>({ completed: 0, total: 0 })
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [selectedStepForDetails, setSelectedStepForDetails] = useState<DailyStep | null>(null)
  const [editingStep, setEditingStep] = useState<DailyStep | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlanningMode, setIsPlanningMode] = useState(false)
  const [tempPlannedSteps, setTempPlannedSteps] = useState<string[]>([])
  const [newlyAddedSteps, setNewlyAddedSteps] = useState<DailyStep[]>([])
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null)

  const today = getToday()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [settingsRes, planningRes, statsRes] = await Promise.all([
        fetch('/api/cesta/user-settings'),
        fetch(`/api/cesta/daily-planning?date=${today.toISOString().split('T')[0]}`),
        fetch('/api/cesta/user-stats')
      ])

      const [settingsData, planningData, statsData] = await Promise.all([
        settingsRes.json(),
        planningRes.json(),
        statsRes.json()
      ])

      setUserSettings(settingsData.settings)
      setDailyPlanning(planningData.planning)
      setUserStreak(statsData.streak)
      setStepStats(statsData.stepStats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get all incomplete steps up to today (including today and overdue)
  const allIncompleteSteps = dailySteps.filter(step => {
    if (step.completed) return false
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate <= today
  })

  // Get planned steps for today
  const plannedStepIds = dailyPlanning?.planned_steps || []
  const completedStepIds = dailyPlanning?.completed_steps || []
  const plannedSteps = dailySteps.filter(step => plannedStepIds.includes(step.id))
  const completedPlannedSteps = dailySteps.filter(step => completedStepIds.includes(step.id))
  
  // Get temp planned steps for planning mode (remove duplicates by id)
  const allSteps = [...dailySteps, ...newlyAddedSteps]
  const uniqueSteps = allSteps.reduce((acc, step) => {
    if (!acc.find(s => s.id === step.id)) {
      acc.push(step)
    }
    return acc
  }, [] as DailyStep[])
  const tempPlannedStepsData = uniqueSteps.filter(step => tempPlannedSteps.includes(step.id))
  
  // Get available steps for planning (not completed, not already planned, up to today)
  const allAvailableSteps = [...allIncompleteSteps, ...newlyAddedSteps]
  const uniqueAvailableSteps = allAvailableSteps.reduce((acc, step) => {
    if (!acc.find(s => s.id === step.id)) {
      acc.push(step)
    }
    return acc
  }, [] as DailyStep[])
  const availableSteps = uniqueAvailableSteps.filter(step => 
    isPlanningMode 
      ? !tempPlannedSteps.includes(step.id) 
      : !plannedStepIds.includes(step.id)
  )

  // Check if user needs to plan their day - only show planning if no planning exists for today
  const needsPlanning = !dailyPlanning
  const hasEnoughSteps = plannedStepIds.length >= (userSettings?.daily_steps_count || 3)
  const totalPlannedSteps = plannedStepIds.length + completedStepIds.length
  const allPlannedStepsCompleted = totalPlannedSteps > 0 && completedStepIds.length === totalPlannedSteps
  const shouldShowPlanning = needsPlanning && !isLoading

  // Auto-show planning mode if user needs to plan (but don't reset if already in planning mode)
  useEffect(() => {
    if (needsPlanning && !isPlanningMode && !isLoading) {
      setIsPlanningMode(true)
      setTempPlannedSteps(plannedStepIds)
    }
  }, [needsPlanning, isPlanningMode, isLoading])

  const handleAddStepToPlanning = async (stepId: string) => {
    if (!dailyPlanning) return

    const newPlannedSteps = [...plannedStepIds, stepId]
    
    try {
      const response = await fetch('/api/cesta/daily-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today.toISOString().split('T')[0],
          planned_steps: newPlannedSteps
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDailyPlanning(data.planning)
      }
    } catch (error) {
      console.error('Error adding step to planning:', error)
    }
  }

  const handleAddStepToTempPlanning = (stepId: string) => {
    if (!tempPlannedSteps.includes(stepId)) {
      setTempPlannedSteps(prev => [...prev, stepId])
    }
  }

  const handleRemoveStepFromTempPlanning = (stepId: string) => {
    setTempPlannedSteps(prev => prev.filter(id => id !== stepId))
  }

  const handleStartPlanning = () => {
    setIsPlanningMode(true)
    setTempPlannedSteps(plannedStepIds)
  }

  const handleCancelPlanning = () => {
    setIsPlanningMode(false)
    setTempPlannedSteps([])
  }

  const handleSavePlanning = async () => {
    setIsSavingPlan(true)
    try {
      const response = await fetch('/api/cesta/daily-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today.toISOString().split('T')[0],
          planned_steps: tempPlannedSteps
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDailyPlanning(data.planning)
        setIsPlanningMode(false)
        setTempPlannedSteps([])
        // Don't clear newlyAddedSteps yet - wait for data refresh
        await fetchData() // Refresh data first
        // Only clear newlyAddedSteps after successful data refresh
        setNewlyAddedSteps([])
        // Force exit planning mode after successful save
        setIsPlanningMode(false)
      }
    } catch (error) {
      console.error('Error saving planning:', error)
    } finally {
      setIsSavingPlan(false)
    }
  }

  const handleSkipToday = async () => {
    setIsSavingPlan(true)
    try {
      // Create empty planning for today to mark it as "skipped"
      const response = await fetch('/api/cesta/daily-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today.toISOString().split('T')[0],
          planned_steps: []
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDailyPlanning(data.planning)
        setIsPlanningMode(false)
        setTempPlannedSteps([])
        // Don't clear newlyAddedSteps yet - wait for data refresh
        await fetchData() // Refresh data first
        // Only clear newlyAddedSteps after successful data refresh
        setNewlyAddedSteps([])
      }
    } catch (error) {
      console.error('Error skipping today:', error)
    } finally {
      setIsSavingPlan(false)
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    setDraggedStepId(stepId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedStepId && !tempPlannedSteps.includes(draggedStepId)) {
      handleAddStepToTempPlanning(draggedStepId)
    }
    setDraggedStepId(null)
  }

  const handleDragEnd = () => {
    setDraggedStepId(null)
  }

  const handleRemoveStepFromPlanning = async (stepId: string) => {
    if (!dailyPlanning) return

    const newPlannedSteps = plannedStepIds.filter(id => id !== stepId)
    
    try {
      const response = await fetch('/api/cesta/daily-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today.toISOString().split('T')[0],
          planned_steps: newPlannedSteps
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDailyPlanning(data.planning)
      }
    } catch (error) {
      console.error('Error removing step from planning:', error)
    }
  }

  const handleStepComplete = async (stepId: string) => {
    try {
      console.log('Completing step:', stepId)
      
      // Mark step as completed in daily_steps table
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          completed: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error completing step:', errorData)
        throw new Error(`Failed to complete step: ${errorData.error}`)
      }

      // Mark step as completed in daily planning
      if (plannedStepIds.includes(stepId)) {
        await fetch('/api/cesta/daily-planning', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: today.toISOString().split('T')[0],
            step_id: stepId
          })
        })
      }

      // Update streak
      await fetch('/api/cesta/user-stats', { method: 'POST' })

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error completing step:', error)
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
        
        // Add the new step to newlyAddedSteps immediately
        setNewlyAddedSteps(prev => [...prev, result.step])
        
        // Add to planning if we need more steps
        if (needsPlanning) {
          if (isPlanningMode) {
            // In planning mode, add to temp planned steps
            setTempPlannedSteps(prev => [...prev, result.step.id])
          } else {
            // In normal mode, add to actual planning
            await handleAddStepToPlanning(result.step.id)
          }
        }
        // Update streak
        await fetch('/api/cesta/user-stats', { method: 'POST' })
        setShowAddStepModal(false)
      }
    } catch (error) {
      console.error('Error adding step:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám denní plánování...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header with stats */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-100">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Denní plánování</h2>
              <p className="text-sm text-gray-600">Naplánujte si kroky na dnešek</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">{userStreak?.current_streak || 0}</span>
              </div>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-semibold">{stepStats.completed}/{stepStats.total}</span>
              </div>
              <p className="text-xs text-gray-500">Splněno</p>
            </div>
          </div>
        </div>

        {/* Planning status - minimalized */}
        {needsPlanning && (
          <div className="bg-primary-50/30 border border-primary-200/50 rounded-lg px-4 py-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Vyberte {userSettings?.daily_steps_count || 3} kroky pro dnešek
                </span>
              </div>
              <span className="text-sm font-medium text-primary-600">
                {plannedStepIds.length}/{userSettings?.daily_steps_count || 3}
              </span>
            </div>
          </div>
        )}

        {hasEnoughSteps && !allPlannedStepsCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-800">Denní plán je připraven</h3>
                <p className="text-xs text-green-700">
                  Máte naplánováno {plannedStepIds.length} kroků na dnešek
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-green-800">
                  ✓ {completedStepIds.length}/{totalPlannedSteps}
                </span>
              </div>
            </div>
          </div>
        )}

        {allPlannedStepsCompleted && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-4">
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-bold text-green-800 mb-2">Skvělá práce!</h3>
              <p className="text-sm text-green-700 mb-4">
                Dokončil jsi všechny kroky z dnešního plánu. Teď si můžeš odpočinout!
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
                <div className="flex items-center space-x-1">
                  <span>💆‍♀️</span>
                  <span>Odpočiň si</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>☕</span>
                  <span>Dej si čaj</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📚</span>
                  <span>Přečti si</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🎵</span>
                  <span>Poslouchej hudbu</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🚶‍♂️</span>
                  <span>Jdi na procházku</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🧘‍♀️</span>
                  <span>Medituj</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Planning Modal - only show if user needs to plan */}
          {shouldShowPlanning && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center z-50 p-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-primary-300" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                <div className="p-8 flex-1 overflow-y-auto" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 69, 19, 0.15) 1px, transparent 0)', backgroundSize: '20px 20px'}}>
                {/* Header with controls */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-primary-400" style={{borderStyle: 'dashed'}}>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-900" style={{fontFamily: 'serif', textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>📔 Denní plánovač</h3>
                    <p className="text-sm text-primary-700 mt-2 font-medium">
                      {tempPlannedSteps.length} z {userSettings?.daily_steps_count || 3} kroků vybráno
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSkipToday}
                      disabled={isSavingPlan}
                      className="px-5 py-2 text-primary-700 hover:text-primary-900 hover:bg-primary-100 border border-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      style={{fontFamily: 'serif', borderRadius: '0'}}
                    >
                      ✏️ Přeskočit
                    </button>
                    <button
                      onClick={handleSavePlanning}
                      disabled={isSavingPlan}
                      className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      style={{fontFamily: 'serif', borderRadius: '0', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}
                    >
                      {isSavingPlan ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Ukládám...</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Uložit plán</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Warning if too many steps */}
                {tempPlannedSteps.length > (userSettings?.daily_steps_count || 3) && (
                  <div className="bg-primary-100 border-2 border-primary-400 p-4 mb-6" style={{borderStyle: 'dashed', borderRadius: '0'}}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h4 className="text-sm font-bold text-primary-900" style={{fontFamily: 'serif'}}>Pozor - hodně kroků!</h4>
                        <p className="text-xs text-primary-800 font-medium">
                          Máte vybráno {tempPlannedSteps.length} kroků, doporučujeme {userSettings?.daily_steps_count || 3}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Single table layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Selected Steps Column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary-100 border-2 border-primary-400" style={{borderStyle: 'dashed', borderRadius: '0'}}>
                      <div>
                        <h4 className="text-lg font-bold text-primary-900" style={{fontFamily: 'serif'}}>
                          📝 Vybráno pro dnešek
                        </h4>
                        <p className="text-sm text-primary-800 mt-1 font-medium">
                          {tempPlannedSteps.length} kroků vybráno
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddStepModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors font-bold"
                        style={{fontFamily: 'serif', borderRadius: '0', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}
                      >
                        <span>+</span>
                        <span>Nový</span>
                      </button>
                    </div>
                    <div 
                      className="min-h-[300px] border-2 border-dashed border-primary-400 p-6 bg-primary-50 transition-colors"
                      style={{borderRadius: '0'}}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {tempPlannedStepsData.length > 0 ? (
                        <div className="space-y-3">
                          {tempPlannedStepsData.map((step) => {
                            const goal = goals.find(g => g.id === step.goal_id)
                            const stepDate = new Date(step.date)
                            stepDate.setHours(0, 0, 0, 0)
                            const isOverdue = stepDate < today
                            
                            return (
                              <div
                                key={step.id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-primary-200 hover:border-primary-300 hover:shadow-md transition-all"
                              >
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 text-sm mb-1">{step.title}</h5>
                                  {step.description && (
                                    <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                                  )}
                                  {goal && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      {goal.icon && `${goal.icon} `}{goal.title}
                                    </p>
                                  )}
                                  {isOverdue && (
                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                      Zpožděno
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveStepFromTempPlanning(step.id)}
                                  className="ml-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                                  title="Odebrat z plánu"
                                >
                                  <Circle className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-primary-600">
                          <div className="text-4xl mb-4">📝</div>
                          <p className="text-lg font-bold mb-3 text-primary-800" style={{fontFamily: 'serif'}}>Přetáhněte kroky sem</p>
                          <p className="text-sm text-primary-700 font-medium">nebo klikněte na dostupné kroky</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Steps Column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary-100 border-2 border-primary-400" style={{borderStyle: 'dashed', borderRadius: '0'}}>
                      <div>
                        <h4 className="text-lg font-bold text-primary-900" style={{fontFamily: 'serif'}}>
                          📋 Dostupné kroky
                        </h4>
                        <p className="text-sm text-primary-800 mt-1 font-medium">
                          {availableSteps.length} kroků k dispozici
                        </p>
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                      {availableSteps.map((step) => {
                        const goal = goals.find(g => g.id === step.goal_id)
                        const stepDate = new Date(step.date)
                        stepDate.setHours(0, 0, 0, 0)
                        const isOverdue = stepDate < today
                        const isToday = stepDate.getTime() === today.getTime()
                        
                        return (
                          <div
                            key={step.id}
                            className={`p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md transition-all cursor-pointer ${
                              isOverdue ? 'bg-red-50 border-red-200' : isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                            } ${draggedStepId === step.id ? 'opacity-50' : ''}`}
                            onClick={() => handleAddStepToTempPlanning(step.id)}
                            draggable
                            onDragStart={(e) => handleDragStart(e, step.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 text-sm mb-1">{step.title}</h5>
                                {step.description && (
                                  <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                                )}
                                {goal && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    {goal.icon && `${goal.icon} `}{goal.title}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2">
                                  {isOverdue && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                      Zpožděno
                                    </span>
                                  )}
                                  {isToday && !isOverdue && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                      Dnes
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-3">
                                <div className="w-4 h-4 flex flex-col space-y-0.5">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                </div>
                                <Plus className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Normal Mode - Planned Steps for Today */}
          {!shouldShowPlanning && (
            <>
              {/* Normal Mode - Planned Steps for Today */}
              <div className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {plannedSteps.length > 0 || completedStepIds.length > 0
                      ? `Dnešní kroky (${completedStepIds.length}/${plannedStepIds.length + completedStepIds.length})`
                      : 'Dnešní kroky'
                    }
                  </h3>
                  <div className="flex space-x-2">
                    {shouldShowPlanning && (
                      <button
                        onClick={handleStartPlanning}
                        className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                      >
                        <Target className="w-4 h-4" />
                        <span>Plánovat den</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddStepModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Přidat krok</span>
                    </button>
                  </div>
                </div>

            {plannedSteps.length > 0 || allPlannedStepsCompleted ? (
              <div className="grid gap-3">
                {plannedSteps.map((step) => {
                  const goal = goals.find(g => g.id === step.goal_id)
                  const stepDate = new Date(step.date)
                  stepDate.setHours(0, 0, 0, 0)
                  const isOverdue = stepDate < today
                  
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        step.completed
                          ? 'bg-green-50 border-green-200'
                          : isOverdue
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <button
                              onClick={() => handleStepComplete(step.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                step.completed
                                  ? 'bg-green-500 text-white'
                                  : 'border-2 border-gray-300 hover:border-primary-500'
                              }`}
                            >
                              {step.completed && <CheckCircle className="w-4 h-4" />}
                            </button>
                            <h4 className={`font-medium ${step.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {step.title}
                            </h4>
                            {isOverdue && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                Zpožděno
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          )}
                          {goal && (
                            <p className="text-xs text-gray-500">
                              {goal.icon && `${goal.icon} `}{goal.title}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveStepFromPlanning(step.id)}
                          className="ml-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Odebrat z dnešního plánu"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Žádné naplánované kroky</h3>
                <p className="text-xs text-gray-600 mb-4">Přidejte kroky pro dnešek</p>
                <button
                  onClick={() => setShowAddStepModal(true)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                >
                  Přidat první krok
                </button>
              </div>
            )}
          </div>

              {/* Available Steps for Planning - show when planning needed or all steps completed */}
              {(shouldShowPlanning || allPlannedStepsCompleted) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {shouldShowPlanning ? 'Dostupné kroky' : 'Další dostupné kroky'} ({availableSteps.length})
                  </h3>
                  
                  {availableSteps.length > 0 ? (
                    <div className="grid gap-3">
                      {availableSteps.slice(0, 10).map((step) => {
                      const goal = goals.find(g => g.id === step.goal_id)
                      const stepDate = new Date(step.date)
                      stepDate.setHours(0, 0, 0, 0)
                      const isOverdue = stepDate < today
                      const isToday = stepDate.getTime() === today.getTime()
                      
                      return (
                        <div
                          key={step.id}
                          className={`p-4 rounded-lg border border-gray-200 hover:border-primary-300 transition-all duration-200 ${
                            isOverdue ? 'bg-red-50' : isToday ? 'bg-blue-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">{step.title}</h4>
                                {isOverdue && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                    Zpožděno
                                  </span>
                                )}
                                {isToday && !isOverdue && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Dnes
                                  </span>
                                )}
                              </div>
                              {step.description && (
                                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                              )}
                              {goal && (
                                <p className="text-xs text-gray-500">
                                  {goal.icon && `${goal.icon} `}{goal.title}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {isOverdue ? 'Zpožděno' : isToday ? 'Dnešní datum' : 'Budoucí datum'}: {new Date(step.date).toLocaleDateString('cs-CZ')}
                              </p>
                            </div>
                            {needsPlanning && (
                              <button
                                onClick={() => handleAddStepToPlanning(step.id)}
                                className="ml-4 px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                              >
                                Přidat
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-3">📝</div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Žádné dostupné kroky</h3>
                      <p className="text-xs text-gray-600 mb-4">Všechny kroky jsou již naplánované nebo dokončené</p>
                      <button
                        onClick={() => setShowAddStepModal(true)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                      >
                        Vytvořit nový krok
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <UnifiedStepModal
          isOpen={showAddStepModal}
          onClose={() => setShowAddStepModal(false)}
          onSave={handleAddStep}
          goals={goals}
          width="medium"
        />
      )}
    </div>
  )
})

export default DailyPlanningTab
