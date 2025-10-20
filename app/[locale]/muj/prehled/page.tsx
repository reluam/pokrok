'use client'

import { useState, useEffect } from 'react'
import { Goal, DailyStep, GoalMetric } from '@/lib/cesta-db'
import { GoalDetailModal } from '@/components/GoalDetailModal'
import { 
  Mountain, 
  Home, 
  Globe, 
  Heart, 
  Briefcase, 
  GraduationCap,
  Car,
  Plane,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Star,
  Compass
} from 'lucide-react'

interface GoalProgress extends Goal {
  completedSteps: number
  totalSteps: number
  metricsProgress: number
  progressPercentage: number
  daysRemaining: number
  mostOverdueDays: number
  nextMilestone?: string
  color: string
}

interface Milestone {
  id: string
  title: string
  goalId: string
  goalTitle: string
  goalIcon: string
  goalColor: string
  date: Date
  completed: boolean
}

export default function OverviewPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [steps, setSteps] = useState<DailyStep[]>([])
  const [metrics, setMetrics] = useState<GoalMetric[]>([])
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [showGoalDetail, setShowGoalDetail] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const goalColors = [
    'from-primary-500 to-primary-600',
    'from-primary-400 to-primary-500', 
    'from-primary-600 to-primary-700',
    'from-primary-300 to-primary-400',
    'from-primary-700 to-primary-800',
    'from-primary-200 to-primary-300'
  ]

  const goalIcons = {
    'career': Briefcase,
    'home': Home,
    'travel': Globe,
    'education': GraduationCap,
    'health': Heart,
    'finance': Mountain,
    'default': Mountain
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (goals.length > 0 && steps.length > 0) {
      calculateProgress()
      generateMilestones()
    }
  }, [goals, steps, metrics])

  const loadData = async () => {
    try {
      const [goalsResponse, stepsResponse] = await Promise.all([
        fetch('/api/cesta/goals'),
        fetch('/api/cesta/daily-steps')
      ])

      if (goalsResponse.ok && stepsResponse.ok) {
        const goalsData = await goalsResponse.json()
        const stepsData = await stepsResponse.json()
        
        setGoals(goalsData.goals || goalsData || [])
        setSteps(stepsData.steps || stepsData || [])
        
        // Load metrics for each goal separately
        const allMetrics: GoalMetric[] = []
        for (const goal of goalsData.goals || goalsData || []) {
          try {
            const metricsResponse = await fetch(`/api/cesta/goal-metrics?goalId=${goal.id}`)
            if (metricsResponse.ok) {
              const metricsData = await metricsResponse.json()
              allMetrics.push(...(metricsData.metrics || []))
            }
          } catch (metricsError) {
            console.log(`Metrics not available for goal ${goal.id}:`, metricsError)
          }
        }
        setMetrics(allMetrics)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProgress = () => {
    const activeGoals = goals
    
    const progressData: GoalProgress[] = activeGoals.map((goal, index) => {
      const goalSteps = steps.filter(step => step.goal_id === goal.id)
      const completedSteps = goalSteps.filter(step => step.completed).length
      const totalSteps = goalSteps.length
      
      // Calculate metrics progress
      const goalMetrics = metrics.filter(metric => metric.goal_id === goal.id)
      let metricsProgress = 0
      if (goalMetrics.length > 0) {
        const totalMetricsProgress = goalMetrics.reduce((sum, metric) => {
          const currentValue = metric.current_value || 0
          const targetValue = metric.target_value || 1
          return sum + (currentValue / targetValue) * 100
        }, 0)
        metricsProgress = totalMetricsProgress / goalMetrics.length
      }
      
      // Combine steps and metrics progress
      let progressPercentage = 0
      if (totalSteps > 0 && goalMetrics.length > 0) {
        // Both steps and metrics - average them
        const stepsProgress = (completedSteps / totalSteps) * 100
        progressPercentage = (stepsProgress + metricsProgress) / 2
      } else if (totalSteps > 0) {
        // Only steps
        progressPercentage = (completedSteps / totalSteps) * 100
      } else if (goalMetrics.length > 0) {
        // Only metrics
        progressPercentage = metricsProgress
      }
      
      const today = new Date()
      const targetDate = goal.target_date ? new Date(goal.target_date) : null
      const daysRemaining = targetDate ? Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0
      
      // Calculate overdue steps
      const overdueSteps = goalSteps.filter(step => {
        if (step.completed) return false
        const stepDate = new Date(step.date)
        return stepDate < today
      })
      
      // Find most overdue step
      const mostOverdueStep = overdueSteps.length > 0 
        ? overdueSteps.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
        : null
      
      // Calculate how many days overdue the most overdue step is
      const mostOverdueDays = mostOverdueStep 
        ? Math.ceil((today.getTime() - new Date(mostOverdueStep.date).getTime()) / (1000 * 60 * 60 * 24))
        : 0
      
      // Find next milestone
      const nextStep = goalSteps
        .filter(step => !step.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

      return {
        ...goal,
        completedSteps,
        totalSteps,
        metricsProgress,
        progressPercentage,
        daysRemaining,
        mostOverdueDays,
        nextMilestone: nextStep?.title,
        color: goalColors[index % goalColors.length]
      }
    })

    setGoalProgress(progressData.sort((a, b) => {
      // Priority 1: Goals with overdue steps
      if (a.mostOverdueDays > 0 && b.mostOverdueDays === 0) return -1
      if (b.mostOverdueDays > 0 && a.mostOverdueDays === 0) return 1
      
      // Priority 2: Among goals with overdue steps, sort by most overdue days
      if (a.mostOverdueDays > 0 && b.mostOverdueDays > 0) {
        return b.mostOverdueDays - a.mostOverdueDays
      }
      
      // Priority 3: Among goals without overdue steps, sort by closest deadline
      return a.daysRemaining - b.daysRemaining
    }))
  }

  const generateMilestones = () => {
    const allMilestones: Milestone[] = []
    
    // Add completed goals (for now, we'll skip this since goals don't have completed property)
    // const completedGoals = goals.filter(goal => goal.completed)
    // completedGoals.forEach(goal => {
    //   allMilestones.push({
    //     id: `goal-${goal.id}`,
    //     title: `Cíl dokončen: ${goal.title}`,
    //     goalId: goal.id,
    //     goalTitle: goal.title,
    //     goalIcon: goal.icon,
    //     goalColor: 'from-primary-500 to-primary-600',
    //     date: new Date(goal.updated_at || goal.created_at),
    //     completed: true
    //   })
    // })
    
    // Add all steps (both completed and incomplete)
    goalProgress.forEach(goal => {
      const goalSteps = steps.filter(step => step.goal_id === goal.id)
      
      goalSteps.forEach(step => {
        allMilestones.push({
          id: step.id,
          title: step.title,
          goalId: goal.id,
          goalTitle: goal.title,
          goalIcon: goal.icon || '🎯',
          goalColor: goal.color,
          date: new Date(step.date),
          completed: step.completed
        })
      })
    })

    // Sort by date, most recent first
    setMilestones(allMilestones.sort((a, b) => b.date.getTime() - a.date.getTime()))
  }

  const getGoalIcon = (goalType: string) => {
    const IconComponent = goalIcons[goalType as keyof typeof goalIcons] || goalIcons.default
    return IconComponent
  }

  const getMotivationalMessage = () => {
    const completedGoals = 0 // Goals don't have completed property
    const completedSteps = steps.filter(s => s.completed).length

    if (completedGoals === 0 && completedSteps === 0) {
      return "Vaše cesta začíná zde"
    }
    
    if (completedGoals > 0) {
      return `Skvěle! ${completedGoals} cíl${completedGoals > 1 ? 'ů' : ''} dosaženo`
    }
    
    if (completedSteps > 0) {
      return `Úžasný pokrok! ${completedSteps} krok${completedSteps > 1 ? 'ů' : ''} dokončeno`
    }
    
    return "Pokračujte vpřed"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-48 bg-gray-200 rounded-2xl"></div>
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <style jsx>{`
        @keyframes progressFill {
          0% {
            width: 0%;
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .goal-card {
          animation: fadeInUp 0.3s ease-out forwards;
          opacity: 0;
        }
        
        .goal-card:nth-child(1) { animation-delay: 0ms; }
        .goal-card:nth-child(2) { animation-delay: 50ms; }
        .goal-card:nth-child(3) { animation-delay: 100ms; }
        .goal-card:nth-child(4) { animation-delay: 150ms; }
        .goal-card:nth-child(5) { animation-delay: 200ms; }
        .goal-card:nth-child(6) { animation-delay: 250ms; }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* The Goal Horizon */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Compass className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Váš kompas</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">{getMotivationalMessage()}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {goalProgress.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Mountain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Žádné cíle</h3>
                  <p className="text-gray-600">Vytvořte si svůj první cíl a začněte svou cestu</p>
                </div>
              ) : (
                goalProgress.map((goal, index) => {
                  const IconComponent = getGoalIcon(goal.icon || 'default')
                  return (
                    <div
                      key={goal.id}
                      className="group cursor-pointer goal-card"
                      onClick={() => {
                        setSelectedGoal(goal)
                        setShowGoalDetail(true)
                      }}
                    >
                      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        {/* Goal Icon */}
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        
                        {/* Goal Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{goal.title}</h3>
                        
                        {/* Overdue Warning */}
                        {goal.mostOverdueDays > 0 && (
                          <div className="text-center mb-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                              <span className="mr-1">⚠️</span>
                              {goal.mostOverdueDays} dní zpoždění
                            </div>
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${goal.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                              style={{ 
                                width: `${goal.progressPercentage}%`,
                                animationDelay: `${index * 100}ms`,
                                animation: `progressFill 1s ease-out ${index * 100}ms forwards`
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{goal.completedSteps}/{goal.totalSteps} kroků</span>
                            <span className="font-semibold">{goal.progressPercentage.toFixed(0)}%</span>
                          </div>
                          {goal.metricsProgress > 0 && (
                            <div className="text-xs text-gray-500 text-center">
                              Metriky: {goal.metricsProgress.toFixed(0)}%
                            </div>
                          )}
                          
                          {/* Days Remaining */}
                          <div className="text-center mt-3">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                              <span className="mr-1">📅</span>
                              {goal.daysRemaining > 0 ? `${goal.daysRemaining} dní zbývá` : goal.daysRemaining === 0 ? 'Dnes je deadline!' : `${Math.abs(goal.daysRemaining)} dní po deadline`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* The Path Forward: Next Milestones */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center mb-8">
              <ArrowRight className="w-6 h-6 text-primary-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Další milníky</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.filter(m => !m.completed).slice(0, 6).map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${milestone.goalColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-sm">{milestone.goalIcon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary-600 transition-colors">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{milestone.goalTitle}</p>
                      <div className="flex items-center mt-2">
                        <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {milestone.date.toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {milestones.filter(m => !m.completed).length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Všechny milníky dokončeny!</h3>
                  <p className="text-gray-600">Vytvořte si nové cíle nebo kroky</p>
                </div>
              )}
            </div>
          </div>

          {/* The Journey Log: What's Been Done */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center mb-8">
              <CheckCircle2 className="w-6 h-6 text-primary-500 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Cesta za sebou</h2>
            </div>
            
            <div className="space-y-4">
              {milestones.filter(m => m.completed).slice(0, 5).map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`flex items-center space-x-4 p-4 rounded-xl border transition-colors ${
                    milestone.completed 
                      ? 'bg-primary-50 border-primary-200 hover:bg-primary-100' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    milestone.completed ? 'bg-primary-500' : 'bg-gray-400'
                  }`}>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded bg-gradient-to-br ${milestone.goalColor} flex items-center justify-center`}>
                        <span className="text-white text-xs">{milestone.goalIcon}</span>
                      </div>
                      <span className="text-sm text-gray-600">{milestone.goalTitle}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary-600">
                      {milestone.id.startsWith('goal-') ? '🏆 Cíl dokončen' : '✓ Krok dokončen'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {milestone.date.toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                </div>
              ))}
              
              {milestones.filter(m => m.completed).length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Začněte svou cestu</h3>
                  <p className="text-gray-600">Dokončete svůj první krok nebo cíl a uvidíte ho zde</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goal Detail Modal */}
      {showGoalDetail && selectedGoal && (
        <GoalDetailModal
          goal={selectedGoal}
          steps={steps.filter(step => step.goal_id === selectedGoal.id)}
          onClose={() => setShowGoalDetail(false)}
          onEdit={(updatedGoal) => {
            setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g))
            setShowGoalDetail(false)
          }}
          onDelete={(goalId) => {
            setGoals(goals.filter(g => g.id !== goalId))
            setShowGoalDetail(false)
          }}
        />
      )}
    </div>
  )
}