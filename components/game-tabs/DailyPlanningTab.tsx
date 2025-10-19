'use client'

import { useState, useEffect, memo, useRef } from 'react'
import { Goal, Value, DailyStep, Event, UserSettings, DailyPlanning, UserStreak } from '@/lib/cesta-db'
import { CheckCircle, Clock, Target, BookOpen, Lightbulb, Calendar, Zap, Footprints, Plus, Circle, Star, TrendingUp, AlertCircle, X } from 'lucide-react'
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
  const [editingStepData, setEditingStepData] = useState<Partial<DailyStep>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlanningMode, setIsPlanningMode] = useState(false)
  const [tempPlannedSteps, setTempPlannedSteps] = useState<string[]>([])
  const [newlyAddedSteps, setNewlyAddedSteps] = useState<DailyStep[]>([])
  const [isSavingPlan, setIsSavingPlan] = useState(false)
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [currentInspiration, setCurrentInspiration] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const today = getToday()

  // Inspirations for when all steps are completed
  const inspirations = [
    { icon: '🚶‍♂️', text: 'Jdi na procházku a načerpej energii z přírody' },
    { icon: '🧘‍♀️', text: 'Medituj 10 minut a zklidni mysl' },
    { icon: '☕', text: 'Dej si dobrý čaj a odpočiň si' },
    { icon: '📚', text: 'Přečti si kapitolu z oblíbené knihy' },
    { icon: '🎵', text: 'Poslouchej hudbu, která tě inspiruje' },
    { icon: '✍️', text: 'Napiš si deník nebo myšlenky' },
    { icon: '🌱', text: 'Zalij květiny nebo se starej o rostliny' },
    { icon: '🎨', text: 'Nakresli něco nebo se věnuj kreativitě' },
    { icon: '💆‍♀️', text: 'Udělej si masáž nebo relaxační cvičení' },
    { icon: '🍳', text: 'Uvař si něco dobrého a užij si jídlo' },
    { icon: '📞', text: 'Zavolej někomu blízkému' },
    { icon: '🌟', text: 'Poděkuj za dnešní úspěchy' }
  ]

  // Set random inspiration on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * inspirations.length)
    setCurrentInspiration(inspirations[randomIndex].text)
  }, [])

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
      
      // Simply set the daily planning - no complex reset logic
      if (planningData.planning) {
        setDailyPlanning(planningData.planning)
      } else {
        // Ensure an empty planning exists for today
        const created = await fetch('/api/cesta/daily-planning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: today.toISOString().split('T')[0],
            planned_steps: []
          })
        })
        if (created.ok) {
          const createdData = await created.json()
          setDailyPlanning(createdData.planning)
        } else {
          setDailyPlanning(null)
        }
      }
      setUserStreak(statsData.streak)
      setStepStats(statsData.stepStats)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Combine dailySteps and newlyAddedSteps for complete step list
  const allSteps = [...dailySteps, ...newlyAddedSteps]
  const uniqueSteps = allSteps.reduce((acc, step) => {
    if (!acc.find(s => s.id === step.id)) {
      acc.push(step)
    }
    return acc
  }, [] as DailyStep[])

  // Get all incomplete steps up to today (including today and overdue)
  const allIncompleteSteps = uniqueSteps.filter(step => {
    if (step.completed) return false
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    return stepDate <= today
  })

  // Get planned steps for today
  const plannedStepIds = dailyPlanning?.planned_steps || []
  const completedStepIds = dailyPlanning?.completed_steps || []
  
  const plannedSteps = plannedStepIds
    .map(stepId => uniqueSteps.find(step => step.id === stepId))
    .filter(Boolean) as DailyStep[]
  const completedPlannedSteps = uniqueSteps.filter(step => completedStepIds.includes(step.id))
  const tempPlannedStepsData = tempPlannedSteps
    .map(stepId => uniqueSteps.find(step => step.id === stepId))
    .filter(Boolean) as DailyStep[]
  
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
  const hasCompletedAnyStep = completedStepIds.length > 0
  const allPlannedStepsCompleted = totalPlannedSteps > 0 && completedStepIds.length === totalPlannedSteps
  const shouldShowPlanning = needsPlanning && !isLoading

  // Auto-show planning mode if user needs to plan (but don't reset if already in planning mode)
  useEffect(() => {
    // No modal-based planning; keep inline planning only
    if (!isLoading) {
      setIsPlanningMode(false)
    }
  }, [isLoading])

  // Drop handler into main planned list (inline planning)
  const handleDropToMain = async (dropIndex?: number) => {
    if (draggedStepId) {
      await handleAddStepToDailyPlanAtPosition(draggedStepId, dropIndex)
      setDraggedStepId(null)
      setDragOverIndex(null)
    }
  }

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

  const saveOptimumStats = async (plannedStepsCount: number) => {
    try {
      const completedStepsCount = dailyPlanning?.completed_steps?.length || 0
      const totalStepsCount = dailySteps.length + newlyAddedSteps.length
      
      await fetch('/api/cesta/optimum-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannedStepsCount,
          completedStepsCount,
          totalStepsCount
        })
      })
    } catch (error) {
      console.error('Error saving optimum stats:', error)
    }
  }

  const handleAddStepToDailyPlan = async (stepId: string) => {
    if (!dailyPlanning) return
    
    const currentPlannedSteps = dailyPlanning.planned_steps || []
    if (currentPlannedSteps.includes(stepId)) return
    
    const newPlannedSteps = [...currentPlannedSteps, stepId]
    
    try {
      const response = await fetch('/api/cesta/daily-planning', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today.toISOString().split('T')[0],
          planned_steps: newPlannedSteps
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDailyPlanning(data.planning)
        // Save optimum stats
        await saveOptimumStats(newPlannedSteps.length)
        // Don't call fetchData() here as it resets the plan
      }
    } catch (error) {
      console.error('Error adding step to daily plan:', error)
    }
  }

  const handleAddStepToDailyPlanAtPosition = async (stepId: string, dropIndex?: number) => {
    if (!dailyPlanning) return
    
    const currentPlannedSteps = dailyPlanning.planned_steps || []
    if (currentPlannedSteps.includes(stepId)) return
    
    let newPlannedSteps: string[]
    if (dropIndex !== undefined && dropIndex >= 0 && dropIndex <= currentPlannedSteps.length) {
      // Insert at specific position
      newPlannedSteps = [...currentPlannedSteps]
      newPlannedSteps.splice(dropIndex, 0, stepId)
    } else {
      // Add to end
      newPlannedSteps = [...currentPlannedSteps, stepId]
    }
    
    try {
      const response = await fetch('/api/cesta/daily-planning', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today.toISOString().split('T')[0],
          planned_steps: newPlannedSteps
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDailyPlanning(data.planning)
        // Save optimum stats
        await saveOptimumStats(newPlannedSteps.length)
        // Don't call fetchData() here as it resets the plan
      }
    } catch (error) {
      console.error('Error adding step to daily plan at position:', error)
    }
  }

  const handleRemoveStepFromTempPlanning = (stepId: string) => {
    setTempPlannedSteps(prev => prev.filter(id => id !== stepId))
  }

  const handleStartPlanning = () => {
    setIsPlanningMode(true)
    setTempPlannedSteps(plannedStepIds)
  }

  // Expandable edit functions
  const handleStepClick = (step: DailyStep) => {
    // Only open if not already editing this step
    if (editingStep?.id !== step.id) {
      setEditingStep(step)
      setEditingStepData({
        title: step.title,
        description: step.description || '',
        date: step.date,
        goal_id: step.goal_id,
        is_important: step.is_important,
        is_urgent: step.is_urgent,
        step_type: step.step_type,
        custom_type_name: step.custom_type_name,
        deadline: step.deadline
      })
    }
  }

  const handleStepFieldChange = async (field: keyof DailyStep, value: any) => {
    if (!editingStep) return

    const newData = { ...editingStepData, [field]: value }
    setEditingStepData(newData)

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Auto-save after a short delay
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        console.log('Saving step field:', field, 'value:', value, 'stepId:', editingStep.id)
        
        const response = await fetch('/api/cesta/daily-steps', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStep.id,
            [field]: value
          })
        })

        console.log('Save response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('Save result:', result)
          
          // Update editingStepData to reflect the change immediately
          setEditingStepData(prev => ({ ...prev, [field]: value }))
          
          // Update the step in the local state immediately
          const updatedStep = { ...editingStep, [field]: value }
          setEditingStep(updatedStep)
          
          // Call onStepUpdate to update parent component's state
          if (onStepUpdate && result.step) {
            onStepUpdate(result.step)
          }
          
          // Refresh data in background for consistency
          setTimeout(() => fetchData(), 100)
        } else {
          const error = await response.text()
          console.error('Save error:', error)
        }
      } catch (error) {
        console.error('Error auto-saving step:', error)
      } finally {
        // Keep animation running for maximum 300ms, then show "Uloženo"
        setTimeout(() => {
          setIsSaving(false)
          setShowSaved(true)
          // Hide "Uloženo" text after 2000ms (1000ms visible + 1000ms dissolve)
          setTimeout(() => {
            setShowSaved(false)
          }, 2000)
        }, 300) // Maximum 300ms loading animation
      }
    }, 650) // 650ms delay for auto-save
  }

  const handleStepBlur = () => {
    // Close editing mode when clicking outside
    setEditingStep(null)
    setEditingStepData({})
  }

  // Close editing mode when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingStep) {
        const target = event.target as HTMLElement
        // Check if click is outside any step card
        if (!target.closest('.step-card')) {
          setEditingStep(null)
          setEditingStepData({})
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingStep])

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
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', stepId)
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
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedStepId(null)
    setDragOverIndex(null)
    setIsDragging(false)
  }

  const handleDropFromSelected = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedStepId && tempPlannedSteps.includes(draggedStepId)) {
      handleRemoveStepFromTempPlanning(draggedStepId)
    }
    setDraggedStepId(null)
  }

  const handleReorderSteps = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    
    const newSteps = [...tempPlannedSteps]
    const [movedStep] = newSteps.splice(fromIndex, 1)
    
    // Adjust toIndex if we're moving down (because we removed an item above)
    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
    newSteps.splice(adjustedToIndex, 0, movedStep)
    
    setTempPlannedSteps(newSteps)
  }

  const handleReorderMainSteps = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || !dailyPlanning) return
    
    const newStepIds = [...plannedStepIds]
    const [movedStepId] = newStepIds.splice(fromIndex, 1)
    
    // Adjust toIndex if we're moving down (because we removed an item above)
    const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
    newStepIds.splice(adjustedToIndex, 0, movedStepId)
    
    // Update local state immediately for instant feedback
    setDailyPlanning(prev => prev ? {
      ...prev,
      planned_steps: newStepIds
    } : null)
    
    try {
      const response = await fetch('/api/cesta/daily-planning', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today.toISOString().split('T')[0],
          planned_steps: newStepIds
        })
      })

      if (response.ok) {
        // Save optimum stats
        await saveOptimumStats(newStepIds.length)
      } else {
        // Revert on error
        await fetchData()
      }
    } catch (error) {
      console.error('Error reordering steps:', error)
      // Revert on error
      await fetchData()
    }
  }

  const handleDragOverWithReorder = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedStepId && tempPlannedSteps.includes(draggedStepId)) {
      const fromIndex = tempPlannedSteps.indexOf(draggedStepId)
      if (fromIndex !== -1 && fromIndex !== index) {
        const rect = e.currentTarget.getBoundingClientRect()
        const midpoint = rect.top + rect.height / 2
        const dropIndex = e.clientY < midpoint ? index : index + 1
        
        // Only reorder if the drop position would actually change the order
        const wouldChangeOrder = (fromIndex < dropIndex && fromIndex !== dropIndex - 1) || 
                                (fromIndex > dropIndex && fromIndex !== dropIndex)
        
        if (wouldChangeOrder) {
          handleReorderSteps(fromIndex, dropIndex)
        }
      }
    }
  }

  const handleDragOverMainWithReorder = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedStepId && plannedStepIds.includes(draggedStepId)) {
      const fromIndex = plannedStepIds.indexOf(draggedStepId)
      if (fromIndex !== -1 && fromIndex !== index) {
        const rect = e.currentTarget.getBoundingClientRect()
        const midpoint = rect.top + rect.height / 2
        const dropIndex = e.clientY < midpoint ? index : index + 1
        
        // Only reorder if the drop position would actually change the order
        const wouldChangeOrder = (fromIndex < dropIndex && fromIndex !== dropIndex - 1) || 
                                (fromIndex > dropIndex && fromIndex !== dropIndex)
        
        if (wouldChangeOrder) {
          handleReorderMainSteps(fromIndex, dropIndex)
        }
      }
    }
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

      // Update local state immediately to remove step from daily plan
      if (dailyPlanning) {
        const updatedPlannedSteps = dailyPlanning.planned_steps.filter(id => id !== stepId)
        const updatedCompletedSteps = [...completedStepIds, stepId]
        
        setDailyPlanning({
          ...dailyPlanning,
          planned_steps: updatedPlannedSteps,
          completed_steps: updatedCompletedSteps
        })

        // Save optimum stats
        await saveOptimumStats(updatedPlannedSteps.length)
      }

      // Update newlyAddedSteps to mark step as completed
      setNewlyAddedSteps(prevSteps => 
        prevSteps.map(step => 
          step.id === stepId 
            ? { ...step, completed: true, completed_at: new Date() }
            : step
        )
      )

      // Notify parent component about step update
      if (onStepUpdate) {
        const completedStep = [...dailySteps, ...newlyAddedSteps].find(step => step.id === stepId)
        if (completedStep) {
          onStepUpdate({ ...completedStep, completed: true, completed_at: new Date() })
        }
      }

      // Refresh data in background for consistency
      setTimeout(() => fetchData(), 100)
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
        
        // Always add to today's planning when adding a new step
        await handleAddStepToDailyPlan(result.step.id)
        
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
                <Target className="w-4 h-4 text-blue-500" />
                <span className={`font-semibold ${
                  (plannedStepIds.length - (userSettings?.daily_steps_count || 3)) > 0 
                    ? 'text-orange-600' 
                    : (plannedStepIds.length - (userSettings?.daily_steps_count || 3)) < 0 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {(plannedStepIds.length - (userSettings?.daily_steps_count || 3)) > 0 ? '+' : ''}
                  {plannedStepIds.length - (userSettings?.daily_steps_count || 3)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Optimum</p>
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


      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Planning Modal removed - inline planning active */}

          {/* Normal Mode - Planned Steps for Today */}
          {true && (
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

            <div
              className="border-2 border-dashed border-primary-300 bg-primary-50/20 p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault()
                handleDropToMain() // No specific position - add to end
              }}
            >
              {plannedSteps.length > 0 ? (
                <div className="grid gap-3">
                  {plannedSteps.map((step, index) => {
                    const goal = goals.find(g => g.id === step.goal_id)
                    const stepDate = new Date(step.date)
                    stepDate.setHours(0, 0, 0, 0)
                    const isOverdue = stepDate < today
                    const isDragging = draggedStepId === step.id
                    const isDragOver = dragOverIndex === index
                    
                    return (
                      <div
                        key={step.id}
        className={`step-card group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer shadow-sm ${
          isDragging 
            ? 'opacity-50 scale-95 shadow-lg' 
            : isDragOver 
            ? 'border-primary-400 bg-primary-50 scale-105 shadow-md' 
            : step.completed
            ? 'bg-green-50 border-green-200'
            : isOverdue
            ? 'bg-red-50 border-red-200'
            : editingStep?.id === step.id
            ? 'bg-primary-50 border-primary-200' // No hover effect when editing
            : 'bg-primary-50 border-primary-200 hover:border-primary-300 hover:bg-primary-100'
        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, step.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOverMainWithReorder(e, index)}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleDropToMain(index)
                        }}
                        onClick={() => {
                          if (!isDragging) {
                            handleStepClick(step)
                          }
                        }}
                      >
                        {/* Step Icon on the left */}
                        <div className={`absolute -left-2 top-1/2 transform -translate-y-1/2 opacity-70 ${
                          isOverdue ? 'text-red-400' : 'text-primary-400'
                        }`}>
                          <Footprints className="w-5 h-5 fill-current" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {editingStep?.id === step.id ? (
                            // Expanded edit mode
                            <div className="flex-1 ml-4 space-y-3 relative">
                              <div>
                                <input
                                  type="text"
                                  value={editingStepData.title || ''}
                                  onChange={(e) => handleStepFieldChange('title', e.target.value)}
                                  className="w-full text-lg font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                                  placeholder="Název kroku"
                                />
                              </div>
                              <div>
                                <textarea
                                  value={editingStepData.description || ''}
                                  onChange={(e) => handleStepFieldChange('description', e.target.value)}
                                  className="w-full text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none resize-none"
                                  placeholder="Popis kroku"
                                  rows={2}
                                />
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={editingStepData.is_important || false}
                                    onChange={(e) => handleStepFieldChange('is_important', e.target.checked)}
                                    className="rounded"
                                  />
                                  <label className="text-sm text-gray-600">Důležité</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={editingStepData.is_urgent || false}
                                    onChange={(e) => handleStepFieldChange('is_urgent', e.target.checked)}
                                    className="rounded"
                                  />
                                  <label className="text-sm text-gray-600">Naléhavé</label>
                                </div>
                                <div>
                                  <select
                                    value={editingStepData.goal_id || ''}
                                    onChange={(e) => handleStepFieldChange('goal_id', e.target.value || null)}
                                    className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1"
                                  >
                                    <option value="">Bez cíle</option>
                                    {goals.map(goal => (
                                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <input
                                    type="date"
                                    value={editingStepData.date ? formatDateForInput(new Date(editingStepData.date)) : ''}
                                    onChange={(e) => handleStepFieldChange('date', e.target.value)}
                                    className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1"
                                  />
                                </div>
                              </div>
                              {isSaving && (
                                <div className="absolute bottom-0 right-0">
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                                </div>
                              )}
                              {showSaved && (
                                <div className="absolute bottom-0 right-0">
                                  <div className="text-xs text-primary-500 font-medium animate-fade-out">Uloženo</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Normal view
                            <>
                              <div className="flex-1 ml-4">
                                <div className="flex items-center space-x-3">
                                  <h4 className={`font-bold text-gray-900 ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                    {step.title}
                                  </h4>
                                  {isOverdue && (
                                    <span className="text-red-600 text-sm font-medium">
                                      {Math.ceil((today.getTime() - stepDate.getTime()) / (1000 * 60 * 60 * 24))} dní zpožděno
                                    </span>
                                  )}
                                </div>
                                {step.description && (
                                  <div className="text-sm text-gray-600 truncate mt-1">
                                    {step.description}
                                  </div>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStepComplete(step.id)
                                  }}
                                  className={`w-12 h-8 text-white rounded-lg hover:opacity-80 transition-colors flex items-center justify-center ${
                                    step.completed
                                      ? 'bg-green-500'
                                      : isOverdue
                                      ? 'bg-red-500 hover:bg-red-600'
                                      : 'bg-primary-500 hover:bg-primary-600'
                                  }`}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveStepFromPlanning(step.id)
                                  }}
                                  className={`p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center ${
                                    isOverdue ? 'text-red-500 hover:text-red-600' : 'text-primary-500 hover:text-primary-600'
                                  }`}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (plannedSteps.length === 0 && hasCompletedAnyStep) ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-2">Skvělá práce!</h3>
                  <p className="text-sm text-primary-700 mb-4">
                    Dokončil jsi všechny kroky z dnešního plánu.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-primary-200">
                    <div className="text-2xl mb-2">✨</div>
                    <p className="text-sm text-primary-800 font-medium">
                      {currentInspiration}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-sm font-semibold text-primary-900 mb-1">Začněte dnešní plán</h3>
                  <p className="text-xs text-primary-700 mb-4">
                    Přetáhněte sem krok z "Další kroky" nebo jej přidejte tlačítkem níže.
                  </p>
                  <button
                    onClick={() => setShowAddStepModal(true)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                  >
                    Přidat krok
                  </button>
                </div>
              )}
            </div>

            {/* Other Steps Section - show additional steps below planned ones */}
            {true && (
              <>
                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <div className="px-4 text-sm text-gray-500 bg-white">Další kroky</div>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Other Steps */}
                <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-200">
                  {allIncompleteSteps
                    .filter(step => !plannedStepIds.includes(step.id) && !step.completed)
                    .map((step) => {
                      const goal = goals.find(g => g.id === step.goal_id)
                      const stepDate = new Date(step.date)
                      stepDate.setHours(0, 0, 0, 0)
                      const isOverdue = stepDate < today
                      const isToday = stepDate.getTime() === today.getTime()
                      
                      return (
                        <div
                          key={step.id}
                          className={`step-card group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer shadow-sm ${
                            step.completed
                              ? 'bg-green-50 border-green-200'
                              : isOverdue
                              ? 'bg-red-50 border-red-200'
                              : editingStep?.id === step.id
                              ? 'bg-primary-50 border-primary-200' // No hover effect when editing
                              : 'bg-primary-50 border-primary-200 hover:border-primary-300 hover:bg-primary-100'
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, step.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            handleStepClick(step)
                          }}
                        >
                          {/* Step Icon on the left */}
                          <div className={`absolute -left-2 top-1/2 transform -translate-y-1/2 opacity-70 ${
                            isOverdue ? 'text-red-400' : isToday ? 'text-primary-400' : 'text-gray-400'
                          }`}>
                            <Footprints className="w-5 h-5 fill-current" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {editingStep?.id === step.id ? (
                              // Expanded edit mode
                              <div className="flex-1 ml-4 space-y-3 relative">
                                <div>
                                  <input
                                    type="text"
                                    value={editingStepData.title || ''}
                                    onChange={(e) => handleStepFieldChange('title', e.target.value)}
                                    className="w-full text-lg font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                                    placeholder="Název kroku"
                                  />
                                </div>
                                <div>
                                  <textarea
                                    value={editingStepData.description || ''}
                                    onChange={(e) => handleStepFieldChange('description', e.target.value)}
                                    className="w-full text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none resize-none"
                                    placeholder="Popis kroku"
                                    rows={2}
                                  />
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={editingStepData.is_important || false}
                                      onChange={(e) => handleStepFieldChange('is_important', e.target.checked)}
                                      className="rounded"
                                    />
                                    <label className="text-sm text-gray-600">Důležité</label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={editingStepData.is_urgent || false}
                                      onChange={(e) => handleStepFieldChange('is_urgent', e.target.checked)}
                                      className="rounded"
                                    />
                                    <label className="text-sm text-gray-600">Naléhavé</label>
                                  </div>
                                  <div>
                                    <select
                                      value={editingStepData.goal_id || ''}
                                      onChange={(e) => handleStepFieldChange('goal_id', e.target.value || null)}
                                      className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="">Bez cíle</option>
                                      {goals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <input
                                      type="date"
                                      value={editingStepData.date ? formatDateForInput(new Date(editingStepData.date)) : ''}
                                      onChange={(e) => handleStepFieldChange('date', e.target.value)}
                                      className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1"
                                    />
                                  </div>
                                </div>
                                {isSaving && (
                                  <div className="absolute bottom-0 right-0">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
                                  </div>
                                )}
                                {showSaved && (
                                  <div className="absolute bottom-0 right-0">
                                    <div className="text-xs text-primary-500 font-medium animate-fade-out">Uloženo</div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              // Normal view
                              <>
                                <div className="flex-1 ml-4">
                                  <div className="flex items-center space-x-3">
                                    <h4 className={`font-bold text-gray-900 ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                      {step.title}
                                    </h4>
                                    {isOverdue && (
                                      <span className="text-red-600 text-sm font-medium">
                                        {Math.ceil((today.getTime() - stepDate.getTime()) / (1000 * 60 * 60 * 24))} dní zpožděno
                                      </span>
                                    )}
                                    {isToday && !isOverdue && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        Dnes
                                      </span>
                                    )}
                                  </div>
                                  {step.description && (
                                    <div className="text-sm text-gray-600 truncate mt-1">
                                      {step.description}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStepComplete(step.id)
                                    }}
                                    className={`w-12 h-8 text-white rounded-lg hover:opacity-80 transition-colors flex items-center justify-center ${
                                      step.completed
                                        ? 'bg-green-500'
                                        : isOverdue
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : isToday
                                        ? 'bg-primary-500 hover:bg-primary-600'
                                        : 'bg-primary-500 hover:bg-primary-600'
                                    }`}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddStepToDailyPlan(step.id)
                                    }}
                                    className={`p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center ${
                                      isOverdue ? 'text-red-500 hover:text-red-600' : 'text-primary-500 hover:text-primary-600'
                                    }`}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </>
            )}
          </div>

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

      {/* Step Details Modal */}
      {selectedStepForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detail kroku</h3>
              <button
                onClick={() => setSelectedStepForDetails(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedStepForDetails.title}</h4>
                {selectedStepForDetails.description && (
                  <p className="text-sm text-gray-600 mb-3">{selectedStepForDetails.description}</p>
                )}
              </div>
              
              {(() => {
                const goal = goals.find(g => g.id === selectedStepForDetails.goal_id)
                return goal && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>🎯</span>
                    <span>{goal.icon && `${goal.icon} `}{goal.title}</span>
                  </div>
                )
              })()}
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>📅</span>
                <span>{formatDateForInput(new Date(selectedStepForDetails.date))}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Stav:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedStepForDetails.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedStepForDetails.completed ? 'Dokončeno' : 'Nedokončeno'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedStepForDetails(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Zavřít
              </button>
              {!selectedStepForDetails.completed && (
                <button
                  onClick={() => {
                    handleStepComplete(selectedStepForDetails.id)
                    setSelectedStepForDetails(null)
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Označit jako dokončené
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default DailyPlanningTab
