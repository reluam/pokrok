'use client'

import { useState, memo, useEffect } from 'react'
import { Goal, DailyStep, Automation, GoalMetric } from '@/lib/cesta-db'
import { X, Calendar, Target, Clock, Settings, CheckCircle, Circle, AlertCircle, Info, Gauge, Plus, Edit, Trash2, DollarSign, Percent, Ruler, Clock as ClockIcon, Type } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { getIconComponent, getIconEmoji } from '@/lib/icon-utils'

interface GoalDetailModalProps {
  goal: Goal
  steps: DailyStep[]
  automations: Automation[]
  onClose: () => void
  onStepClick?: (step: DailyStep) => void
  onStepComplete?: (stepId: string) => void
  onStepEdit?: (step: DailyStep) => void
  onStepAdd?: (goalId: string) => void
  onEdit?: (goal: Goal) => void
  onDelete?: (goalId: string) => void
}

export const GoalDetailModal = memo(function GoalDetailModal({ 
  goal, 
  steps, 
  automations, 
  onClose, 
  onStepClick, 
  onStepComplete,
  onStepEdit,
  onStepAdd,
  onEdit, 
  onDelete 
}: GoalDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'metrics' | 'automations' | 'settings'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedGoal, setEditedGoal] = useState<Goal>(goal)
  const [metrics, setMetrics] = useState<GoalMetric[]>([])
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [showAddMetricModal, setShowAddMetricModal] = useState(false)
  const [showAddStepModal, setShowAddStepModal] = useState(false)

  // Load metrics when metrics tab is opened
  useEffect(() => {
    if (activeTab === 'metrics') {
      loadMetrics()
    }
  }, [activeTab, goal.id])

  const loadMetrics = async () => {
    setIsLoadingMetrics(true)
    try {
      const response = await fetch(`/api/cesta/goal-metrics?goalId=${goal.id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('GoalDetailModal: API response:', data)
        const metricsData = data.metrics || data
        console.log('GoalDetailModal: Extracted metrics:', metricsData)
        setMetrics(Array.isArray(metricsData) ? metricsData : [])
      } else {
        console.log('GoalDetailModal: API error:', response.status)
        setMetrics([])
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
      setMetrics([])
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const handleSave = () => {
    onEdit?.(editedGoal)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedGoal(goal)
    setIsEditing(false)
  }

  const handleFieldChange = (field: keyof Goal, value: any) => {
    setEditedGoal(prev => ({ ...prev, [field]: value }))
  }

  const handleAddMetric = async (metricData: any) => {
    try {
      const response = await fetch('/api/cesta/goal-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goal.id,
          ...metricData
        })
      })
      
      if (response.ok) {
        await loadMetrics() // Reload metrics
        setShowAddMetricModal(false)
      }
    } catch (error) {
      console.error('Error adding metric:', error)
    }
  }

  const handleUpdateMetric = async (metricId: string, updates: any) => {
    try {
      const response = await fetch('/api/cesta/goal-metrics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metricId: metricId,
          goalId: goal.id,
          ...updates
        })
      })
      
      if (response.ok) {
        await loadMetrics() // Reload metrics
      }
    } catch (error) {
      console.error('Error updating metric:', error)
    }
  }

  const handleDeleteMetric = async (metricId: string) => {
    try {
      const response = await fetch(`/api/cesta/goal-metrics?metricId=${metricId}&goalId=${goal.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadMetrics() // Reload metrics
      }
    } catch (error) {
      console.error('Error deleting metric:', error)
    }
  }

  const getGoalTypeInfo = (goalType: string) => {
    switch (goalType) {
      case 'outcome':
        return {
          label: 'Výsledkový cíl',
          description: 'Konkrétní, měřitelný výsledek, který chcete dosáhnout',
          icon: '🎯',
          color: 'text-blue-600 bg-blue-100'
        }
      case 'process':
        return {
          label: 'Procesní cíl',
          description: 'Zaměřený na pravidelné aktivity a návyky',
          icon: '🔄',
          color: 'text-green-600 bg-green-100'
        }
      default:
        return {
          label: 'Neznámý typ',
          description: 'Typ cíle není definován',
          icon: '❓',
          color: 'text-gray-600 bg-gray-100'
        }
    }
  }

  const getProgressTypeInfo = (progressType: string) => {
    switch (progressType) {
      case 'percentage':
        return {
          label: 'Procentuální',
          description: 'Pokrok se měří v procentech (0-100%)',
          icon: '📊'
        }
      case 'count':
        return {
          label: 'Počet',
          description: 'Pokrok se měří počtem dokončených akcí',
          icon: '🔢'
        }
      case 'amount':
        return {
          label: 'Částka',
          description: 'Pokrok se měří v peněžních jednotkách',
          icon: '💰'
        }
      case 'steps':
        return {
          label: 'Kroky',
          description: 'Pokrok se měří počtem dokončených kroků',
          icon: '👣'
        }
      default:
        return {
          label: 'Neznámý',
          description: 'Typ měření není definován',
          icon: '❓'
        }
    }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'short-term':
        return {
          label: 'Krátkodobý',
          description: 'Cíl na nejbližší období (obvykle do 3 měsíců)',
          icon: '⚡',
          color: 'text-orange-600 bg-orange-100'
        }
      case 'medium-term':
        return {
          label: 'Střednědobý',
          description: 'Cíl na střední období (obvykle 3-12 měsíců)',
          icon: '📅',
          color: 'text-blue-600 bg-blue-100'
        }
      case 'long-term':
        return {
          label: 'Dlouhodobý',
          description: 'Cíl na dlouhé období (obvykle více než 1 rok)',
          icon: '🏆',
          color: 'text-purple-600 bg-purple-100'
        }
      default:
        return {
          label: 'Neznámý',
          description: 'Kategorie není definována',
          icon: '❓',
          color: 'text-gray-600 bg-gray-100'
        }
    }
  }

  const goalTypeInfo = getGoalTypeInfo(goal.goal_type || 'outcome')
  const progressTypeInfo = getProgressTypeInfo(goal.progress_type || 'percentage')
  const categoryInfo = getCategoryInfo(goal.category || 'short-term')

  // Show all steps (is_automated field doesn't exist in DailyStep interface)
  const userSteps = steps
  const completedSteps = userSteps.filter(s => s.completed).length
  const totalSteps = userSteps.length

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: Info },
    { id: 'steps', label: 'Kroky', icon: CheckCircle },
    { id: 'metrics', label: 'Metriky', icon: Gauge },
    { id: 'automations', label: 'Automatizace', icon: Clock },
    { id: 'settings', label: 'Nastavení', icon: Settings }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedGoal.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <span>{goal.title}</span>
                    {goal.icon && (
                      <span className="text-2xl">{getIconEmoji(goal.icon)}</span>
                    )}
                  </h2>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
              {isEditing ? (
                <textarea
                  value={editedGoal.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full text-gray-600 bg-transparent border border-gray-300 rounded px-2 py-1 focus:border-primary-500 focus:outline-none"
                  rows={2}
                  placeholder="Popis cíle..."
                />
              ) : (
                goal.description && (
                  <p className="text-gray-600">{goal.description}</p>
                )
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Uložit
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Zrušit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Dokončené kroky</p>
                      <p className="text-2xl font-bold text-blue-900">{completedSteps}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Celkem kroků</p>
                      <p className="text-2xl font-bold text-green-900">{totalSteps}</p>
                    </div>
                    <Target className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pokrok cíle</h3>
                  <span className="text-2xl font-bold text-primary-600">{goal.progress_percentage || 0}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress_percentage || 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-gray-600">Dokončeno</span>
                    <span className="font-medium">{goal.progress_percentage || 0}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-600">Zbývá</span>
                    <span className="font-medium">{100 - (goal.progress_percentage || 0)}%</span>
                  </div>
                </div>
              </div>


              {/* Timeline */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Časová osa
                </h3>
                
                {(() => {
                  const startDate = new Date(goal.created_at)
                  const endDate = goal.target_date ? new Date(goal.target_date) : null
                  const today = new Date()
                  
                  // Sort steps by date
                  const sortedSteps = [...userSteps].sort((a, b) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  
                  // Calculate timeline positions
                  const calculatePosition = (date: Date) => {
                    if (!endDate) return 0
                    const startTime = startDate.getTime()
                    const endTime = endDate.getTime()
                    const currentTime = date.getTime()
                    const totalDuration = endTime - startTime
                    const currentDuration = currentTime - startTime
                    return Math.max(0, Math.min(100, (currentDuration / totalDuration) * 100))
                  }
                  
                  return (
                    <div className="relative px-8">
                      {/* Compact timeline with progress bar */}
                      <div className="space-y-3">
                        
                        {/* Top row - Descriptions */}
                        <div className="relative flex items-center h-8">
                          {/* Start description */}
                          <div className="absolute left-0 transform -translate-x-1/2">
                            <div className="bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                              <h4 className="text-xs font-semibold text-gray-900 text-center whitespace-nowrap">Začátek</h4>
                            </div>
                          </div>
                          
                          {/* Step descriptions */}
                          {sortedSteps.map((step, index) => {
                            const stepDate = new Date(step.date)
                            const isCompleted = step.completed
                            const isOverdue = stepDate < today && !isCompleted
                            const isToday = stepDate.toDateString() === today.toDateString()
                            const position = calculatePosition(stepDate)
                            
                            return (
                              <div 
                                key={step.id} 
                                className="absolute transform -translate-x-1/2"
                                style={{ left: `${position}%` }}
                              >
                                <div className={`px-2 py-1 rounded-full shadow-sm border ${
                                  isCompleted ? 'bg-green-50 border-green-200' :
                                  isOverdue ? 'bg-red-50 border-red-200' :
                                  isToday ? 'bg-yellow-50 border-yellow-200' :
                                  'bg-blue-50 border-blue-200'
                                }`}>
                                  <h4 className={`text-xs font-semibold text-center whitespace-nowrap ${
                                    isCompleted ? 'text-green-900' :
                                    isOverdue ? 'text-red-900' :
                                    isToday ? 'text-yellow-900' :
                                    'text-blue-900'
                                  }`}>
                                    {step.title.length > 12 ? step.title.substring(0, 12) + '...' : step.title}
                                  </h4>
                                </div>
                              </div>
                            )
                          })}
                          
                          {/* End description */}
                          {endDate && (
                            <div className="absolute right-0 transform translate-x-1/2">
                              <div className="bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-900 text-center whitespace-nowrap">Cíl</h4>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Middle row - Dates */}
                        <div className="relative flex items-center h-6">
                          {/* Start date */}
                          <div className="absolute left-0 transform -translate-x-1/2">
                            <div className="bg-gray-50 px-2 py-1 rounded-md">
                              <p className="text-xs text-gray-600 text-center whitespace-nowrap">
                                {startDate.toLocaleDateString('cs-CZ')}
                              </p>
                            </div>
                          </div>
                          
                          {/* Step dates */}
                          {sortedSteps.map((step, index) => {
                            const stepDate = new Date(step.date)
                            const position = calculatePosition(stepDate)
                            
                            return (
                              <div 
                                key={step.id} 
                                className="absolute transform -translate-x-1/2"
                                style={{ left: `${position}%` }}
                              >
                                <div className="bg-gray-50 px-2 py-1 rounded-md">
                                  <p className="text-xs text-gray-600 text-center whitespace-nowrap">
                                    {stepDate.toLocaleDateString('cs-CZ')}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                          
                          {/* End date */}
                          {endDate && (
                            <div className="absolute right-0 transform translate-x-1/2">
                              <div className="bg-gray-50 px-2 py-1 rounded-md">
                                <p className="text-xs text-gray-600 text-center whitespace-nowrap">
                                  {endDate.toLocaleDateString('cs-CZ')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Timeline line and points */}
                        <div className="relative flex items-center h-6">
                          {/* Timeline line */}
                          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"></div>
                          
                          {/* Start point */}
                          <div className="absolute left-0 transform -translate-x-1/2">
                            <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white shadow-md"></div>
                          </div>
                          
                          {/* Step points */}
                          {sortedSteps.map((step, index) => {
                            const stepDate = new Date(step.date)
                            const isCompleted = step.completed
                            const isOverdue = stepDate < today && !isCompleted
                            const isToday = stepDate.toDateString() === today.toDateString()
                            const position = calculatePosition(stepDate)
                            
                            return (
                              <div 
                                key={step.id} 
                                className="absolute transform -translate-x-1/2"
                                style={{ left: `${position}%` }}
                              >
                                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
                                  isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                  isOverdue ? 'bg-gradient-to-br from-red-400 to-red-600' :
                                  isToday ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                  'bg-gradient-to-br from-blue-400 to-blue-600'
                                }`}></div>
                              </div>
                            )
                          })}
                          
                          {/* End point */}
                          {endDate && (
                            <div className="absolute right-0 transform translate-x-1/2">
                              <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white shadow-md"></div>
                            </div>
                          )}
                        </div>

                        {/* Simple status indicator */}
                        <div className="mt-4">
                          {(() => {
                            const todayPosition = calculatePosition(today)
                            const progressPosition = goal.progress_percentage || 0
                            const deviation = progressPosition - todayPosition
                            
                            let status = 'on-track'
                            let statusText = 'Podle plánu'
                            let statusColor = 'primary'
                            let statusIcon = '✅'
                            
                            if (deviation > 10) {
                              status = 'ahead'
                              statusText = 'Před plánem'
                              statusColor = 'primary'
                              statusIcon = '🚀'
                            } else if (deviation < -10) {
                              status = 'behind'
                              statusText = 'Za plánem'
                              statusColor = 'red'
                              statusIcon = '⚠️'
                            } else if (deviation < -5) {
                              status = 'slightly-behind'
                              statusText = 'Mírně za plánem'
                              statusColor = 'red'
                              statusIcon = '⏰'
                            }
                            
                            return (
                              <div className={`p-4 rounded-lg border-2 ${
                                statusColor === 'primary' ? 'bg-primary-50 border-primary-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{statusIcon}</span>
                                    <div>
                                      <h4 className={`text-lg font-semibold ${
                                        statusColor === 'primary' ? 'text-primary-900' :
                                        'text-red-900'
                                      }`}>
                                        {statusText}
                                      </h4>
                                      <p className={`text-sm ${
                                        statusColor === 'primary' ? 'text-primary-700' :
                                        'text-red-700'
                                      }`}>
                                        {deviation > 0 ? `+${Math.round(deviation)}% před plánem` : 
                                         deviation < 0 ? `${Math.round(deviation)}% za plánem` : 
                                         'Přesně podle plánu'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className={`text-2xl font-bold ${
                                      statusColor === 'primary' ? 'text-primary-600' :
                                      'text-red-600'
                                    }`}>
                                      {Math.round(progressPosition)}%
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      z {Math.round(todayPosition)}% očekávaných
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Simple progress bar */}
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Pokrok</span>
                                    <span>Očekávaný pokrok</span>
                                  </div>
                                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                                    {/* Expected progress */}
                                    <div 
                                      className="absolute top-0 h-full bg-gray-400 rounded-full"
                                      style={{ width: `${todayPosition}%` }}
                                    ></div>
                                    
                                    {/* Actual progress */}
                                    <div 
                                      className={`absolute top-0 h-full rounded-full ${
                                        statusColor === 'primary' ? 'bg-primary-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${Math.min(progressPosition, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Kroky ({completedSteps}/{totalSteps})
                </h3>
                <button 
                  onClick={() => onStepAdd?.(goal.id)}
                  className="flex items-center space-x-2 bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Přidat krok</span>
                </button>
              </div>

              {totalSteps === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Žádné kroky</p>
                  <p className="text-sm">K tomuto cíli nejsou přiřazeny žádné kroky.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSteps.map((step) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        step.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStepComplete?.(step.id)
                          }}
                          className="flex-shrink-0"
                        >
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 hover:text-green-500 transition-colors" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{step.title}</h4>
                          </div>
                          {step.description && (
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(step.date).toLocaleDateString('cs-CZ')}
                            </span>
                            {step.step_type === 'custom' && step.custom_type_name && (
                              <span className="flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Deadline: {new Date(step.custom_type_name).toLocaleDateString('cs-CZ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onStepEdit?.(step)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Metriky cíle
                </h3>
                <button 
                  onClick={() => setShowAddMetricModal(true)}
                  className="flex items-center space-x-2 bg-primary-500 text-white px-3 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Přidat metriku</span>
                </button>
              </div>

              {isLoadingMetrics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Načítání metrik...</p>
                </div>
              ) : !Array.isArray(metrics) || metrics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gauge className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Žádné metriky</p>
                  <p className="text-sm">Pro tento cíl nejsou nastaveny žádné metriky.</p>
                </div>
              ) : Array.isArray(metrics) && metrics.length > 0 ? (
                <div className="space-y-3">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {metric.type === 'currency' && <DollarSign className="w-4 h-4 text-green-600" />}
                            {metric.type === 'percentage' && <Percent className="w-4 h-4 text-blue-600" />}
                            {metric.type === 'distance' && <Ruler className="w-4 h-4 text-purple-600" />}
                            {metric.type === 'time' && <ClockIcon className="w-4 h-4 text-orange-600" />}
                            {(metric.type === 'number' || metric.type === 'custom') && <Type className="w-4 h-4 text-gray-600" />}
                          </div>
                          <h4 className="font-medium text-gray-900">{metric.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteMetric(metric.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {metric.description && (
                          <p className="text-sm text-gray-600">{metric.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Pokrok:</span>
                            <span className="text-sm font-medium">
                              {metric.current_value} {metric.unit} / {metric.target_value} {metric.unit}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((metric.current_value / metric.target_value) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round((metric.current_value / metric.target_value) * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={metric.current_value}
                            onChange={(e) => handleUpdateMetric(metric.id, { currentValue: Number(e.target.value) })}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Aktuální hodnota"
                          />
                          <span className="text-sm text-gray-500">{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gauge className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Chyba při načítání metrik</p>
                  <p className="text-sm">Nepodařilo se načíst metriky pro tento cíl.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'automations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Automatizace
                </h3>
                <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
                  + Přidat automatizaci
                </button>
              </div>

              {(() => {
                const goalSteps = steps.map(step => step.id)
                const goalAutomations = automations.filter(automation => 
                  goalSteps.includes(automation.target_id)
                )
                
                return goalAutomations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">Žádné automatizace</p>
                    <p className="text-sm">Pro tento cíl nejsou nastaveny žádné automatizace.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goalAutomations.map((automation) => (
                      <div key={automation.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{automation.name}</h4>
                            {automation.description && (
                              <p className="text-sm text-gray-600 mt-1">{automation.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Typ: {automation.type}</span>
                              <span>Frekvence: {automation.frequency_time || 'Není nastavena'}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                automation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {automation.is_active ? 'Aktivní' : 'Neaktivní'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}


          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Nastavení cíle</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Pro úpravu základních informací o cíli použijte tlačítko "Upravit" v hlavním seznamu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informace o cíli</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Název:</span>
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Typ:</span>
                      <span className="font-medium">{goalTypeInfo.label}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Kategorie:</span>
                      <span className="font-medium">{categoryInfo.label}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Měření pokroku:</span>
                      <span className="font-medium">{progressTypeInfo.label}</span>
                    </div>
                    {goal.target_date && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Cílové datum:</span>
                        <span className="font-medium">
                          {new Date(goal.target_date).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Zavřít
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Upravit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Smazat
            </button>
          )}
        </div>
      </div>
      
      {/* Add Metric Modal */}
      {showAddMetricModal && (
        <AddMetricModal
          goalId={goal.id}
          onClose={() => setShowAddMetricModal(false)}
          onSave={handleAddMetric}
        />
      )}
    </div>
  )
})

// Add Metric Modal Component
interface AddMetricModalProps {
  goalId: string
  onClose: () => void
  onSave: (metricData: any) => void
}

const AddMetricModal = memo(function AddMetricModal({ goalId, onClose, onSave }: AddMetricModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'number' as const,
    unit: 'ks',
    targetValue: 0,
    currentValue: 0
  })

  const metricTypes = [
    { id: 'number', name: 'Počet', icon: Type, defaultUnit: 'ks' },
    { id: 'currency', name: 'Měna', icon: DollarSign, defaultUnit: 'Kč' },
    { id: 'percentage', name: 'Procento', icon: Percent, defaultUnit: '%' },
    { id: 'distance', name: 'Vzdálenost', icon: Ruler, defaultUnit: 'km' },
    { id: 'time', name: 'Čas', icon: ClockIcon, defaultUnit: 'hod' },
    { id: 'custom', name: 'Vlastní', icon: Type, defaultUnit: '' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.unit.trim() && formData.targetValue > 0) {
      onSave(formData)
    }
  }

  const handleTypeChange = (type: string) => {
    const selectedType = metricTypes.find(t => t.id === type)
    setFormData(prev => ({
      ...prev,
      type: type as any,
      unit: selectedType?.defaultUnit || ''
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Přidat metriku</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Název metriky *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Např. Ušetřená částka"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popis (volitelné)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="Popište metriku podrobněji..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ metriky *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {metricTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jednotka *
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Kč, km, %"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cílová hodnota *
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1000000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktuální stav
                </label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentValue: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Přidat metriku
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})
