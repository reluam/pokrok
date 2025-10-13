'use client'

import { useState, useEffect, memo } from 'react'
import { UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Goal, Value, DailyStep, Event, Automation } from '@/lib/cesta-db'
import { GameCenter } from './GameCenter'
import { DailyCheckIn } from './DailyCheckIn'
import { NewGoalOnboarding } from './NewGoalOnboarding'
import { GoalDetailModal } from './GoalDetailModal'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePageContext } from './PageContext'
import { getIconComponent, getIconEmoji } from '@/lib/icon-utils'
import { useTranslations } from '@/lib/use-translations'
import { UnifiedStepModal } from './UnifiedStepModal'

export const MainDashboard = memo(function MainDashboard() {
  const router = useRouter()
  const { setTitle, setSubtitle } = usePageContext()
  const { translations } = useTranslations()
  const [goals, setGoals] = useState<Goal[]>([])
  const [values, setValues] = useState<Value[]>([])
  const [dailySteps, setDailySteps] = useState<DailyStep[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showGoalOnboarding, setShowGoalOnboarding] = useState(false)
  const [showGoalDetails, setShowGoalDetails] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepDescription, setNewStepDescription] = useState('')
  const [isAddingStep, setIsAddingStep] = useState(false)
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressValue, setProgressValue] = useState('')
  const [showEditGoalModal, setShowEditGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedStep, setSelectedStep] = useState<DailyStep | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [expandedColumn, setExpandedColumn] = useState<'goals' | 'steps' | null>(null)
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [selectedGoalForStep, setSelectedGoalForStep] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Listen for storage changes to sync values across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cesta-values-updated') {
        fetchData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, valuesRes, stepsRes, eventsRes, automationsRes] = await Promise.all([
        fetch('/api/cesta/goals'),
        fetch('/api/cesta/values'),
        fetch('/api/cesta/daily-steps'), // Načteme všechny kroky, ne jen dnešní
        fetch('/api/cesta/smart-events'), // Načteme smart events
        fetch('/api/cesta/automations')
      ])

      const [goalsData, valuesData, stepsData, eventsData, automationsData] = await Promise.all([
        goalsRes.json(),
        valuesRes.json(),
        stepsRes.json(),
        eventsRes.json(),
        automationsRes.json()
      ])

      setGoals(goalsData.goals)
      setValues(valuesData.values)
      setDailySteps(stepsData.steps || [])
      setEvents(eventsData.events || [])
      setAutomations(automationsData?.automations || [])
      
      console.log('Data loaded successfully')
      
      // Update page title and subtitle
      setTitle(translations?.app.mainDashboard || 'Hlavní panel')
      setSubtitle(`${goalsData.goals.length} ${translations?.app.goals || 'cílů'}, ${(stepsData.steps || []).length} ${translations?.app.steps || 'kroků'}`)
      
      // Update selectedGoal if it's currently open
      if (selectedGoal) {
        const updatedSelectedGoal = goalsData.goals.find((goal: Goal) => goal.id === selectedGoal.id)
        if (updatedSelectedGoal) {
          setSelectedGoal(updatedSelectedGoal)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepComplete = async (stepId: string) => {
    try {
      // Set loading state for this specific step
      setDailySteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, isCompleting: true }
            : step
        )
      )
      
      await fetch(`/api/cesta/daily-steps/${stepId}/complete`, {
        method: 'PATCH'
      })
      
      // Update daily steps
      setDailySteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, completed: true, completed_at: new Date(), isCompleting: false }
            : step
        )
      )
      
      // Update goals to refresh progress
      setGoals(prev => 
        prev.map(goal => {
          // Find the step to get its goal_id
          const step = dailySteps.find(s => s.id === stepId)
          if (step && step.goal_id === goal.id) {
            // For steps-based goals, we need to recalculate progress
            if (goal.progress_type === 'steps') {
              const allStepsForGoal = dailySteps.filter(s => s.goal_id === goal.id)
              const completedSteps = allStepsForGoal.filter(s => s.id === stepId ? true : s.completed).length
              const totalSteps = allStepsForGoal.length
              const newProgressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
              
              return {
                ...goal,
                progress_percentage: newProgressPercentage
              }
            }
          }
          return goal
        })
      )
    } catch (error) {
      console.error('Error completing step:', error)
      // Remove loading state on error
      setDailySteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, isCompleting: false }
            : step
        )
      )
    }
  }

  const handleAddStep = (goalId: string) => {
    setSelectedGoalForStep(goalId)
    setShowAddStepModal(true)
  }

  const handleSaveStep = async (stepData: any) => {
    try {
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: selectedGoalForStep,
          ...stepData
        })
      })
      
      if (response.ok) {
        await fetchData() // Refresh data
        setShowAddStepModal(false)
        setSelectedGoalForStep(null)
      }
    } catch (error) {
      console.error('Error adding step:', error)
    }
  }

  const handleStepAdd = async (
    goalId: string, 
    title: string, 
    description: string, 
    date: Date, 
    isImportant: boolean, 
    isUrgent: boolean,
    stepType: 'update' | 'revision' | 'custom' = 'update',
    customTypeName?: string,
    frequency: 'daily' | 'weekly' | 'monthly' = 'daily',
    frequencyTime?: string,
    updateProgressType?: 'percentage' | 'count' | 'amount',
    updateValue?: number,
    updateUnit?: string
  ) => {
    try {
      // Convert date to local date string (YYYY-MM-DD)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const localDateString = `${year}-${month}-${day}`
      
      console.log('Adding step with data:', { goalId, title, description, date: localDateString, isImportant, isUrgent, stepType, customTypeName, frequency, frequencyTime })
      
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          title,
          description,
          date: localDateString,
          isImportant,
          isUrgent,
          stepType,
          customTypeName,
          frequency,
          frequencyTime,
          updateProgressType,
          updateValue,
          updateUnit
        })
      })
      
      if (response.ok) {
        const newStep = await response.json()
        setDailySteps(prev => [...prev, newStep.step])
        
        // Update goals to refresh progress for steps-based goals
        setGoals(prev => 
          prev.map(goal => {
            if (goal.id === goalId && goal.progress_type === 'steps') {
              const allStepsForGoal = [...dailySteps, newStep.step].filter(s => s.goal_id === goal.id)
              const completedSteps = allStepsForGoal.filter(s => s.completed).length
              const totalSteps = allStepsForGoal.length
              const newProgressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
              
              return {
                ...goal,
                progress_percentage: newProgressPercentage
              }
            }
            return goal
          })
        )
        
        console.log('Step added successfully:', newStep)
      } else {
        const errorData = await response.json()
        console.error('Error adding step:', errorData)
      }
    } catch (error) {
      console.error('Error adding step:', error)
    }
  }

  const handleStepPostpone = async (stepId: string) => {
    try {
      const response = await fetch(`/api/cesta/daily-steps/${stepId}/postpone`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        // Update local state immediately
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        
        setDailySteps(prev => prev.map(step => 
          step.id === stepId 
            ? { ...step, date: tomorrow }
            : step
        ))
        
        // Also refresh data to ensure consistency
        await fetchData()
      } else {
        const errorData = await response.json()
        console.error('Error postponing step:', errorData)
      }
    } catch (error) {
      console.error('Error postponing step:', error)
    }
  }

  const handleEventComplete = async (eventId: string) => {
    try {
      const response = await fetch('/api/cesta/smart-events/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactionId: eventId })
      })
      
      if (response.ok) {
        // Update local state immediately
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, completed: true, completed_at: new Date() }
            : event
        ))
        
        // Also refresh data to ensure consistency
        await fetchData()
      } else {
        const errorData = await response.json()
        console.error('Error completing event:', errorData)
      }
    } catch (error) {
      console.error('Error completing event:', error)
    }
  }

  const handleEventPostpone = async (eventId: string) => {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const response = await fetch('/api/cesta/smart-events/postpone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          interactionId: eventId,
          postponedTo: tomorrow.toISOString().split('T')[0]
        })
      })
      
      if (response.ok) {
        // Update local state immediately - remove from today's events
        setEvents(prev => prev.filter(event => event.id !== eventId))
        
        // Also refresh data to ensure consistency
        await fetchData()
      } else {
        const errorData = await response.json()
        console.error('Error postponing event:', errorData)
      }
    } catch (error) {
      console.error('Error postponing event:', error)
    }
  }

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
    setSelectedStep(null) // Clear selected step when selecting event
  }

  const handleGoalOnboardingComplete = async (goalData: any) => {
    console.log('Frontend: Starting goal creation with data:', goalData)
    setIsSubmittingGoal(true)
    
    try {
      const response = await fetch('/api/cesta/goals-with-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      })
      
      console.log('Frontend: API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Frontend: Goal created successfully:', data)
        setGoals(prev => [...prev, data.goal])
        setDailySteps(prev => [...prev, ...data.steps])
        setShowGoalOnboarding(false)
        
        // Refresh data to ensure all changes are reflected
        console.log('Frontend: Refreshing data...')
        fetchData()
      } else {
        const errorData = await response.json()
        console.error('Frontend: API error:', errorData)
      }
    } catch (error) {
      console.error('Frontend: Error adding goal:', error)
    } finally {
      setIsSubmittingGoal(false)
    }
  }

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowGoalDetails(true)
  }

  const handleGoalUpdate = async (updatedGoal: Goal) => {
    try {
      // Prepare goal data for API
      const goalData = {
        title: updatedGoal.title,
        description: updatedGoal.description,
        targetDate: updatedGoal.target_date ? 
          (typeof updatedGoal.target_date === 'string' ? 
            new Date(updatedGoal.target_date) : 
            updatedGoal.target_date
          ) : null,
        priority: updatedGoal.priority,
        status: updatedGoal.status
      }

      // First update basic goal info
      const response = await fetch(`/api/cesta/goals/${updatedGoal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      })
      
      if (response.ok) {
        // Update progress using combined formula (50% metrics + 50% steps)
        await fetch(`/api/cesta/goals/${updatedGoal.id}/progress-combined`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        // Refresh data to ensure all changes are reflected
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleGoalDelete = async (goalId: string) => {
    try {
      const response = await fetch(`/api/cesta/goals/${goalId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId))
        setShowGoalDetails(false)
        setSelectedGoal(null)
        
        // Refresh data to ensure all changes are reflected
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleStepSelect = (step: DailyStep) => {
    if (selectedStep && selectedStep.id === step.id) {
      // If clicking the same step, deselect it
      setSelectedStep(null)
    } else {
      // Select the new step
      setSelectedStep(step)
      setSelectedEvent(null) // Clear selected event when selecting step
    }
  }


  const handleValueUpdate = (updatedValue: Value) => {
    setValues(prev => {
      const existing = prev.find(value => value.id === updatedValue.id)
      if (existing) {
        return prev.map(value => value.id === updatedValue.id ? updatedValue : value)
      } else {
        return [...prev, updatedValue]
      }
    })
  }

  const handleStepUpdate = (updatedStep: DailyStep) => {
    setDailySteps(prev => {
      const existing = prev.find(step => step.id === updatedStep.id)
      if (existing) {
        return prev.map(step => step.id === updatedStep.id ? updatedStep : step)
      } else {
        return [...prev, updatedStep]
      }
    })
  }

  const handleValueDelete = (valueId: string) => {
    setValues(prev => prev.filter(value => value.id !== valueId))
  }


  const handleStepToggle = async (stepId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/cesta/daily-steps/${stepId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      })
      
      if (response.ok) {
        // Update daily steps
        setDailySteps(prev => prev.map(step => 
          step.id === stepId ? { ...step, completed, completed_at: completed ? new Date() : undefined } : step
        ))
        
        // Update goals to refresh progress
        setGoals(prev => 
          prev.map(goal => {
            // Find the step to get its goal_id
            const step = dailySteps.find(s => s.id === stepId)
            if (step && step.goal_id === goal.id) {
              // For steps-based goals, we need to recalculate progress
              if (goal.progress_type === 'steps') {
                const allStepsForGoal = dailySteps.filter(s => s.goal_id === goal.id)
                const completedSteps = allStepsForGoal.filter(s => s.id === stepId ? completed : s.completed).length
                const totalSteps = allStepsForGoal.length
                const newProgressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
                
                return {
                  ...goal,
                  progress_percentage: newProgressPercentage
                }
              }
            }
            return goal
          })
        )
      } else {
        console.error('Error toggling step:', await response.text())
      }
    } catch (error) {
      console.error('Error updating step:', error)
    }
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowEditGoalModal(true)
  }

  const handleProgressUpdate = async () => {
    if (!selectedGoal || !progressValue) return

    try {
      const response = await fetch(`/api/cesta/goals/${selectedGoal.id}/update-progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progressType: selectedGoal.progress_type || 'percentage',
          value: parseFloat(progressValue)
        })
      })

      if (response.ok) {
        // Update local state
        setGoals(prev => prev.map(goal => 
          goal.id === selectedGoal.id 
            ? { 
                ...goal, 
                progress_current: parseFloat(progressValue),
                progress_percentage: selectedGoal.progress_type === 'percentage' 
                  ? parseFloat(progressValue) 
                  : selectedGoal.progress_target 
                    ? Math.round((parseFloat(progressValue) / selectedGoal.progress_target) * 100)
                    : 0
              }
            : goal
        ))
        
        setSelectedGoal(prev => prev ? {
          ...prev,
          progress_current: parseFloat(progressValue),
          progress_percentage: prev.progress_type === 'percentage' 
            ? parseFloat(progressValue) 
            : prev.progress_target 
              ? Math.round((parseFloat(progressValue) / prev.progress_target) * 100)
              : 0
        } : null)
        
        setEditingProgress(false)
        setProgressValue('')
        alert('Pokrok byl úspěšně aktualizován!')
      } else {
        const error = await response.json()
        alert(`Chyba při aktualizaci pokroku: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      alert('Chyba při aktualizaci pokroku')
    }
  }

  const handleSaveGoalEdit = async () => {
    if (!editingGoal) return

    try {
      // Use the existing handleGoalUpdate function which handles progress updates
      await handleGoalUpdate(editingGoal)
      
      setShowEditGoalModal(false)
      setEditingGoal(null)
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const getProgressDisplay = (goal: Goal) => {
    const goalSteps = dailySteps.filter(step => step.goal_id === goal.id)
    
    switch (goal.progress_type) {
      case 'count':
        return `${goal.progress_current || 0} / ${goal.progress_target || 0} ${goal.progress_unit || 'krát'}`
      case 'amount':
        return `${(goal.progress_current || 0).toLocaleString()} / ${(goal.progress_target || 0).toLocaleString()} ${goal.progress_unit || 'Kč'}`
      case 'steps':
        const completedSteps = goalSteps.filter(s => s.completed).length
        const totalSteps = goalSteps.length
        return `${completedSteps} / ${totalSteps} kroků`
      default:
        return `${goal.progress_percentage || 0}%`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám vaši cestu...</p>
        </div>
      </div>
    )
  }

  const activeGoals = goals.filter(goal => goal.status === 'active')
  console.log('All goals:', goals)
  console.log('Active goals:', activeGoals)
  const completedSteps = dailySteps.filter(step => step.completed).length
  
  // Calculate overdue steps (not completed and date is before today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueSteps = dailySteps.filter(step => {
    if (step.completed) return false
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate < today
  }).length
  
  // Total steps includes overdue steps
  const totalSteps = dailySteps.length + overdueSteps

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex min-h-0">
                    {/* Left Column - Goals */}
                    <div className={`${expandedColumn === 'goals' ? 'w-full' : 'w-16 lg:w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
                     <div className="p-2 lg:p-6 border-b border-gray-200 flex-shrink-0">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-3">
                         <div className="flex items-center space-x-2">
                           <h2 className="text-xl font-bold text-gray-900 hidden lg:block">Moje cíle</h2>
                           <h2 className="text-lg font-bold text-gray-900 lg:hidden">🎯</h2>
                           <button
                             onClick={() => setExpandedColumn(expandedColumn === 'goals' ? null : 'goals')}
                             className="p-1 hover:bg-gray-100 rounded transition-colors"
                             title={expandedColumn === 'goals' ? 'Zavřít' : 'Rozbalit'}
                           >
                             {expandedColumn === 'goals' ? (
                               <ChevronLeft className="w-4 h-4 text-gray-600" />
                             ) : (
                               <ChevronRight className="w-4 h-4 text-gray-600" />
                             )}
                           </button>
                         </div>
                       </div>
                       <button
                         onClick={() => setShowGoalOnboarding(true)}
                         className="flex items-center space-x-1 bg-primary-500 text-white px-2 lg:px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors text-sm"
                       >
                         <Plus className="w-4 h-4" />
                         <span className="hidden lg:inline">Přidat</span>
                       </button>
                     </div>
                     <p className="text-sm text-gray-600 hidden lg:block">Sledujte svůj pokrok</p>
                   </div>
                  <div className="flex-1 overflow-y-auto p-2 lg:p-6">
                    {expandedColumn === 'goals' ? (
                      // EXPANDOVANÉ ZOBRAZENÍ - Rozdělení cílů podle dlouhodobosti do 3 sloupců
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-2 lg:p-6">
                        
                        {/* KRÁTKODOBÉ CÍLE */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Krátkodobé cíle
                          </h3>
                          <div className="space-y-3">
                            {activeGoals
                              .filter(goal => goal.category === 'short-term')
                              .sort((a, b) => {
                                if (a.target_date && b.target_date) {
                                  const dateA = new Date(a.target_date)
                                  const dateB = new Date(b.target_date)
                                  return dateA.getTime() - dateB.getTime()
                                }
                                return 0
                              })
                              .map((goal, index) => (
                              <div
                                key={goal.id}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
                                onClick={() => handleGoalClick(goal)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                      goal.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : goal.status === 'active'
                                        ? 'bg-primary-500'
                                        : 'bg-gray-400'
                                    }`}>
                                      {goal.status === 'completed' ? '✓' : index + 1}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 text-sm flex items-center space-x-2">
                                        <span>{goal.title}</span>
                                        {goal.icon && (
                                          <span className="text-sm">{getIconEmoji(goal.icon)}</span>
                                        )}
                                      </h4>
                                      {goal.target_date && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <span>📅</span>
                                          <span>
                                            Do: {typeof goal.target_date === 'string' 
                                              ? new Date(goal.target_date).toLocaleDateString('cs-CZ')
                                              : goal.target_date.toLocaleDateString('cs-CZ')
                                            }
                                          </span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {goal.description && (
                                  <p className="text-xs text-gray-600 mb-3">{goal.description}</p>
                                )}
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Pokrok</span>
                                    <span>{getProgressDisplay(goal)}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        goal.status === 'completed' 
                                          ? 'bg-green-500' 
                                          : 'bg-primary-500'
                                      }`}
                                      style={{ width: `${goal.progress_percentage || 0}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {activeGoals.filter(goal => goal.category === 'short-term').length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">Žádné krátkodobé cíle</p>
                            )}
                          </div>
                        </div>

                        {/* STŘEDNĚDOBÉ CÍLE */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Střednědobé cíle
                          </h3>
                          <div className="space-y-3">
                            {activeGoals
                              .filter(goal => goal.category === 'medium-term')
                              .sort((a, b) => {
                                if (a.target_date && b.target_date) {
                                  const dateA = new Date(a.target_date)
                                  const dateB = new Date(b.target_date)
                                  return dateA.getTime() - dateB.getTime()
                                }
                                return 0
                              })
                              .map((goal, index) => (
                              <div
                                key={goal.id}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
                                onClick={() => handleGoalClick(goal)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                      goal.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : goal.status === 'active'
                                        ? 'bg-primary-500'
                                        : 'bg-gray-400'
                                    }`}>
                                      {goal.status === 'completed' ? '✓' : index + 1}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 text-sm flex items-center space-x-2">
                                        <span>{goal.title}</span>
                                        {goal.icon && (
                                          <span className="text-sm">{getIconEmoji(goal.icon)}</span>
                                        )}
                                      </h4>
                                      {goal.target_date && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <span>📅</span>
                                          <span>
                                            Do: {typeof goal.target_date === 'string' 
                                              ? new Date(goal.target_date).toLocaleDateString('cs-CZ')
                                              : goal.target_date.toLocaleDateString('cs-CZ')
                                            }
                                          </span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {goal.description && (
                                  <p className="text-xs text-gray-600 mb-3">{goal.description}</p>
                                )}
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Pokrok</span>
                                    <span>{getProgressDisplay(goal)}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        goal.status === 'completed' 
                                          ? 'bg-green-500' 
                                          : 'bg-primary-500'
                                      }`}
                                      style={{ width: `${goal.progress_percentage || 0}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {activeGoals.filter(goal => goal.category === 'medium-term').length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">Žádné střednědobé cíle</p>
                            )}
                          </div>
                        </div>

                        {/* DLOUHODOBÉ CÍLE */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Dlouhodobé cíle
                          </h3>
                          <div className="space-y-3">
                            {activeGoals
                              .filter(goal => goal.category === 'long-term')
                              .sort((a, b) => {
                                if (a.target_date && b.target_date) {
                                  const dateA = new Date(a.target_date)
                                  const dateB = new Date(b.target_date)
                                  return dateA.getTime() - dateB.getTime()
                                }
                                return 0
                              })
                              .map((goal, index) => (
                              <div
                                key={goal.id}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
                                onClick={() => handleGoalClick(goal)}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                      goal.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : goal.status === 'active'
                                        ? 'bg-primary-500'
                                        : 'bg-gray-400'
                                    }`}>
                                      {goal.status === 'completed' ? '✓' : index + 1}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 text-sm flex items-center space-x-2">
                                        <span>{goal.title}</span>
                                        {goal.icon && (
                                          <span className="text-sm">{getIconEmoji(goal.icon)}</span>
                                        )}
                                      </h4>
                                      {goal.target_date && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                          <span>📅</span>
                                          <span>
                                            Do: {typeof goal.target_date === 'string' 
                                              ? new Date(goal.target_date).toLocaleDateString('cs-CZ')
                                              : goal.target_date.toLocaleDateString('cs-CZ')
                                            }
                                          </span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {goal.description && (
                                  <p className="text-xs text-gray-600 mb-3">{goal.description}</p>
                                )}
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Pokrok</span>
                                    <span>{getProgressDisplay(goal)}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        goal.status === 'completed' 
                                          ? 'bg-green-500' 
                                          : 'bg-primary-500'
                                      }`}
                                      style={{ width: `${goal.progress_percentage || 0}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {activeGoals.filter(goal => goal.category === 'long-term').length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">Žádné dlouhodobé cíle</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // NORMÁLNÍ ZOBRAZENÍ - Seznam cílů ve sloupci
                      <div className="space-y-2 lg:space-y-4">
                        {activeGoals
                          .sort((a, b) => {
                            if (a.target_date && b.target_date) {
                              const dateA = new Date(a.target_date)
                              const dateB = new Date(b.target_date)
                              return dateA.getTime() - dateB.getTime()
                            }
                            if (a.target_date && !b.target_date) return -1
                            if (!a.target_date && b.target_date) return 1
                            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                          })
                          .map((goal, index) => (
                          <div
                            key={goal.id}
                            className="bg-gray-50 rounded-xl p-2 lg:p-4 border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
                            onClick={() => handleGoalClick(goal)}
                          >
                            {/* Desktop view */}
                            <div className="hidden lg:block">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    goal.status === 'completed' 
                                      ? 'bg-green-500' 
                                      : goal.status === 'active'
                                      ? 'bg-primary-500'
                                      : 'bg-gray-400'
                                  }`}>
                                    {goal.status === 'completed' ? '✓' : index + 1}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 text-sm flex items-center space-x-2">
                                      <span>{goal.title}</span>
                                      {goal.icon && (
                                        <span className="text-sm">{getIconEmoji(goal.icon)}</span>
                                      )}
                                    </h3>
                                    {goal.target_date && (
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <span>📅</span>
                                        <span>
                                          Do: {typeof goal.target_date === 'string' 
                                            ? new Date(goal.target_date).toLocaleDateString('cs-CZ')
                                            : goal.target_date.toLocaleDateString('cs-CZ')
                                          }
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {goal.description && (
                                <p className="text-xs text-gray-600 mb-3">{goal.description}</p>
                              )}
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>Pokrok</span>
                                  <span>{getProgressDisplay(goal)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      goal.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : 'bg-primary-500'
                                    }`}
                                    style={{ width: `${goal.progress_percentage || 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Mobile/Tablet view - Icon only */}
                            <div className="lg:hidden flex flex-col items-center space-y-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg ${
                                goal.status === 'completed' 
                                  ? 'bg-green-500' 
                                  : goal.status === 'active'
                                  ? 'bg-primary-500'
                                  : 'bg-gray-400'
                              }`}>
                                {goal.status === 'completed' ? '✓' : (goal.icon ? getIconEmoji(goal.icon) : index + 1)}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    goal.status === 'completed' 
                                      ? 'bg-green-500' 
                                      : 'bg-primary-500'
                                  }`}
                                  style={{ width: `${goal.progress_percentage || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {activeGoals.length === 0 && (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl">🎯</span>
                            </div>
                            <p className="text-gray-500 text-sm">Zatím nemáte žádné cíle</p>
                            <p className="text-gray-400 text-xs mt-1">Přidejte svůj první cíl</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                    {/* Center Column - Game Center */}
                    <div className={`${expandedColumn ? 'hidden' : 'flex-1'} bg-background transition-all duration-300`}>
                      <GameCenter 
                        values={values}
                        dailySteps={dailySteps}
                        events={events}
                        goals={goals}
                        selectedStep={selectedStep}
                        selectedEvent={selectedEvent}
                        onValueUpdate={handleValueUpdate}
                        onGoalUpdate={handleGoalUpdate}
                        onStepUpdate={handleStepUpdate}
                        onEventComplete={handleEventComplete}
                        onEventPostpone={handleEventPostpone}
                      />
                    </div>

                {/* Right Column - Daily Steps */}
                <div className={`${expandedColumn === 'steps' ? 'w-full' : 'w-80'} bg-white border-l border-gray-200 flex flex-col transition-all duration-300`}>
                 <div className="p-6 border-b border-gray-200 flex-shrink-0">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center space-x-3">
                       <button
                         onClick={() => setExpandedColumn(expandedColumn === 'steps' ? null : 'steps')}
                         className="p-1 hover:bg-gray-100 rounded transition-colors"
                         title={expandedColumn === 'steps' ? 'Zavřít' : 'Rozbalit'}
                       >
                         {expandedColumn === 'steps' ? (
                           <ChevronRight className="w-4 h-4 text-gray-600" />
                         ) : (
                           <ChevronLeft className="w-4 h-4 text-gray-600" />
                         )}
                       </button>
                       <h2 className="text-xl font-bold text-gray-900">Další kroky</h2>
                     </div>
                   </div>
                   <p className="text-sm text-gray-600">Co dnes uděláte?</p>
                 </div>
                  <div className="flex-1 overflow-y-auto">
                    {expandedColumn === 'steps' ? (
                      // EXPANDOVANÉ ZOBRAZENÍ - Rozdělení kroků podle stavu do 3 sloupců
                      <div className="grid grid-cols-3 gap-6 h-full p-6">
                        
                        {/* ZPOŽDĚNÉ KROKY */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-red-600 border-b border-red-200 pb-2">
                            Zpožděné kroky ({dailySteps.filter(step => {
                              const stepDate = new Date(step.date)
                              stepDate.setHours(0, 0, 0, 0)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return stepDate < today && !step.completed
                            }).length})
                          </h3>
                          <div className="space-y-3">
                            {dailySteps
                              .filter(step => {
                                const stepDate = new Date(step.date)
                                stepDate.setHours(0, 0, 0, 0)
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                return stepDate < today && !step.completed
                              })
                              .map((step) => {
                                const goal = goals.find(g => g.id === step.goal_id)
                                return (
                                  <div
                                    key={step.id}
                                    className="bg-red-50 border border-red-200 rounded-lg p-3 cursor-pointer hover:bg-red-100 transition-colors"
                                    onClick={() => handleStepSelect(step)}
                                  >
                                    <div className="flex items-start space-x-2">
                                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">!</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                          {step.title}
                                        </h4>
                                        {goal && (
                                          <p className="text-xs text-gray-500 truncate">
                                            {goal.icon && `${getIconEmoji(goal.icon)} `}{goal.title}
                                          </p>
                                        )}
                                        <p className="text-xs text-red-600 mt-1">
                                          Zpožděno: {new Date(step.date).toLocaleDateString('cs-CZ')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            {dailySteps.filter(step => {
                              const stepDate = new Date(step.date)
                              stepDate.setHours(0, 0, 0, 0)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return stepDate < today && !step.completed
                            }).length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">Žádné zpožděné kroky</p>
                            )}
                          </div>
                        </div>

                        {/* ČEKAJÍCÍ KROKY */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-primary-600 border-b border-primary-200 pb-2">
                            Čekající kroky ({dailySteps.filter(step => {
                              const stepDate = new Date(step.date)
                              stepDate.setHours(0, 0, 0, 0)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return stepDate >= today && !step.completed
                            }).length})
                          </h3>
                          <div className="space-y-3">
                            {dailySteps
                              .filter(step => {
                                const stepDate = new Date(step.date)
                                stepDate.setHours(0, 0, 0, 0)
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                return stepDate >= today && !step.completed
                              })
                              .map((step) => {
                                const goal = goals.find(g => g.id === step.goal_id)
                                const stepDate = new Date(step.date)
                                stepDate.setHours(0, 0, 0, 0)
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                const isToday = stepDate.getTime() === today.getTime()
                                
                                return (
                                  <div
                                    key={step.id}
                                    className={`rounded-lg p-3 cursor-pointer transition-colors ${
                                      isToday 
                                        ? 'bg-primary-50 border border-primary-200 hover:bg-primary-100' 
                                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                    onClick={() => handleStepSelect(step)}
                                  >
                                    <div className="flex items-start space-x-2">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                        isToday ? 'bg-primary-500' : 'bg-gray-400'
                                      }`}>
                                        <span className="text-white text-xs">📅</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-medium truncate ${
                                          isToday ? 'text-gray-900' : 'text-gray-600'
                                        }`}>
                                          {step.title}
                                        </h4>
                                        {goal && (
                                          <p className="text-xs text-gray-500 truncate">
                                            {goal.icon && `${getIconEmoji(goal.icon)} `}{goal.title}
                                          </p>
                                        )}
                                        <p className={`text-xs mt-1 ${
                                          isToday ? 'text-primary-600' : 'text-gray-500'
                                        }`}>
                                          {isToday ? 'Dnes: ' : 'Budoucí: '}{new Date(step.date).toLocaleDateString('cs-CZ')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            {dailySteps.filter(step => {
                              const stepDate = new Date(step.date)
                              stepDate.setHours(0, 0, 0, 0)
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return stepDate >= today && !step.completed
                            }).length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">Žádné čekající kroky</p>
                            )}
                          </div>
                        </div>

                        {/* DOKONČENÉ KROKY */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-green-600 border-b border-green-200 pb-2">
                            Dokončené kroky ({dailySteps.filter(step => step.completed).length})
                          </h3>
                          <div className="space-y-3">
                            {dailySteps
                              .filter(step => step.completed)
                              .slice(0, 10) // Zobrazit pouze posledních 10 dokončených kroků
                              .map((step) => {
                                const goal = goals.find(g => g.id === step.goal_id)
                                return (
                                  <div
                                    key={step.id}
                                    className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors"
                                    onClick={() => handleStepSelect(step)}
                                  >
                                    <div className="flex items-start space-x-2">
                                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">✓</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate line-through">
                                          {step.title}
                                        </h4>
                                        {goal && (
                                          <p className="text-xs text-gray-500 truncate">
                                            {goal.icon && `${getIconEmoji(goal.icon)} `}{goal.title}
                                          </p>
                                        )}
                                        <p className="text-xs text-green-600 mt-1">
                                          Dokončeno: {new Date(step.date).toLocaleDateString('cs-CZ')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            {dailySteps.filter(step => step.completed).length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">Žádné dokončené kroky</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // NORMÁLNÍ ZOBRAZENÍ - DailyCheckIn komponenta
                      <DailyCheckIn
                        goals={goals}
                        dailySteps={dailySteps}
                        events={events}
                        onStepComplete={handleStepComplete}
                        onEventComplete={handleEventComplete}
                        onStepAdd={handleStepAdd}
                        onStepPostpone={handleStepPostpone}
                        onEventPostpone={handleEventPostpone}
                        selectedStep={selectedStep}
                        selectedEvent={selectedEvent}
                        onStepSelect={handleStepSelect}
                        onEventSelect={handleEventSelect}
                      />
                    )}
                  </div>
                </div>
              </main>

      {/* Goal Details Dialog */}
      {showGoalDetails && selectedGoal && (
        <GoalDetailModal
          goal={selectedGoal}
          steps={dailySteps.filter(step => step.goal_id === selectedGoal.id)}
          automations={automations}
          onClose={() => {
            setShowGoalDetails(false)
            setSelectedGoal(null)
          }}
          onStepClick={(step) => {
            // TODO: Implement step click functionality
            console.log('Step clicked:', step)
          }}
          onStepComplete={handleStepComplete}
          onStepEdit={(step: DailyStep) => {
            // TODO: Implement step edit functionality
            console.log('Step edit:', step)
          }}
          onStepAdd={handleAddStep}
          onEdit={handleEditGoal}
          onDelete={handleGoalDelete}
        />
      )}

      {/* Progress Edit Modal */}
      {editingProgress && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upravit pokrok cíle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedGoal.progress_type === 'percentage' ? 'Pokrok (%)' : 
                   selectedGoal.progress_type === 'count' ? `Počet (${selectedGoal.progress_unit || 'krát'})` :
                   selectedGoal.progress_type === 'amount' ? `Částka (${selectedGoal.progress_unit || 'Kč'})` :
                   'Pokrok'}
                </label>
                <input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={selectedGoal.progress_type === 'percentage' ? '0-100' : '0'}
                  min="0"
                  max={selectedGoal.progress_type === 'percentage' ? '100' : undefined}
                />
                {selectedGoal.progress_target && (
                  <p className="text-xs text-gray-500 mt-1">
                    Cíl: {selectedGoal.progress_target} {selectedGoal.progress_unit || ''}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleProgressUpdate}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Uložit
              </button>
              <button
                onClick={() => setEditingProgress(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Goal Onboarding Modal */}
        {showGoalOnboarding && (
          <NewGoalOnboarding
            onComplete={handleGoalOnboardingComplete}
            onCancel={() => setShowGoalOnboarding(false)}
          />
        )}

        {/* Add Step Modal */}
      {showAddStepModal && selectedGoalForStep && (
        <UnifiedStepModal
          isOpen={showAddStepModal}
          onClose={() => {
            setShowAddStepModal(false)
            setSelectedGoalForStep(null)
          }}
          onSave={handleSaveStep}
          goals={goals}
          preselectedGoalId={selectedGoalForStep}
          width="medium"
          disableGoalSelection={true}
        />
      )}
    </div>
  )
})

export default MainDashboard
