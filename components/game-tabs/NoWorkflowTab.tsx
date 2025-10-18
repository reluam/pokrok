'use client'

import { useState, useEffect, memo, useRef } from 'react'
import { CheckCircle, Circle, Plus, Calendar, Clock, Target, Filter, Save, X, Footprints } from 'lucide-react'
import { usePageContext } from '../PageContext'
import { useTranslations } from '@/lib/use-translations'
import { DailyStep, Goal } from '@/lib/cesta-db'
import { getToday, formatDateForInput } from '@/lib/utils'
import { UnifiedStepModal } from '../UnifiedStepModal'

interface NoWorkflowTabProps {}

interface FilterSettings {
  showToday: boolean
  showOverdue: boolean
  showFuture: boolean
  showWithGoal: boolean
  showWithoutGoal: boolean
  sortBy: 'date' | 'priority' | 'title'
}

export const NoWorkflowTab = memo(function NoWorkflowTab({}: NoWorkflowTabProps = {}) {
  const { setTitle, setSubtitle } = usePageContext()
  const { translations } = useTranslations()
  const [isLoading, setIsLoading] = useState(true)
  const [dailySteps, setDailySteps] = useState<DailyStep[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [selectedStepForDetails, setSelectedStepForDetails] = useState<DailyStep | null>(null)
  const [editingStep, setEditingStep] = useState<DailyStep | null>(null)
  const [editingStepData, setEditingStepData] = useState<Partial<DailyStep>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isSavingFilters, setIsSavingFilters] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Filter settings
  const [filters, setFilters] = useState<FilterSettings>({
    showToday: true,
    showOverdue: true,
    showFuture: false,
    showWithGoal: true,
    showWithoutGoal: true,
    sortBy: 'date'
  })
  
  // Temporary filters for UI (not saved until user clicks save)
  const [tempFilters, setTempFilters] = useState<FilterSettings>(filters)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  useEffect(() => {
    if (translations) {
      setTitle('Všechny kroky')
      setSubtitle('Zobrazují se všechny kroky k dokončení')
      fetchData()
      loadFilterSettings()
    }
  }, [translations, setTitle, setSubtitle])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters) {
        const target = event.target as Element
        if (!target.closest('.filter-dropdown')) {
          setShowFilters(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilters])

  const loadFilterSettings = async () => {
    try {
      const response = await fetch('/api/cesta/user-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.filters) {
          setFilters(data.settings.filters)
          setTempFilters(data.settings.filters)
        }
      }
    } catch (error) {
      console.error('Error loading filter settings:', error)
    }
  }

  const saveFilterSettings = async () => {
    setIsSavingFilters(true)
    try {
      const response = await fetch('/api/cesta/user-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: tempFilters
        })
      })

      if (response.ok) {
        setFilters(tempFilters)
        setShowFilters(false)
        alert('Filtry byly uloženy!')
      } else {
        alert('Chyba při ukládání filtrů')
      }
    } catch (error) {
      console.error('Error saving filter settings:', error)
      alert('Chyba při ukládání filtrů')
    } finally {
      setIsSavingFilters(false)
    }
  }

  const resetFilters = () => {
    setTempFilters(filters)
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
          
          // Update dailySteps to reflect the change immediately
          setDailySteps(prevSteps => 
            prevSteps.map(step => 
              step.id === editingStep.id 
                ? { ...step, [field]: value }
                : step
            )
          )
          
          // Refresh data in background for consistency
          setTimeout(() => fetchData(), 100)
        } else {
          const error = await response.text()
          console.error('Save error:', error)
        }
      } catch (error) {
        console.error('Error auto-saving step:', error)
      } finally {
        // Keep animation running for total of 1 second from start
        setTimeout(() => {
          setIsSaving(false)
          setShowSaved(true)
          // Hide "Uloženo" text after 2000ms (1000ms visible + 1000ms dissolve)
          setTimeout(() => {
            setShowSaved(false)
          }, 2000)
        }, 1000 - 650) // 350ms remaining after 650ms delay
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

  // Filter and sort steps based on current filters
  const getFilteredSteps = () => {
    let filteredSteps = dailySteps.filter(step => {
      if (step.completed) return false
      
      const stepDate = new Date(step.date)
      stepDate.setHours(0, 0, 0, 0)
      const isToday = stepDate.getTime() === today.getTime()
      const isOverdue = stepDate < today
      const isFuture = stepDate > today
      
      // Date filters
      if (isToday && !tempFilters.showToday) return false
      if (isOverdue && !tempFilters.showOverdue) return false
      if (isFuture && !tempFilters.showFuture) return false
      
      // Goal filters
      if (step.goal_id && !tempFilters.showWithGoal) return false
      if (!step.goal_id && !tempFilters.showWithoutGoal) return false
      
      return true
    })

    // Sort steps
    filteredSteps.sort((a, b) => {
      switch (tempFilters.sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'priority':
          // Simple priority based on overdue > today > future
          const aDate = new Date(a.date)
          const bDate = new Date(b.date)
          const aIsOverdue = aDate < today
          const bIsOverdue = bDate < today
          const aIsToday = aDate.getTime() === today.getTime()
          const bIsToday = bDate.getTime() === today.getTime()
          
          if (aIsOverdue && !bIsOverdue) return -1
          if (!aIsOverdue && bIsOverdue) return 1
          if (aIsToday && !bIsToday) return -1
          if (!aIsToday && bIsToday) return 1
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        default:
          return 0
      }
    })

    return filteredSteps
  }

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


  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const filteredSteps = getFilteredSteps()

  return (
    <div className="h-full flex flex-col relative">
      {/* Header with stats */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-100">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Všechny kroky</h2>
              <p className="text-sm text-gray-600">Zobrazují se všechny kroky k dokončení</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{filteredSteps.length}</span>
              </div>
              <p className="text-xs text-gray-500">Celkem</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="font-semibold">{filteredSteps.filter(step => {
                  const stepDate = new Date(step.date)
                  stepDate.setHours(0, 0, 0, 0)
                  return stepDate < today
                }).length}</span>
              </div>
              <p className="text-xs text-gray-500">Zpožděno</p>
            </div>
          </div>
        </div>

        {/* Compact Filter Row */}
        <div className="flex items-center justify-between pt-4 pb-0 px-4 bg-primary-50/30">
          <div className="flex items-center space-x-4">
            {/* Filter Dropdown */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>Filtry</span>
                <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {showFilters && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-primary-200 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Date Filters */}
                      <div>
                        <h4 className="font-medium text-primary-900 mb-3">Zobrazit kroky</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tempFilters.showOverdue}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, showOverdue: e.target.checked }))}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                            />
                            <span className="text-primary-700">Zpožděné kroky</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tempFilters.showToday}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, showToday: e.target.checked }))}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                            />
                            <span className="text-primary-700">Dnešní kroky</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tempFilters.showFuture}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, showFuture: e.target.checked }))}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                            />
                            <span className="text-primary-700">Budoucí kroky</span>
                          </label>
                        </div>
                      </div>

                      {/* Goal Filters */}
                      <div>
                        <h4 className="font-medium text-primary-900 mb-3">Typ kroků</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tempFilters.showWithGoal}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, showWithGoal: e.target.checked }))}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                            />
                            <span className="text-primary-700">S cílem</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tempFilters.showWithoutGoal}
                              onChange={(e) => setTempFilters(prev => ({ ...prev, showWithoutGoal: e.target.checked }))}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                            />
                            <span className="text-primary-700">Bez cíle</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="mt-4">
                      <h4 className="font-medium text-primary-900 mb-3">Řazení</h4>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sortBy"
                            value="priority"
                            checked={tempFilters.sortBy === 'priority'}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value as 'priority' }))}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-primary-700">Podle priority</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sortBy"
                            value="date"
                            checked={tempFilters.sortBy === 'date'}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value as 'date' }))}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-primary-700">Podle data</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sortBy"
                            value="title"
                            checked={tempFilters.sortBy === 'title'}
                            onChange={(e) => setTempFilters(prev => ({ ...prev, sortBy: e.target.value as 'title' }))}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-primary-700">Podle názvu</span>
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={resetFilters}
                        className="px-3 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors text-sm"
                      >
                        Resetovat
                      </button>
                      <button
                        onClick={saveFilterSettings}
                        disabled={isSavingFilters}
                        className="flex items-center space-x-2 bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 text-sm"
                      >
                        {isSavingFilters ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Ukládám...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Uložit natrvalo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters Summary */}
            <div className="flex items-center space-x-2 text-sm text-primary-600">
              <span>Zobrazeno:</span>
              <span className="font-medium text-primary-900">{filteredSteps.length} kroků</span>
            </div>
          </div>

          {/* Add Step Button */}
          <button
            onClick={() => setShowAddStepModal(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat krok</span>
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredSteps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Žádné kroky</h3>
            <p className="text-gray-600 mb-6">
              Podle aktuálních filtrů nejsou žádné kroky k zobrazení.
            </p>
            <button
              onClick={() => setShowAddStepModal(true)}
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat první krok</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredSteps.map((step) => {
              const stepDate = new Date(step.date)
              stepDate.setHours(0, 0, 0, 0)
              const isToday = stepDate.getTime() === today.getTime()
              const isOverdue = stepDate < today
              const isFuture = stepDate > today
              
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
                      : isToday
                      ? 'bg-primary-50 border-primary-200 hover:border-primary-300 hover:bg-primary-100'
                      : 'bg-primary-50 border-primary-200 hover:border-primary-300 hover:bg-primary-100'
                  }`}
                  onClick={() => handleStepClick(step)}
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
                            {isFuture && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Budoucí
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
                              setSelectedStepForDetails(step)
                            }}
                            className={`p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center ${
                              isOverdue ? 'text-red-500 hover:text-red-600' : 'text-primary-500 hover:text-primary-600'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
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
