'use client'

import { useState, useEffect, memo, useRef } from 'react'
import { Goal, DailyStep, Area } from '@/lib/cesta-db'
import { Plus, CheckCircle, Circle, Clock, AlertTriangle, Calendar, Target, Star, Zap, Footprints, Grid, List, Filter, Settings, X } from 'lucide-react'
import { getToday, formatDateForInput } from '@/lib/utils'
import { UnifiedStepModal } from '@/components/UnifiedStepModal'
import { useTranslations } from '@/lib/use-translations'
import { usePageContext } from '@/components/PageContext'

type ViewMode = 'list' | 'kanban'
type KanbanGroupBy = 'date' | 'status' | 'area'

export default function StepsPage() {
  const { setTitle, setSubtitle } = usePageContext()
  const { translations } = useTranslations()
  const today = getToday()
  
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [kanbanGroupBy, setKanbanGroupBy] = useState<KanbanGroupBy>('date')
  const [areas, setAreas] = useState<Area[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [dailySteps, setDailySteps] = useState<DailyStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStepModal, setShowAddStepModal] = useState(false)
  const [selectedStepForDetails, setSelectedStepForDetails] = useState<DailyStep | null>(null)
  const [editingStep, setEditingStep] = useState<DailyStep | null>(null)
  const [editingStepData, setEditingStepData] = useState<Partial<DailyStep>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [filters, setFilters] = useState({
    showToday: true,
    showOverdue: true,
    showFuture: true,
    showCompleted: false,
    showWithGoal: true,
    showWithoutGoal: true,
    showWithArea: true,
    showWithoutArea: true
  })

  // Set page title and subtitle
  useEffect(() => {
    setTitle('Kroky')
    setSubtitle('Správa všech kroků')
  }, [setTitle, setSubtitle])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stepsRes, goalsRes, areasRes] = await Promise.all([
          fetch('/api/cesta/daily-steps'),
          fetch('/api/cesta/goals'),
          fetch('/api/cesta/areas')
        ])

        const [stepsData, goalsData, areasData] = await Promise.all([
          stepsRes.json(),
          goalsRes.json(),
          areasRes.json()
        ])

        setDailySteps(stepsData.steps || [])
        setGoals(goalsData.goals || [])
        setAreas(areasData.areas || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter steps based on current filters
  const filteredSteps = (dailySteps || []).filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    const todayDate = new Date(today)
    todayDate.setHours(0, 0, 0, 0)
    
    const isOverdue = stepDate < todayDate
    const isToday = stepDate.getTime() === todayDate.getTime()
    const isFuture = stepDate > todayDate
    const hasGoal = step.goal_id && step.goal_id !== ''
    const hasArea = step.area_id && step.area_id !== ''

    return (
      (filters.showToday && isToday) ||
      (filters.showOverdue && isOverdue) ||
      (filters.showFuture && isFuture)
    ) && (
      filters.showCompleted || !step.completed
    ) && (
      (filters.showWithGoal && hasGoal) ||
      (filters.showWithoutGoal && !hasGoal)
    ) && (
      (filters.showWithArea && hasArea) ||
      (filters.showWithoutArea && !hasArea)
    )
  })

  // Group steps for kanban view
  const getKanbanGroups = () => {
    if (kanbanGroupBy === 'date') {
      return {
        'Zpožděné': filteredSteps.filter(step => {
          const stepDate = new Date(step.date)
          stepDate.setHours(0, 0, 0, 0)
          return stepDate < today
        }),
        'Dnes': filteredSteps.filter(step => {
          const stepDate = new Date(step.date)
          stepDate.setHours(0, 0, 0, 0)
          const todayDate = new Date(today)
          todayDate.setHours(0, 0, 0, 0)
          return stepDate.getTime() === todayDate.getTime()
        }),
        'Budoucí': filteredSteps.filter(step => {
          const stepDate = new Date(step.date)
          stepDate.setHours(0, 0, 0, 0)
          return stepDate > today
        })
      }
    } else if (kanbanGroupBy === 'status') {
      return {
        'Nedokončené': filteredSteps.filter(step => !step.completed),
        'Dokončené': filteredSteps.filter(step => step.completed)
      }
    } else if (kanbanGroupBy === 'area') {
      const groups: { [key: string]: DailyStep[] } = {}
      
      // Add steps with areas
      filteredSteps.forEach(step => {
        if (step.area_id) {
          const area = (areas || []).find(a => a.id === step.area_id)
          const areaName = area ? area.name : 'Neznámá oblast'
          if (!groups[areaName]) groups[areaName] = []
          groups[areaName].push(step)
        } else {
          if (!groups['Bez oblasti']) groups['Bez oblasti'] = []
          groups['Bez oblasti'].push(step)
        }
      })
      
      return groups
    }
    
    return {}
  }

  const handleStepClick = (step: DailyStep) => {
    if (editingStep?.id === step.id) return
    
    setEditingStep(step)
    setEditingStepData({
      title: step.title,
      description: step.description,
      is_important: step.is_important,
      is_urgent: step.is_urgent,
      goal_id: step.goal_id,
      area_id: step.area_id,
      date: step.date
    })
  }

  const handleStepFieldChange = async (field: string, value: any) => {
    if (!editingStep) return
    
    setEditingStepData(prev => ({ ...prev, [field]: value }))
    
    // Auto-save with debouncing
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)
        
        const response = await fetch('/api/cesta/daily-steps', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stepId: editingStep.id,
            [field]: value
          })
        })

        if (response.ok) {
          const data = await response.json()
          setDailySteps(prev => 
            prev.map(step => 
              step.id === editingStep.id ? data.step : step
            )
          )
          setShowSaved(true)
          setTimeout(() => setShowSaved(false), 2000)
        }
      } catch (error) {
        console.error('Error updating step:', error)
      } finally {
        setIsSaving(false)
      }
    }, 650)
  }

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleStepComplete = async (stepId: string) => {
    try {
      const response = await fetch('/api/cesta/daily-steps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          completed: true,
          completed_at: new Date()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDailySteps(prev => 
          prev.map(step => 
            step.id === stepId ? data.step : step
          )
        )
      }
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
        setDailySteps(prev => [...prev, result.step])
        setShowAddStepModal(false)
      } else {
        const error = await response.json()
        alert(`Chyba při vytváření kroku: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error adding step:', error)
      alert('Chyba při vytváření kroku')
    }
  }

  // Close editing when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.step-card')) {
        setEditingStep(null)
        setEditingStepData({})
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const renderStepCard = (step: DailyStep) => {
    const goal = (goals || []).find(g => g.id === step.goal_id)
    const area = (areas || []).find(a => a.id === step.area_id)
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    const todayDate = new Date(today)
    todayDate.setHours(0, 0, 0, 0)
    
    const isOverdue = stepDate < todayDate
    const isToday = stepDate.getTime() === todayDate.getTime()
    const isFuture = stepDate > todayDate

    return (
      <div
        key={step.id}
        className={`step-card group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer shadow-sm ${
          step.completed
            ? 'bg-green-50 border-green-200'
            : isOverdue
            ? 'bg-red-50 border-red-200'
            : editingStep?.id === step.id
            ? 'bg-primary-50 border-primary-200'
            : 'bg-primary-50 border-primary-200 hover:border-primary-300 hover:bg-primary-100'
        }`}
        onClick={() => handleStepClick(step)}
      >
        {/* Step Icon */}
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
                    {(goals || []).map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={editingStepData.area_id || ''}
                    onChange={(e) => handleStepFieldChange('area_id', e.target.value || null)}
                    className="text-sm text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Bez oblasti</option>
                    {(areas || []).map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
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
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  {goal && (
                    <span className="flex items-center space-x-1">
                      <span>🎯</span>
                      <span>{goal.icon && `${goal.icon} `}{goal.title}</span>
                    </span>
                  )}
                  {area && (
                    <span className="flex items-center space-x-1">
                      <span>{area.icon}</span>
                      <span style={{ color: area.color }}>{area.name}</span>
                    </span>
                  )}
                </div>
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
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání kroků...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Všechny kroky</h2>
            <p className="text-sm text-gray-600">Zobrazují se všechny kroky k dokončení</p>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Kanban Group By (only when in kanban mode) */}
            {viewMode === 'kanban' && (
              <select
                value={kanbanGroupBy}
                onChange={(e) => setKanbanGroupBy(e.target.value as KanbanGroupBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Podle data</option>
                <option value="status">Podle stavu</option>
                <option value="area">Podle oblasti</option>
              </select>
            )}

            {/* Add Step Button */}
            <button
              onClick={() => setShowAddStepModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Přidat krok</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showToday"
              checked={filters.showToday}
              onChange={(e) => setFilters(prev => ({ ...prev, showToday: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="showToday">Dnes</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showOverdue"
              checked={filters.showOverdue}
              onChange={(e) => setFilters(prev => ({ ...prev, showOverdue: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="showOverdue">Zpožděné</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showFuture"
              checked={filters.showFuture}
              onChange={(e) => setFilters(prev => ({ ...prev, showFuture: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="showFuture">Budoucí</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showCompleted"
              checked={filters.showCompleted}
              onChange={(e) => setFilters(prev => ({ ...prev, showCompleted: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="showCompleted">Dokončené</label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {viewMode === 'list' ? (
          // List View
          <div className="space-y-3">
            {filteredSteps.map(renderStepCard)}
          </div>
        ) : (
          // Kanban View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(getKanbanGroups()).map(([groupName, steps]) => (
              <div key={groupName} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">{groupName} ({steps.length})</h3>
                <div className="space-y-3">
                  {steps.map(renderStepCard)}
                </div>
              </div>
            ))}
          </div>
        )}
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
                const goal = (goals || []).find(g => g.id === selectedStepForDetails.goal_id)
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
          </div>
        </div>
      )}
    </div>
  )
}