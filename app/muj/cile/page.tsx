'use client'

import { useState, useEffect } from 'react'
import { NewGoalOnboarding } from '@/components/NewGoalOnboarding'
import { GoalDetailModal } from '@/components/GoalDetailModal'
import { Goal, DailyStep } from '@/lib/cesta-db'
import { Plus, Target, Calendar, Edit, Trash2, CheckCircle, Circle, Clock, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { usePageContext } from '@/components/PageContext'
import { getIconComponent, getIconEmoji } from '@/lib/icon-utils'

export default function CilePage() {
  const { setTitle, setSubtitle } = usePageContext()
  const [goals, setGoals] = useState<Goal[]>([])
  const [steps, setSteps] = useState<DailyStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showGoalOnboarding, setShowGoalOnboarding] = useState(false)
  const [showGoalDetail, setShowGoalDetail] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showStepSettings, setShowStepSettings] = useState(false)
  const [selectedStep, setSelectedStep] = useState<DailyStep | null>(null)
  const [editingStep, setEditingStep] = useState({
    title: '',
    description: '',
    stepType: 'update' as 'update' | 'custom',
    customTypeName: '',
    frequencyTime: '',
    updateProgressType: 'percentage' as 'percentage' | 'count' | 'amount',
    updateValue: '',
    updateUnit: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, stepsRes] = await Promise.all([
        fetch('/api/cesta/goals'),
        fetch('/api/cesta/daily-steps')
      ])

      const [goalsData, stepsData] = await Promise.all([
        goalsRes.json(),
        stepsRes.json()
      ])

      setGoals(goalsData.goals || [])
      setSteps(stepsData.steps || [])
      
      // Set page title and subtitle
      setTitle('Cíle')
      setSubtitle(`${(goalsData.goals || []).length} cílů`)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTodayString = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
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
      
      if (response.ok) {
        const data = await response.json()
        console.log('Frontend: Goal created successfully:', data)
        setGoals(prev => [...prev, data.goal])
        setSteps(prev => [...prev, ...data.steps])
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



  const handleStepToggle = async (stepId: string) => {
    try {
      const response = await fetch(`/api/cesta/daily-steps/${stepId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !steps.find(s => s.id === stepId)?.completed })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.step) {
          setSteps(prev => prev.map(step => 
            step.id === stepId 
              ? { ...step, completed: data.step.completed, completed_at: data.step.completed_at }
              : step
          ))
        } else {
          console.error('Invalid response structure:', data)
          alert('Chyba při aktualizaci kroku')
        }
        
        // Update goal progress
        if (data.step) {
          const step = steps.find(s => s.id === stepId)
          if (step) {
            const goal = goals.find(g => g.id === step.goal_id)
            if (goal && goal.progress_type === 'steps') {
              const allStepsForGoal = [...steps, { ...step, completed: data.step.completed }].filter(s => s.goal_id === step.goal_id)
              const completedSteps = allStepsForGoal.filter(s => s.completed).length
              const totalSteps = allStepsForGoal.length
              const newProgressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
              
              setGoals(prev => prev.map(g => 
                g.id === step.goal_id 
                  ? { ...g, progress_percentage: newProgressPercentage }
                  : g
              ))
            }
          }
        }
      }
    } catch (error) {
      console.error('Error toggling step:', error)
    }
  }

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowGoalDetail(true)
  }

  const handleStepClick = (step: DailyStep) => {
    setSelectedStep(step)
    setEditingStep({
      title: step.title,
      description: step.description || '',
      stepType: step.step_type === 'revision' ? 'custom' : step.step_type,
      customTypeName: step.custom_type_name || '',
      frequencyTime: '',
      updateProgressType: 'percentage' as 'count' | 'percentage' | 'amount',
      updateValue: '',
      updateUnit: ''
    })
    setShowStepSettings(true)
  }

  const handleStepUpdate = async () => {
    if (!selectedStep) return

    try {
      const response = await fetch(`/api/cesta/daily-steps/${selectedStep.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingStep.title,
          description: editingStep.description,
          stepType: editingStep.stepType,
          customTypeName: editingStep.stepType === 'custom' ? editingStep.customTypeName : undefined,
          frequencyTime: editingStep.stepType === 'update' ? editingStep.frequencyTime : undefined,
          updateProgressType: editingStep.stepType === 'update' ? editingStep.updateProgressType : undefined,
          // Pro šablony se neukládají konkrétní hodnoty - ty se nastaví při generování instance
          updateValue: undefined,
          updateUnit: undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSteps(prev => prev.map(step => 
          step.id === selectedStep.id ? data.step : step
        ))
        setShowStepSettings(false)
        setSelectedStep(null)
        alert('Krok byl úspěšně aktualizován!')
      } else {
        const error = await response.json()
        alert(`Chyba při aktualizaci kroku: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error updating step:', error)
      alert('Chyba při aktualizaci kroku')
    }
  }

  const handleStepDelete = async () => {
    if (!selectedStep) return

    if (!confirm('Opravdu chcete smazat tento krok?')) {
      return
    }

    try {
      const response = await fetch(`/api/cesta/daily-steps/${selectedStep.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSteps(prev => prev.filter(step => step.id !== selectedStep.id))
        setShowStepSettings(false)
        setSelectedStep(null)
        alert('Krok byl úspěšně smazán!')
      } else {
        const error = await response.json()
        alert(`Chyba při mazání kroku: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error deleting step:', error)
      alert('Chyba při mazání kroku')
    }
  }


  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Opravdu chcete smazat tento cíl? Tato akce je nevratná.')) {
      return
    }

    try {
      const response = await fetch(`/api/cesta/goals/${goalId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId))
        setSteps(prev => prev.filter(step => step.goal_id !== goalId))
        setExpandedGoals(prev => {
          const newSet = new Set(prev)
          newSet.delete(goalId)
          return newSet
        })
      } else {
        const error = await response.json()
        alert(`Chyba při mazání cíle: ${error.error || 'Neznámá chyba'}`)
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert('Chyba při mazání cíle')
    }
  }

  const getGoalSteps = (goalId: string) => {
    return steps.filter(step => step.goal_id === goalId)
  }

  const getGoalProgressDisplay = (goal: Goal) => {
    const goalSteps = getGoalSteps(goal.id)
    
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

  const getStepStatus = (step: DailyStep) => {
    const stepDate = new Date(step.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    stepDate.setHours(0, 0, 0, 0)
    
    if (step.completed) {
      return { text: 'Dokončeno', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    }
    
    if (stepDate < today) {
      const daysOverdue = Math.floor((today.getTime() - stepDate.getTime()) / (1000 * 60 * 60 * 24))
      return { 
        text: `${daysOverdue} dní zpožděno`, 
        color: 'text-red-600', 
        bgColor: 'bg-red-50', 
        borderColor: 'border-red-200' 
      }
    }
    
    if (stepDate.getTime() === today.getTime()) {
      return { text: 'Dnes', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
    }
    
    const daysUntil = Math.ceil((stepDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { text: `Za ${daysUntil} dní`, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'short-term':
        return { label: 'Krátkodobé', color: 'bg-green-100 text-green-800', icon: '⚡' }
      case 'medium-term':
        return { label: 'Střednědobé', color: 'bg-blue-100 text-blue-800', icon: '🎯' }
      case 'long-term':
        return { label: 'Dlouhodobé', color: 'bg-purple-100 text-purple-800', icon: '🏆' }
      default:
        return { label: 'Střednědobé', color: 'bg-blue-100 text-blue-800', icon: '🎯' }
    }
  }

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(goalId)) {
        newSet.delete(goalId)
      } else {
        newSet.add(goalId)
      }
      return newSet
    })
  }

  const groupGoalsByCategory = (goals: Goal[]) => {
    const grouped = {
      'short-term': [] as Goal[],
      'medium-term': [] as Goal[],
      'long-term': [] as Goal[]
    }
    
    goals.forEach(goal => {
      grouped[goal.category] = grouped[goal.category] || []
      grouped[goal.category].push(goal)
    })
    
    return grouped
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám cíle...</p>
        </div>
      </div>
    )
  }

  const groupedGoals = groupGoalsByCategory(goals)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Add Goal Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowGoalOnboarding(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Přidat cíl</span>
          </button>
        </div>

        {/* Goal Onboarding Modal */}
        {showGoalOnboarding && (
          <NewGoalOnboarding
            onComplete={handleGoalOnboardingComplete}
            onCancel={() => setShowGoalOnboarding(false)}
          />
        )}

        {/* Goal Detail Modal */}
        {showGoalDetail && selectedGoal && (
          <GoalDetailModal
            goal={selectedGoal}
            steps={getGoalSteps(selectedGoal.id)}
            automations={[]}
            onClose={() => {
              setShowGoalDetail(false)
              setSelectedGoal(null)
            }}
            onStepClick={handleStepClick}
            onEdit={(goal) => {
              // TODO: Implement edit functionality
              console.log('Edit goal:', goal)
            }}
            onDelete={handleDeleteGoal}
          />
        )}

        {/* Goals by Category */}
        {Object.entries(groupedGoals).map(([category, categoryGoals]) => {
          if (categoryGoals.length === 0) return null
          
          const categoryInfo = getCategoryInfo(category)
          
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{categoryInfo.icon}</span>
                <h2 className="text-xl font-bold text-gray-900">{categoryInfo.label}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                  {categoryGoals.length} cílů
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                {categoryGoals.map((goal) => {
                  const goalSteps = getGoalSteps(goal.id)
                  const completedSteps = goalSteps.filter(s => s.completed).length
                  const totalSteps = goalSteps.length
                  const isExpanded = expandedGoals.has(goal.id)
                  
                  return (
                    <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden self-start hover:shadow-md transition-shadow">
                      {/* Goal Header - Compact */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleGoalExpansion(goal.id)}>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-base font-semibold text-gray-900 truncate flex items-center space-x-2">
                                <span>{goal.title}</span>
                                {goal.icon && (
                                  <span className="text-sm">{getIconEmoji(goal.icon)}</span>
                                )}
                              </h3>
                            </div>
                            
                            {goal.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{goal.description}</p>
                            )}
                            
                            <div className="space-y-1 text-xs text-gray-500">
                              {goal.target_date && (
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{new Date(goal.target_date).toLocaleDateString('cs-CZ')}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Target className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{getGoalProgressDisplay(goal)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleGoalClick(goal)
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Zobrazit detail cíle"
                            >
                              <Target className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleGoalExpansion(goal.id)
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                              title={isExpanded ? "Skrýt kroky" : "Zobrazit kroky"}
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Implement edit functionality
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Upravit cíl"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteGoal(goal.id)
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Smazat cíl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${goal.progress_percentage || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Expanded Steps Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Kroky ({completedSteps}/{totalSteps})</h4>
                          </div>

                          {/* Steps List */}
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {goalSteps.length === 0 ? (
                              <div className="text-center py-3 text-gray-500">
                                <Target className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                                <p className="text-xs">Žádné kroky</p>
                              </div>
                            ) : (
                              goalSteps.map((step) => {
                                const status = getStepStatus(step)
                                return (
                                  <div
                                    key={step.id}
                                    className={`p-2 rounded border ${status.bgColor} ${status.borderColor} cursor-pointer hover:shadow-sm transition-shadow`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStepClick(step)
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-1 mb-1">
                                          <h5 className="font-medium text-xs text-gray-900 truncate">{step.title}</h5>
                                        </div>
                                        
                                        {/* Step Type and Frequency */}
                                        <div className="flex items-center space-x-1 mb-1">
                                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                            step.step_type === 'update' ? 'bg-blue-100 text-blue-800' :
                                            'bg-purple-100 text-purple-800'
                                          }`}>
                                            {step.step_type === 'update' ? 'Automatizovaný' : 'Jednorázový'}
                                          </span>
                                          
                                          
                                          {step.step_type === 'custom' && step.custom_type_name && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                              Deadline: {new Date(step.custom_type_name).toLocaleDateString('cs-CZ')}
                                            </span>
                                          )}
                                        </div>
                                        
                                        {step.description && (
                                          <p className="text-xs text-gray-600 mb-1 line-clamp-1">{step.description}</p>
                                        )}
                                        
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                          <span className={status.color}>{status.text}</span>
                                          <span>•</span>
                                          <span>{new Date(step.date).toLocaleDateString('cs-CZ')}</span>
                                        </div>
                                      </div>
                                      
                                      <div 
                                        className="ml-2 flex-shrink-0 cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStepToggle(step.id)
                                        }}
                                      >
                                        {step.completed ? (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}


        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné cíle</h3>
            <p className="text-gray-600 mb-6">Začněte svou cestu přidáním prvního cíle</p>
            <button
              onClick={() => setShowGoalOnboarding(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Přidat první cíl
            </button>
          </div>
        )}

        {/* Step Settings Modal */}
        {showStepSettings && selectedStep && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Nastavení šablony kroku</h2>
                  <button
                    onClick={() => {
                      setShowStepSettings(false)
                      setSelectedStep(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-blue-500 text-xl">ℹ️</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">Šablona pro automatické generování</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Nastavujete šablonu, podle které se budou automaticky generovat konkrétní kroky. 
                        Instance kroků se zobrazují na hlavní stránce.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleStepUpdate(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Název kroku
                    </label>
                    <input
                      type="text"
                      value={editingStep.title}
                      onChange={(e) => setEditingStep(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Popis
                    </label>
                    <textarea
                      value={editingStep.description}
                      onChange={(e) => setEditingStep(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Typ kroku
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="stepType"
                          value="automated"
                          checked={editingStep.stepType === 'update'}
                          onChange={(e) => setEditingStep(prev => ({ ...prev, stepType: 'update' }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Automatizovaný krok (generuje se podle frekvence)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="stepType"
                          value="manual"
                          checked={editingStep.stepType === 'custom'}
                          onChange={(e) => setEditingStep(prev => ({ ...prev, stepType: 'custom' }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Jednorázový krok (pouze označit hotovo)</span>
                      </label>
                    </div>
                  </div>

                  {editingStep.stepType === 'update' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frekvence generování
                      </label>
                      <input
                        type="text"
                        value={editingStep.frequencyTime}
                        onChange={(e) => setEditingStep(prev => ({ ...prev, frequencyTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Např. každý den v 20:00, PO, ST, PÁ v 16:00, každou první neděli v měsíci v 18:00"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Zadejte frekvenci v přirozeném jazyce (např. "každý den v 20:00", "PO, ST, PÁ v 16:00")
                      </p>
                    </div>
                  )}

                  {editingStep.stepType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline (volitelné)
                      </label>
                      <input
                        type="date"
                        value={editingStep.customTypeName || ''}
                        onChange={(e) => setEditingStep(prev => ({ ...prev, customTypeName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Datum, do kdy má být krok dokončen
                      </p>
                    </div>
                  )}


                  {/* Zobrazení deadline pro jednorázové kroky */}
                  {selectedStep && selectedStep.step_type === 'custom' && selectedStep.custom_type_name && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Deadline</h3>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Datum dokončení:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedStep.custom_type_name).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Uložit změny
                    </button>
                    <button
                      type="button"
                      onClick={handleStepDelete}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Smazat krok
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStepSettings(false)
                        setSelectedStep(null)
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Zrušit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}