'use client'

import { useState, memo } from 'react'
import { Goal, Metric, Automation } from '@/lib/cesta-db'
import { ArrowLeft, ArrowRight, Check, Target, Clock, Calendar, Settings, Plus, Trash2 } from 'lucide-react'
import { IconPicker } from './IconPicker'
import { getIconEmoji, getDefaultGoalIcon } from '@/lib/icon-utils'

interface NewGoalOnboardingProps {
  onComplete: (goalData: GoalOnboardingData) => void
  onCancel: () => void
}

interface StepData {
  id: string
  title: string
  description?: string
  deadline: string
  useGoalDeadline: boolean
  hasMetric: boolean
  metric?: {
    name: string
    targetValue: number
    currentValue: number
    unit: string
  }
  hasAutomation: boolean
  automation?: {
    name: string
    frequencyType: 'one-time' | 'recurring'
    frequencyTime?: string
    scheduledDate?: string
  }
}

interface GoalOnboardingData {
  title: string
  description?: string
  targetDate: string
  icon?: string
  steps: StepData[]
}

export const NewGoalOnboarding = memo(function NewGoalOnboarding({ onComplete, onCancel }: NewGoalOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [data, setData] = useState<GoalOnboardingData>({
    title: '',
    description: '',
    targetDate: '',
    icon: getDefaultGoalIcon(),
    steps: []
  })

  const steps = [
    { id: 'definition', title: 'Definice cíle', icon: Target },
    { id: 'icon', title: 'Ikona', icon: Target },
    { id: 'deadline', title: 'Deadline', icon: Calendar },
    { id: 'steps', title: 'Kroky', icon: Settings },
    { id: 'complete', title: 'Dokončení', icon: Check }
  ]

  const addStep = () => {
    const newStep: StepData = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      deadline: data.targetDate || '',
      useGoalDeadline: true,
      hasMetric: false,
      hasAutomation: false
    }
    setData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const updateStep = (stepId: string, updates: Partial<StepData>) => {
    setData(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }))
  }

  const removeStep = (stepId: string) => {
    setData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete(data)
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'definition':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Definujte svůj cíl</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název cíle *
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Např. Ušetřit na nový dům"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popis (volitelné)
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Popište svůj cíl podrobněji..."
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'icon':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vyberte ikonu pro váš cíl</h3>
              <p className="text-gray-600 mb-6">
                Ikona vám pomůže rychle identifikovat váš cíl a všechny s ním související kroky.
              </p>
              
              {/* Minimalistický výběr ikony */}
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {getIconEmoji(data.icon)}
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  {showIconPicker ? 'Skrýt ikony' : 'Změnit ikonu'}
                </button>
              </div>
              
              {/* Ikony se zobrazí pouze po kliknutí */}
              {showIconPicker && (
                <div className="mt-4">
                  <IconPicker
                    selectedIcon={data.icon}
                    onIconSelect={(icon) => {
                      setData(prev => ({ ...prev, icon }))
                      setShowIconPicker(false)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 'deadline':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nastavte deadline</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cílové datum *
                </label>
                <input
                  type="date"
                  value={data.targetDate}
                  onChange={(e) => setData(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        )

      case 'steps':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Definujte kroky</h3>
              <button
                onClick={addStep}
                className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat krok</span>
              </button>
            </div>
            
            {data.steps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-md">Žádné kroky</p>
                <p className="text-sm mt-1">Přidejte alespoň jeden krok pro dosažení cíle</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.steps.map((step, index) => (
                  <div key={step.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Krok {index + 1}</h4>
                      <button
                        onClick={() => removeStep(step.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Název kroku *
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Např. Pravidelně šetřit"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Popis (volitelné)
                        </label>
                        <textarea
                          value={step.description || ''}
                          onChange={(e) => updateStep(step.id, { description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={2}
                          placeholder="Popište krok podrobněji..."
                        />
                      </div>

                      {/* Deadline Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deadline kroku
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={step.useGoalDeadline}
                              onChange={(e) => updateStep(step.id, { 
                                useGoalDeadline: e.target.checked,
                                deadline: e.target.checked ? data.targetDate : step.deadline
                              })}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Datum shodné s cílem ({data.targetDate})</span>
                          </label>
                          {!step.useGoalDeadline && (
                            <input
                              type="date"
                              value={step.deadline}
                              onChange={(e) => updateStep(step.id, { deadline: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      </div>

                      {/* Metric Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="checkbox"
                            id={`metric_${step.id}`}
                            checked={step.hasMetric}
                            onChange={(e) => updateStep(step.id, { hasMetric: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor={`metric_${step.id}`} className="text-sm font-medium text-gray-700">
                            Přidat metriku
                          </label>
                        </div>
                        
                        {step.hasMetric && (
                          <div className="ml-6 space-y-3 bg-white p-3 rounded border">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Název metriky
                              </label>
                              <input
                                type="text"
                                value={step.metric?.name || ''}
                                onChange={(e) => updateStep(step.id, { 
                                  metric: { ...step.metric, name: e.target.value } as any
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Např. Ušetřená částka"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Cílová hodnota
                                </label>
                                <input
                                  type="number"
                                  value={step.metric?.targetValue || ''}
                                  onChange={(e) => updateStep(step.id, { 
                                    metric: { ...step.metric, targetValue: Number(e.target.value) } as any
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="1000000"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Jednotka
                                </label>
                                <input
                                  type="text"
                                  value={step.metric?.unit || ''}
                                  onChange={(e) => updateStep(step.id, { 
                                    metric: { ...step.metric, unit: e.target.value } as any
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="Kč"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Aktuální stav (volitelné)
                              </label>
                              <input
                                type="number"
                                value={step.metric?.currentValue || ''}
                                onChange={(e) => updateStep(step.id, { 
                                  metric: { ...step.metric, currentValue: Number(e.target.value) } as any
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Automation Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="checkbox"
                            id={`automation_${step.id}`}
                            checked={step.hasAutomation}
                            onChange={(e) => updateStep(step.id, { hasAutomation: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor={`automation_${step.id}`} className="text-sm font-medium text-gray-700">
                            Přidat automatizaci
                          </label>
                        </div>
                        
                        {step.hasAutomation && (
                          <div className="ml-6 space-y-3 bg-white p-3 rounded border">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Název automatizace
                              </label>
                              <input
                                type="text"
                                value={step.automation?.name || ''}
                                onChange={(e) => updateStep(step.id, { 
                                  automation: { ...step.automation, name: e.target.value } as any
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Např. Připomínka k šetření"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Typ automatizace
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`automation_type_${step.id}`}
                                    value="reminder"
                                    checked={step.automation?.frequencyType === 'one-time'}
                                    onChange={(e) => updateStep(step.id, { 
                                      automation: { ...step.automation, frequencyType: 'one-time' } as any
                                    })}
                                    className="text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-sm text-gray-700">Pouze připomínka</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`automation_type_${step.id}`}
                                    value="metric-update"
                                    checked={step.automation?.frequencyType === 'recurring'}
                                    onChange={(e) => updateStep(step.id, { 
                                      automation: { ...step.automation, frequencyType: 'recurring' } as any
                                    })}
                                    className="text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-sm text-gray-700">Pro úpravu metriky</span>
                                </label>
                              </div>
                            </div>
                            
                            {step.automation?.frequencyType === 'one-time' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Datum a čas
                                </label>
                                <input
                                  type="datetime-local"
                                  value={step.automation?.scheduledDate || ''}
                                  onChange={(e) => updateStep(step.id, { 
                                    automation: { ...step.automation, scheduledDate: e.target.value } as any
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>
                            )}
                            
                            {step.automation?.frequencyType === 'recurring' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Frekvence
                                </label>
                                <input
                                  type="text"
                                  value={step.automation?.frequencyTime || ''}
                                  onChange={(e) => updateStep(step.id, { 
                                    automation: { ...step.automation, frequencyTime: e.target.value } as any
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="Např. Každý den v 18:00"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cíl je připraven!</h3>
              <p className="text-gray-600 mb-6">
                Zkontrolujte si nastavení a dokončete vytvoření cíle.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Shrnutí cíle</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Název:</strong> {data.title}</p>
                {data.description && <p><strong>Popis:</strong> {data.description}</p>}
                <p><strong>Deadline:</strong> {new Date(data.targetDate).toLocaleDateString('cs-CZ')}</p>
                <p><strong>Počet kroků:</strong> {data.steps.length}</p>
                <p><strong>Kroky s metrikami:</strong> {data.steps.filter(s => s.hasMetric).length}</p>
                <p><strong>Kroky s automatizacemi:</strong> {data.steps.filter(s => s.hasAutomation).length}</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'definition':
        return data.title.trim().length > 0
      case 'icon':
        return true // Icon is optional, always can proceed
      case 'deadline':
        return data.targetDate.length > 0
      case 'steps':
        return data.steps.length > 0 && data.steps.every(step => step.title.trim().length > 0)
      case 'complete':
        return true
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Nový cíl</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive 
                        ? 'border-primary-500 bg-primary-500 text-white' 
                        : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">{steps[currentStep].title}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zpět</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Zrušit
            </button>
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Vytvořit cíl</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Další</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
