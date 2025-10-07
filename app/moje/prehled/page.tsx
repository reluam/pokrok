'use client'

import { useState, useEffect } from 'react'
import { Goal, Value, DailyStep } from '@/lib/cesta-db'
import { Target, TrendingUp, Calendar, Star, Zap, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export default function OverviewPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [values, setValues] = useState<Value[]>([])
  const [dailySteps, setDailySteps] = useState<DailyStep[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, valuesRes, stepsRes] = await Promise.all([
        fetch('/api/cesta/goals'),
        fetch('/api/cesta/values'),
        fetch('/api/cesta/daily-steps')
      ])

      const [goalsData, valuesData, stepsData] = await Promise.all([
        goalsRes.json(),
        valuesRes.json(),
        stepsRes.json()
      ])

      setGoals(goalsData.goals)
      setValues(valuesData.values)
      setDailySteps(stepsData.steps || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const activeGoals = goals.filter(goal => goal.status === 'active')
  const completedGoals = goals.filter(goal => goal.status === 'completed')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const overdueSteps = dailySteps.filter(step => {
    if (step.completed) return false
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    const stepDateStr = stepDate.toLocaleDateString()
    const todayStr = today.toLocaleDateString()
    const stepDateObj = new Date(stepDateStr)
    const todayObj = new Date(todayStr)
    return stepDateObj < todayObj
  })
  
  const todaySteps = dailySteps.filter(step => {
    const stepDate = new Date(step.date)
    stepDate.setHours(0, 0, 0, 0)
    const stepDateStr = stepDate.toLocaleDateString()
    const todayStr = today.toLocaleDateString()
    return stepDateStr === todayStr
  })
  
  const completedTodaySteps = todaySteps.filter(step => step.completed)
  
  // Get next 3 steps
  const nextSteps = dailySteps
    .filter(step => !step.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Calculate overall progress
  const totalProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => sum + goal.progress_percentage, 0) / activeGoals.length
    : 0

  // Calculate value balance
  const valueBalance = values.length > 0
    ? values.reduce((sum, value) => sum + (value.level || 1), 0) / values.length
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktivní cíle</p>
                  <p className="text-2xl font-bold text-primary-600">{activeGoals.length}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celkový pokrok</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round(totalProgress)}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dnešní kroky</p>
                  <p className="text-2xl font-bold text-orange-600">{completedTodaySteps.length}/{todaySteps.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hodnoty</p>
                  <p className="text-2xl font-bold text-purple-600">{values.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Přehled pokroku
            </h3>
            
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Celkový pokrok</span>
                  <span className="text-sm font-bold text-primary-600">{Math.round(totalProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${totalProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Value Balance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Vyváženost hodnot</span>
                  <span className="text-sm font-bold text-purple-600">{valueBalance.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (valueBalance / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Nadcházející kroky
            </h3>
            
            {nextSteps.length > 0 ? (
              <div className="space-y-3">
                {nextSteps.map((step) => {
                  const goal = goals.find(g => g.id === step.goal_id)
                  const stepDate = new Date(step.date)
                  const isOverdue = stepDate < today
                  
                  return (
                    <div 
                      key={step.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        isOverdue 
                          ? 'bg-red-50 border-red-400' 
                          : 'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          {step.description && (
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {goal && (
                              <span className="flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                {goal.title}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {stepDate.toLocaleDateString('cs-CZ')}
                            </span>
                            {isOverdue && (
                              <span className="flex items-center text-red-600">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Zpožděno
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Všechny kroky dokončeny!</h4>
                <p className="text-gray-600">Skvělá práce! Můžete si naplánovat nové kroky.</p>
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-600" />
              Nedávné úspěchy
            </h3>
            
            <div className="space-y-3">
              {completedGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                    <p className="text-sm text-gray-600">
                      Dokončeno {new Date(goal.updated_at).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                </div>
              ))}
              
              {completedGoals.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🏆</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Ještě žádné dokončené cíle</h4>
                  <p className="text-gray-600">Začněte pracovat na svých cílech a sledujte své úspěchy!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
  )
}
