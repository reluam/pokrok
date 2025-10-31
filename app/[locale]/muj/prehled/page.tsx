'use client'

import { useState, useEffect } from 'react'
import { Goal, DailyStep, GoalMetric, Area, Value } from '@/lib/cesta-db'
import { GoalDetailModal } from '@/components/GoalDetailModal'

// Add pixel art font
if (typeof window !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}
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
  Compass,
  Map,
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  PieChart,
  Activity,
  Zap,
  Eye,
  Layers,
  Navigation,
  Play
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

interface AreaProgress {
  area: Area
  goals: Goal[]
  totalProgress: number
  completedGoals: number
  activeGoals: number
  averageProgress: number
}

type ViewMode = 'timeline' | 'area-map' | 'progress-radar' | 'journey-map' | 'balance-wheel' | 'focus-matrix' | 'roadmap' | 'life-journey' | 'rpg-dashboard' | 'game-map' | 'daily-game'

export default function OverviewPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [steps, setSteps] = useState<DailyStep[]>([])
  const [metrics, setMetrics] = useState<GoalMetric[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [values, setValues] = useState<Value[]>([])
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [areaProgress, setAreaProgress] = useState<AreaProgress[]>([])
  const [showGoalDetail, setShowGoalDetail] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')
  
  // Daily Game State
  const [currentTime, setCurrentTime] = useState(6) // Start at 6 AM
  const [currentDay, setCurrentDay] = useState(1)
  const [energy, setEnergy] = useState(100)
  const [completedToday, setCompletedToday] = useState<string[]>([])
  const [showAreasModal, setShowAreasModal] = useState(false)
  const [showGoalsModal, setShowGoalsModal] = useState(false)
  
  const [gamePhase, setGamePhase] = useState<'daily-setup' | 'playing' | 'menu'>('daily-setup')
  const [dailyStats, setDailyStats] = useState<{
    energy: number
    mood: number
    focus: number
    date: string
  } | null>(null)
  const [habits, setHabits] = useState<Array<{
    id: string
    name: string
    description: string
    frequency: 'daily' | 'weekly' | 'monthly'
    streak: number
  }>>([])
  
  
  
  // Daily setup states
  const [energyLevel, setEnergyLevel] = useState(50)
  const [moodLevel, setMoodLevel] = useState(50)
  const [focusLevel, setFocusLevel] = useState(50)
  const [todayPlan, setTodayPlan] = useState('')

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

  const viewModes = [
    { id: 'timeline' as ViewMode, name: 'Časová osa', icon: Clock, description: 'Cesta v čase s milníky' },
    { id: 'area-map' as ViewMode, name: 'Mapa oblastí', icon: Map, description: 'Přehled podle životních oblastí' },
    { id: 'progress-radar' as ViewMode, name: 'Radarový graf', icon: Activity, description: 'Pokrok v jednotlivých oblastech' },
    { id: 'journey-map' as ViewMode, name: 'Mapa cesty', icon: Navigation, description: 'Vizuální cesta životem' },
    { id: 'balance-wheel' as ViewMode, name: 'Kolo života', icon: PieChart, description: 'Balanc mezi oblastmi' },
    { id: 'focus-matrix' as ViewMode, name: 'Matice soustředění', icon: Target, description: 'Důležité vs. naléhavé' },
    { id: 'roadmap' as ViewMode, name: 'Roadmapa oblastí', icon: Layers, description: 'Cíle podle oblastí v čase' },
    { id: 'life-journey' as ViewMode, name: 'Životní cesta', icon: TrendingUp, description: 'Čárový graf zaměření v čase' },
    { id: 'rpg-dashboard' as ViewMode, name: 'RPG Dashboard', icon: Zap, description: 'Herní přehled s objectives' },
    { id: 'game-map' as ViewMode, name: 'Herní mapa', icon: Map, description: 'Cíle rozmístěné po herní mapě' },
    { id: 'daily-game' as ViewMode, name: 'Denní hra', icon: Play, description: 'Procházej dnem a plň úkoly' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (goals.length > 0 && steps.length > 0) {
      calculateProgress()
      generateMilestones()
      calculateAreaProgress()
    }
  }, [goals, steps, metrics, areas])

  const loadData = async () => {
    try {
      const [goalsResponse, stepsResponse, areasResponse, valuesResponse] = await Promise.all([
        fetch('/api/cesta/goals'),
        fetch('/api/cesta/daily-steps'),
        fetch('/api/cesta/areas'),
        fetch('/api/cesta/values')
      ])

      if (goalsResponse.ok && stepsResponse.ok) {
        const goalsData = await goalsResponse.json()
        const stepsData = await stepsResponse.json()
        
        setGoals(goalsData.goals || goalsData || [])
        setSteps(stepsData.steps || stepsData || [])
        
        if (areasResponse.ok) {
          const areasData = await areasResponse.json()
          setAreas(areasData.areas || [])
        }
        
        if (valuesResponse.ok) {
          const valuesData = await valuesResponse.json()
          setValues(valuesData.values || valuesData || [])
        }
        
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

  const calculateAreaProgress = () => {
    const areaProgressData: AreaProgress[] = areas.map(area => {
      const areaGoals = goals.filter(goal => goal.area_id === area.id)
      const activeAreaGoals = areaGoals.filter(goal => goal.status === 'active')
      const completedAreaGoals = areaGoals.filter(goal => goal.status === 'completed')
      
      const totalProgress = activeAreaGoals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0)
      const averageProgress = activeAreaGoals.length > 0 ? totalProgress / activeAreaGoals.length : 0
      
      return {
        area,
        goals: areaGoals,
        totalProgress,
        completedGoals: completedAreaGoals.length,
        activeGoals: activeAreaGoals.length,
        averageProgress
      }
    })
    
    setAreaProgress(areaProgressData)
  }

  const generateMilestones = () => {
    const allMilestones: Milestone[] = []
    
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
    const completedGoals = goals.filter(g => g.status === 'completed').length
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

  const renderTimelineView = () => (
    <div className="space-y-8">
      {/* Timeline Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Časová osa vaší cesty</h2>
        </div>
        <p className="text-gray-600 mb-8">{getMotivationalMessage()}</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200"></div>
        
        <div className="space-y-8">
          {milestones.slice(0, 10).map((milestone, index) => (
            <div key={milestone.id} className="relative flex items-start space-x-6">
              <div className={`absolute left-6 w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                milestone.completed ? 'bg-green-500' : 'bg-primary-500'
              }`}></div>
              
              <div className={`ml-12 p-6 rounded-xl shadow-lg border ${
                milestone.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${milestone.goalColor} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm">{milestone.goalIcon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{milestone.goalTitle}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {milestone.date.toLocaleDateString('cs-CZ')}
                      {milestone.completed && (
                        <span className="ml-2 text-green-600 font-medium">✓ Dokončeno</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAreaMapView = () => (
    <div className="space-y-8">
      {/* Area Map Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Map className="w-8 h-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Mapa životních oblastí</h2>
        </div>
        <p className="text-gray-600 mb-8">Přehled pokroku podle oblastí vašeho života</p>
      </div>

      {/* Area Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areaProgress.map((areaData, index) => (
          <div key={areaData.area.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: areaData.area.color }}
              />
              <h3 className="text-lg font-semibold text-gray-900">{areaData.area.name}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Aktivní cíle</span>
                <span className="font-semibold">{areaData.activeGoals}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Dokončené cíle</span>
                <span className="font-semibold text-green-600">{areaData.completedGoals}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Průměrný pokrok</span>
                  <span className="font-semibold">{areaData.averageProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${areaData.averageProgress}%`,
                      backgroundColor: areaData.area.color
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProgressRadarView = () => (
    <div className="space-y-8">
      {/* Radar Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Activity className="w-8 h-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Radarový graf pokroku</h2>
        </div>
        <p className="text-gray-600 mb-8">Vizuální přehled pokroku ve všech oblastech</p>
      </div>

      {/* Simple Radar Chart */}
      <div className="flex justify-center">
        <div className="relative w-96 h-96">
          {/* Radar Grid */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            {/* Circles */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
              <circle
                key={i}
                cx="200"
                cy="200"
                r={160 * scale}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Area Lines */}
            {areaProgress.map((areaData, i) => {
              const angle = (i * 2 * Math.PI) / areaProgress.length
              const x = 200 + 160 * Math.cos(angle - Math.PI / 2)
              const y = 200 + 160 * Math.sin(angle - Math.PI / 2)
    return (
                <line
                  key={i}
                  x1="200"
                  y1="200"
                  x2={x}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              )
            })}
            
            {/* Progress Polygon */}
            <polygon
              points={areaProgress.map((areaData, i) => {
                const angle = (i * 2 * Math.PI) / areaProgress.length
                const radius = 160 * (areaData.averageProgress / 100)
                const x = 200 + radius * Math.cos(angle - Math.PI / 2)
                const y = 200 + radius * Math.sin(angle - Math.PI / 2)
                return `${x},${y}`
              }).join(' ')}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>
          
          {/* Area Labels */}
          {areaProgress.map((areaData, i) => {
            const angle = (i * 2 * Math.PI) / areaProgress.length
            const x = 200 + 180 * Math.cos(angle - Math.PI / 2)
            const y = 200 + 180 * Math.sin(angle - Math.PI / 2)
            return (
              <div
                key={i}
                className="absolute text-center"
                style={{
                  left: x - 30,
                  top: y - 10,
                  width: 60
                }}
              >
                <div className="text-xs font-medium text-gray-700">{areaData.area.name}</div>
                <div className="text-xs text-gray-500">{areaData.averageProgress.toFixed(0)}%</div>
            </div>
            )
          })}
          </div>
        </div>
      </div>
    )

  const renderJourneyMapView = () => (
    <div className="space-y-8">
      {/* Journey Map Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Navigation className="w-8 h-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Mapa vaší cesty životem</h2>
        </div>
        <p className="text-gray-600 mb-8">Vizuální reprezentace vaší životní cesty s milníky</p>
      </div>

      {/* Journey Path */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Past */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Minulost</h3>
            <div className="space-y-3">
              {milestones.filter(m => m.completed).slice(0, 3).map((milestone) => (
                <div key={milestone.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${milestone.goalColor} flex items-center justify-center`}>
                      <span className="text-white text-xs">{milestone.goalIcon}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{milestone.title}</span>
                  </div>
                  <div className="text-xs text-gray-600">{milestone.goalTitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Present */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary-600 mb-4">Současnost</h3>
            <div className="space-y-3">
              {goalProgress.slice(0, 3).map((goal) => (
                <div key={goal.id} className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                      <span className="text-white text-xs">🎯</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                  </div>
                  <div className="text-xs text-gray-600">{goal.progressPercentage.toFixed(0)}% dokončeno</div>
                </div>
              ))}
            </div>
          </div>

          {/* Future */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Budoucnost</h3>
            <div className="space-y-3">
              {milestones.filter(m => !m.completed).slice(0, 3).map((milestone) => (
                <div key={milestone.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${milestone.goalColor} flex items-center justify-center`}>
                      <span className="text-white text-xs">{milestone.goalIcon}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{milestone.title}</span>
                  </div>
                  <div className="text-xs text-gray-600">{milestone.goalTitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBalanceWheelView = () => (
    <div className="space-y-8">
      {/* Balance Wheel Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <PieChart className="w-8 h-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Kolo života</h2>
        </div>
        <p className="text-gray-600 mb-8">Balanc mezi různými oblastmi vašeho života</p>
      </div>

      {/* Balance Wheel */}
      <div className="flex justify-center">
        <div className="relative w-96 h-96">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            {/* Wheel Segments */}
            {areaProgress.map((areaData, i) => {
              const angle = (i * 2 * Math.PI) / areaProgress.length
              const nextAngle = ((i + 1) * 2 * Math.PI) / areaProgress.length
              const radius = 160
              const progressRadius = radius * (areaData.averageProgress / 100)
              
              const x1 = 200 + radius * Math.cos(angle - Math.PI / 2)
              const y1 = 200 + radius * Math.sin(angle - Math.PI / 2)
              const x2 = 200 + radius * Math.cos(nextAngle - Math.PI / 2)
              const y2 = 200 + radius * Math.sin(nextAngle - Math.PI / 2)
              
              const progressX1 = 200 + progressRadius * Math.cos(angle - Math.PI / 2)
              const progressY1 = 200 + progressRadius * Math.sin(angle - Math.PI / 2)
              const progressX2 = 200 + progressRadius * Math.cos(nextAngle - Math.PI / 2)
              const progressY2 = 200 + progressRadius * Math.sin(nextAngle - Math.PI / 2)

  return (
                <g key={i}>
                  <path
                    d={`M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                    fill="rgba(229, 231, 235, 0.3)"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <path
                    d={`M 200 200 L ${progressX1} ${progressY1} A ${progressRadius} ${progressRadius} 0 0 1 ${progressX2} ${progressY2} Z`}
                    fill={areaData.area.color}
                    opacity="0.7"
                  />
                </g>
              )
            })}
          </svg>
          
          {/* Area Labels */}
          {areaProgress.map((areaData, i) => {
            const angle = (i * 2 * Math.PI) / areaProgress.length
            const x = 200 + 90 * Math.cos(angle - Math.PI / 2)
            const y = 200 + 90 * Math.sin(angle - Math.PI / 2)
            return (
              <div
                key={i}
                className="absolute text-center"
                style={{
                  left: x - 40,
                  top: y - 10,
                  width: 80
                }}
              >
                <div className="text-xs font-medium text-gray-700">{areaData.area.name}</div>
                <div className="text-xs text-gray-500">{areaData.averageProgress.toFixed(0)}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderFocusMatrixView = () => (
    <div className="space-y-8">
      {/* Focus Matrix Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Target className="w-8 h-8 text-primary-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Matice soustředění</h2>
        </div>
        <p className="text-gray-600 mb-8">Rozdělení cílů podle důležitosti a naléhavosti</p>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Quadrant 1: Important & Urgent */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Důležité & Naléhavé</h3>
          <div className="space-y-2">
            {goalProgress.filter(goal => goal.mostOverdueDays > 0).map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${goal.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                </div>
                <div className="text-xs text-red-600 mt-1">
                  {goal.mostOverdueDays} dní zpoždění
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: Important & Not Urgent */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Důležité & Nenaléhavé</h3>
          <div className="space-y-2">
            {goalProgress.filter(goal => goal.mostOverdueDays === 0 && goal.priority === 'meaningful').map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${goal.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {goal.daysRemaining > 0 ? `${goal.daysRemaining} dní zbývá` : 'Bez termínu'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 3: Not Important & Urgent */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-700 mb-4">Nedůležité & Naléhavé</h3>
          <div className="space-y-2">
            {goalProgress.filter(goal => goal.mostOverdueDays === 0 && goal.priority === 'nice-to-have' && goal.daysRemaining <= 7).map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${goal.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  {goal.daysRemaining} dní zbývá
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Not Important & Not Urgent */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Nedůležité & Nenaléhavé</h3>
          <div className="space-y-2">
            {goalProgress.filter(goal => goal.mostOverdueDays === 0 && goal.priority === 'nice-to-have' && goal.daysRemaining > 7).map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${goal.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {goal.daysRemaining > 0 ? `${goal.daysRemaining} dní zbývá` : 'Bez termínu'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderRoadmapView = () => {
    // Calculate timeline bounds
    const allDates = [
      ...goals.map(g => g.created_at ? new Date(g.created_at) : new Date()),
      ...goals.map(g => g.target_date ? new Date(g.target_date) : new Date()),
      ...steps.map(s => new Date(s.date))
    ].filter(date => !isNaN(date.getTime()))
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    // Extend timeline by 3 months on each side
    minDate.setMonth(minDate.getMonth() - 3)
    maxDate.setMonth(maxDate.getMonth() + 3)
    
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const getPositionFromDate = (date: Date) => {
      const daysFromStart = Math.ceil((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
      return (daysFromStart / totalDays) * 100
  }

  return (
      <div className="space-y-8">
        {/* Roadmap Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
            <Layers className="w-8 h-8 text-primary-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Roadmapa oblastí</h2>
            </div>
          <p className="text-gray-600 mb-8">Cíle podle oblastí rozmístěné v čase</p>
        </div>

        {/* Timeline Header */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{minDate.toLocaleDateString('cs-CZ')}</span>
            <span className="text-center font-medium">Timeline</span>
            <span>{maxDate.toLocaleDateString('cs-CZ')}</span>
                </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600 rounded-full"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-primary-600 rounded-full"></div>
            <span className="absolute top-3 left-1/2 transform -translate-x-1/2 text-xs text-primary-600 font-medium">Dnes</span>
          </div>
        </div>

        {/* Roadmap Lines */}
        <div className="space-y-6">
          {areaProgress.map((areaData, areaIndex) => {
            const areaGoals = goalProgress.filter(goal => goal.area_id === areaData.area.id)
            
            return (
              <div key={areaData.area.id} className="relative">
                {/* Area Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: areaData.area.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{areaData.area.name}</h3>
                  <span className="text-sm text-gray-500">({areaGoals.length} cílů)</span>
                </div>

                {/* Timeline Line */}
                <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200"></div>
                  
                  {/* Goals on Timeline */}
                  {areaGoals.map((goal, goalIndex) => {
                    const startPos = getPositionFromDate(new Date(goal.created_at || new Date()))
                    const endPos = goal.target_date ? getPositionFromDate(new Date(goal.target_date)) : startPos + 10
                    const width = Math.max(endPos - startPos, 5)
                    
                  return (
                    <div
                      key={goal.id}
                        className="absolute top-2 h-12 rounded-lg border-2 border-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 group"
                        style={{
                          left: `${startPos}%`,
                          width: `${width}%`,
                          backgroundColor: areaData.area.color,
                          opacity: goal.status === 'completed' ? 0.8 : 1
                        }}
                      onClick={() => {
                        setSelectedGoal(goal)
                        setShowGoalDetail(true)
                      }}
                        title={`${goal.title} - ${goal.progressPercentage.toFixed(0)}% dokončeno`}
                      >
                        {/* Goal Content */}
                        <div className="p-2 h-full flex flex-col justify-center">
                          <div className="text-white text-xs font-medium truncate">
                            {goal.title}
                          </div>
                          <div className="text-white text-xs opacity-80">
                            {goal.progressPercentage.toFixed(0)}%
                          </div>
                        </div>
                        
                        {/* Progress Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30 rounded-b-lg">
                          <div 
                            className="h-full bg-white bg-opacity-60 rounded-b-lg transition-all duration-500"
                            style={{ width: `${goal.progressPercentage}%` }}
                          />
                        </div>

                        {/* Status Indicators */}
                        {goal.mostOverdueDays > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                        )}
                        {goal.status === 'completed' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle2 className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Today Marker */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-primary-600 opacity-60" style={{ left: `${getPositionFromDate(new Date())}%` }}></div>
                          </div>

                {/* Area Stats */}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Aktivní: {areaData.activeGoals}</span>
                  <span>Dokončené: {areaData.completedGoals}</span>
                  <span>Průměrný pokrok: {areaData.averageProgress.toFixed(0)}%</span>
                          </div>
                            </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Legenda</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded"></div>
              <span>Aktivní cíle</span>
                            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Dokončené cíle</span>
                          </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Zpožděné cíle</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-0.5 h-3 bg-primary-600"></div>
              <span>Dnešní datum</span>
            </div>
                        </div>
                      </div>
                    </div>
                  )
  }


  const renderDailySetupView = () => {
    const startDay = () => {
      const stats = {
        energy: energyLevel,
        mood: moodLevel,
        focus: focusLevel,
        date: new Date().toISOString().split('T')[0]
      }
      
      setDailyStats(stats)
      setEnergy(energyLevel)
      setGamePhase('playing')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full" style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px'
        }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{
              textShadow: '2px 2px 0px #000000',
              color: '#2d5016'
            }}>DENNÍ NASTAVENÍ</h1>
            <p className="text-gray-600">Jak se cítíš dnes?</p>
          </div>

          {/* Energy Level */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">ENERGIE: {energyLevel}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>VYČERPANÝ</span>
              <span>PLNÝ ENERGIE</span>
            </div>
          </div>

          {/* Mood Level */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">NÁLADA: {moodLevel}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={moodLevel}
              onChange={(e) => setMoodLevel(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>SMUTNÝ</span>
              <span>ŠŤASTNÝ</span>
            </div>
          </div>

          {/* Focus Level */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">SOUSTŘEDĚNÍ: {focusLevel}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={focusLevel}
              onChange={(e) => setFocusLevel(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>ROZTRŽITÝ</span>
              <span>SOUSTŘEDĚNÝ</span>
            </div>
          </div>

          {/* Today's Plan */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-900 mb-2">CO CHCEŠ DNES UDĚLAT?</label>
            <textarea
              value={todayPlan}
              onChange={(e) => setTodayPlan(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Napiš svůj plán na dnešek..."
              rows={3}
            />
          </div>

          {/* Start Day Button */}
          <div className="text-center">
            <button
              onClick={startDay}
              className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-300"
            >
              ZAČÍT DEN
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderMenuView = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full" style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px'
        }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{
              textShadow: '2px 2px 0px #000000',
              color: '#2d5016'
            }}>MENU</h1>
            <p className="text-gray-600">Spravuj svou hru</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setGamePhase('playing')}
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300 hover:border-green-500 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">POKRAČOVAT V HRÁCH</h3>
              <p className="text-xs text-gray-600">Vrať se do hry</p>
            </button>

            <button
              onClick={() => setShowGoalsModal(true)}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 hover:border-blue-500 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">SPRAVOVAT CÍLE</h3>
              <p className="text-xs text-gray-600">Uprav své cíle</p>
            </button>

            <button
              onClick={() => setShowAreasModal(true)}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 hover:border-purple-500 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">OBLASTI ŽIVOTA</h3>
              <p className="text-xs text-gray-600">Zobrazit oblasti</p>
            </button>

            <button
              onClick={() => setGamePhase('daily-setup')}
              className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-300 hover:border-orange-500 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">DENNÍ NASTAVENÍ</h3>
              <p className="text-xs text-gray-600">Nastavit nový den</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderDailyGameView = () => {
    // Get today's available tasks based on current time and energy
    const getAvailableTasks = () => {
      const timeOfDay = currentTime < 12 ? 'morning' : currentTime < 18 ? 'afternoon' : 'evening'
      const energyThreshold = energy > 50 ? 'high' : energy > 25 ? 'medium' : 'low'
      
      return goalProgress.filter(goal => {
        // Filter by time appropriateness and energy level
        const isAppropriateTime = goal.priority === 'meaningful' || 
          (timeOfDay === 'morning' && goal.priority === 'nice-to-have') ||
          (timeOfDay === 'evening' && goal.priority === 'nice-to-have')
        
        const hasEnoughEnergy = energyThreshold === 'high' || 
          (energyThreshold === 'medium' && goal.totalSteps <= 5) ||
          (energyThreshold === 'low' && goal.totalSteps <= 2)
        
        return isAppropriateTime && hasEnoughEnergy && !completedToday.includes(goal.id)
      }).slice(0, 3) // Show max 3 tasks
    }

    const availableTasks = getAvailableTasks()
    
    const completeTask = (taskId: string) => {
      setCompletedToday(prev => [...prev, taskId])
      setEnergy(prev => Math.max(0, prev - 15))
      
      // Add XP and check for level up
      const xpGain = 25
      // Could add level up logic here
    }

    const advanceTime = () => {
      setCurrentTime(prev => {
        if (prev >= 22) {
          setCurrentDay(prev => prev + 1)
          setEnergy(100)
          setCompletedToday([])
          return 6 // Reset to morning
        }
        return prev + 2 // Advance by 2 hours
      })
    }

    const rest = () => {
      setEnergy(prev => Math.min(100, prev + 30))
      advanceTime()
    }

    const getTimeLabel = (hour: number) => {
      if (hour < 12) return `${hour}:00 DOPOLEDNE`
      if (hour < 18) return `${hour}:00 ODPOLEDNE`
      return `${hour}:00 VEČER`
    }

    return (
      <div className="space-y-6">
        {/* Game Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
            <Play className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900" style={{ 
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '2px 2px 0px #000000',
              color: '#2d5016'
            }}>DENNÍ HRA</h2>
            </div>
          <p className="text-gray-600 mb-8" style={{ 
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#4a4a4a'
          }}>Procházej dnem a plň úkoly</p>
        </div>

        {/* Game Status Bar */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 text-white shadow-2xl" style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Day & Time */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">DEN</span>
                <span className="text-2xl font-bold text-yellow-400">{currentDay}</span>
              </div>
              <div className="text-xs text-gray-400">
                {getTimeLabel(currentTime)}
              </div>
            </div>

            {/* Energy */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">ENERGIE</span>
                <span className="text-2xl font-bold text-blue-400">{energy}</span>
              </div>
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>

            {/* Completed Today */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">SPLNĚNO</span>
                <span className="text-2xl font-bold text-green-400">{completedToday.length}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Úkolů dnes
              </div>
            </div>

            {/* Available Tasks */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">DOSTUPNÉ</span>
                <span className="text-2xl font-bold text-orange-400">{availableTasks.length}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Úkolů k dispozici
              </div>
            </div>
          </div>
        </div>

        {/* Available Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {availableTasks.map((task, index) => (
            <div
              key={task.id}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-300 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => completeTask(task.id)}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '8px'
              }}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${task.color} flex items-center justify-center mr-4`}>
                  <span className="text-white text-lg">{task.icon || '🎯'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-xs text-gray-600">{task.completedSteps}/{task.totalSteps} kroků</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>POKROK</span>
                  <span className="font-bold">{task.progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${task.color} rounded-full`}
                    style={{ width: `${task.progressPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* Task Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>ENERGIE:</span>
                  <span className="font-bold text-red-500">-15</span>
                </div>
                <div className="flex justify-between">
                  <span>XP:</span>
                  <span className="font-bold text-green-500">+25</span>
                </div>
                {task.target_date && (
                  <div className="flex justify-between">
                    <span>DEADLINE:</span>
                    <span>{new Date(task.target_date).toLocaleDateString('cs-CZ')}</span>
                  </div>
                )}
              </div>
              
              {/* Click to complete */}
              <div className="mt-4 text-center">
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                  KLIKNI PRO SPLNĚNÍ
                </div>
              </div>
            </div>
          ))}
          
          {availableTasks.length === 0 && (
                <div className="col-span-full text-center py-12">
              <div className="bg-gray-100 rounded-xl p-8" style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px'
              }}>
                <div className="text-gray-600 mb-4">
                  {energy <= 25 ? 'MÁLO ENERGIE!' : 'ŽÁDNÉ ÚKOLY!'}
                </div>
                <p className="text-gray-500">
                  {energy <= 25 ? 'Jdi si odpočinout nebo počkej na další den' : 'Všechny úkoly jsou splněné nebo není vhodný čas'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={advanceTime}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px'
            }}
          >
            POSTUP ČASU (+2H)
          </button>
          
          <button
            onClick={rest}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px'
            }}
          >
            ODPOČINEK (+30 ENERGIE)
          </button>
          
          <button
            onClick={() => setShowAreasModal(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px'
            }}
          >
            OBLASTI
          </button>
          
          <button
            onClick={() => setShowGoalsModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px'
            }}
          >
            CÍLE
          </button>
          
          <button
            onClick={() => setGamePhase('menu')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px'
            }}
          >
            MENU
          </button>
        </div>

        {/* Areas Modal */}
        {showAreasModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl max-h-96 overflow-y-auto" style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px'
            }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">OBLASTI ŽIVOTA</h3>
                <button
                  onClick={() => setShowAreasModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  ZAVŘÍT
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areas.map((area) => (
                  <div key={area.id} className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                    <h4 className="font-bold text-gray-900 mb-2">{area.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{area.description}</p>
                    <div className="text-xs text-gray-500">
                      Cílů: {goals.filter(g => g.area_id === area.id).length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Goals Modal */}
        {showGoalsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-6xl max-h-96 overflow-y-auto" style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '8px'
            }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">VŠECHNY CÍLE</h3>
                <button
                  onClick={() => setShowGoalsModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  ZAVŘÍT
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalProgress.map((goal) => (
                  <div key={goal.id} className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center mr-3`}>
                        <span className="text-white text-xs">{goal.icon || '🎯'}</span>
                      </div>
                      <h4 className="font-bold text-gray-900">{goal.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{goal.completedSteps}/{goal.totalSteps} kroků</p>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${goal.color} rounded-full`}
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Pokrok: {goal.progressPercentage.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderRPGDashboardView = () => {
    // Calculate user level based on completed goals and steps
    const completedGoalsCount = goals.filter(g => g.status === 'completed').length
    const completedStepsCount = steps.filter(s => s.completed).length
    const userLevel = Math.floor((completedGoalsCount * 10 + completedStepsCount) / 5) + 1
    const xpToNextLevel = ((userLevel) * 5) - (completedGoalsCount * 10 + completedStepsCount)
    
    // Classify goals as quests
    const mainQuests = goalProgress.filter(g => g.priority === 'meaningful' && g.status === 'active')
    const sideQuests = goalProgress.filter(g => g.priority === 'nice-to-have' && g.status === 'active')
    const completedQuests = goals.filter(g => g.status === 'completed')
    
    // Get achievements (milestones)
    const recentAchievements = milestones.filter(m => m.completed).slice(0, 5)

                  return (
      <div className="space-y-6">
        {/* RPG Dashboard Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-yellow-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Quest Dashboard</h2>
          </div>
          <p className="text-gray-600 mb-8">Tvá dobrodružná cesta životem</p>
        </div>

        {/* Player Stats */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 text-white shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Level & XP */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Úroveň</span>
                <span className="text-2xl font-bold text-yellow-400">{userLevel}</span>
              </div>
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  style={{ width: `${((completedGoalsCount * 10 + completedStepsCount) % ((userLevel) * 5)) / ((userLevel) * 5) * 100}%` }}
                            />
                          </div>
              <p className="text-xs text-gray-400 mt-1">{xpToNextLevel} XP do další úrovně</p>
                          </div>

            {/* Active Quests */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Aktivní questy</span>
                <span className="text-2xl font-bold text-blue-400">{mainQuests.length + sideQuests.length}</span>
                            </div>
              <p className="text-xs text-gray-400 mt-2">
                {mainQuests.length} hlavní, {sideQuests.length} vedlejší
              </p>
            </div>

            {/* Completed Quests */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Dokončené questy</span>
                <span className="text-2xl font-bold text-green-400">{completedQuests.length}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {completedStepsCount} kroků splněno
              </p>
            </div>

            {/* Achievements */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Úspěchy</span>
                <span className="text-2xl font-bold text-purple-400">{recentAchievements.length}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Nedávné milníky
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Quests */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-300 shadow-lg">
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="text-xl font-bold text-orange-900">Hlavní questy</h3>
              <span className="ml-auto bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {mainQuests.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mainQuests.map((goal) => (
                    <div
                      key={goal.id}
                  className="bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedGoal(goal)
                        setShowGoalDetail(true)
                      }}
                    >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                        <span className="text-white text-xs">{goal.icon || '⭐'}</span>
                      </div>
                      <h4 className="font-bold text-gray-900">{goal.title}</h4>
                    </div>
                    {goal.mostOverdueDays > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        URGENT
                      </span>
                    )}
                        </div>
                        
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Pokrok</span>
                      <span className="font-bold">{goal.progressPercentage.toFixed(0)}%</span>
                            </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${goal.color} rounded-full`}
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                          </div>
                        </div>
                  
                  {/* Quest Info */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{goal.completedSteps}/{goal.totalSteps} úkolů</span>
                    {goal.target_date && (
                      <span>Deadline: {new Date(goal.target_date).toLocaleDateString('cs-CZ')}</span>
                    )}
                            </div>
                    </div>
              ))}
              
              {mainQuests.length === 0 && (
                <div className="text-center py-8 text-orange-600">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Žádné hlavní questy</p>
                          </div>
                        )}
            </div>
          </div>

          {/* Side Quests */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
            <div className="flex items-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-bold text-blue-900">Vedlejší questy</h3>
              <span className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {sideQuests.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sideQuests.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedGoal(goal)
                    setShowGoalDetail(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${goal.color} flex items-center justify-center`}>
                        <span className="text-white text-xs">{goal.icon || '🎯'}</span>
                    </div>
                      <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                      </div>
                    </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Pokrok</span>
                      <span className="font-bold">{goal.progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${goal.color} rounded-full`}
                        style={{ width: `${goal.progressPercentage}%` }}
                            />
                          </div>
                          </div>
                  
                  {/* Quest Info */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{goal.completedSteps}/{goal.totalSteps} úkolů</span>
                    {goal.target_date && (
                      <span>{new Date(goal.target_date).toLocaleDateString('cs-CZ')}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {sideQuests.length === 0 && (
                <div className="text-center py-8 text-blue-600">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Žádné vedlejší questy</p>
                            </div>
                          )}
            </div>
            </div>
          </div>

        {/* Recent Achievements */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300 shadow-lg">
          <div className="flex items-center mb-4">
            <Star className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-xl font-bold text-purple-900">Nedávné úspěchy</h3>
                            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-lg p-3 border border-purple-200 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${achievement.goalColor} flex items-center justify-center`}>
                  <span className="text-2xl">{achievement.goalIcon}</span>
                          </div>
                <h4 className="text-xs font-semibold text-gray-900 text-center mb-1 truncate">
                  {achievement.title}
                </h4>
                <p className="text-xs text-gray-500 text-center">
                  {achievement.date.toLocaleDateString('cs-CZ')}
                </p>
                        </div>
            ))}
            
            {recentAchievements.length === 0 && (
              <div className="col-span-full text-center py-8 text-purple-600">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Ještě žádné úspěchy</p>
                    </div>
            )}
                  </div>
                      </div>
                    </div>
                  )
  }

  const renderGameMapView = () => {
    // Create a dynamic path through the map
    const createDynamicPath = () => {
      if (goalProgress.length === 0) return []
      
      // Sort goals by creation date or priority
      const sortedGoals = [...goalProgress].sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        return 0
      })
      
      // Create path points along a winding road
      const pathPoints = sortedGoals.map((goal, index) => {
        const totalGoals = sortedGoals.length
        const progress = index / Math.max(totalGoals - 1, 1)
        
        // Create a winding path from left to right
        const baseX = 10 + (progress * 80) // 10% to 90% horizontally
        const waveY = 30 + Math.sin(progress * Math.PI * 2) * 20 // Wave pattern
        const randomOffset = (Math.sin(index * 1.5) * 5) // Small random variation
        
        return {
          ...goal,
          x: Math.max(5, Math.min(95, baseX + randomOffset)),
          y: Math.max(10, Math.min(90, waveY + randomOffset)),
          pathIndex: index
        }
      })
      
      return pathPoints
    }

    const mapGoals = createDynamicPath()

    return (
      <div className="space-y-6">
        {/* Game Map Header - Pixel Art Style */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Map className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900" style={{ 
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '2px 2px 0px #000000',
              color: '#2d5016'
            }}>MAPA DOBRODRUŽSTVÍ</h2>
            </div>
          <p className="text-gray-600 mb-8" style={{ 
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#4a4a4a'
          }}>Tvé cíle rozmístěné po krajině života</p>
          </div>

        {/* Map Container - Pixel Art Style */}
        <div className="relative rounded-xl p-8 border-4 shadow-2xl overflow-hidden"
             style={{ 
               minHeight: '600px',
               background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #DDA0DD 100%)',
               borderColor: '#2d5016',
               borderStyle: 'solid',
               borderWidth: '4px',
               imageRendering: 'pixelated'
             }}>
          
          {/* Map Background Elements - Pixel Art Style */}
          <div className="absolute inset-0 opacity-40" style={{ imageRendering: 'pixelated' }}>
            {/* Mountains - Pixel Art */}
            <div className="absolute bottom-0 left-0 w-32 h-32 transform -translate-y-10" 
                 style={{ 
                   background: 'linear-gradient(45deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                   clipPath: 'polygon(0% 100%, 25% 0%, 50% 20%, 75% 0%, 100% 100%)'
                 }}></div>
            <div className="absolute bottom-0 left-20 w-24 h-24 transform -translate-y-8"
                 style={{ 
                   background: 'linear-gradient(45deg, #A0522D 0%, #8B4513 50%, #A0522D 100%)',
                   clipPath: 'polygon(0% 100%, 30% 0%, 60% 15%, 100% 100%)'
                 }}></div>
            <div className="absolute bottom-0 right-10 w-40 h-40 transform -translate-y-12"
                 style={{ 
                   background: 'linear-gradient(45deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
                   clipPath: 'polygon(0% 100%, 20% 0%, 40% 25%, 60% 0%, 80% 20%, 100% 100%)'
                 }}></div>
            
            {/* Trees - Pixel Art */}
            <div className="absolute top-20 left-10 w-6 h-8" 
                 style={{ 
                   background: 'linear-gradient(to bottom, #228B22 0%, #228B22 60%, #8B4513 60%, #8B4513 100%)',
                   clipPath: 'polygon(50% 0%, 0% 60%, 100% 60%)'
                 }}></div>
            <div className="absolute top-30 left-20 w-6 h-8"
                 style={{ 
                   background: 'linear-gradient(to bottom, #228B22 0%, #228B22 60%, #8B4513 60%, #8B4513 100%)',
                   clipPath: 'polygon(50% 0%, 0% 60%, 100% 60%)'
                 }}></div>
            <div className="absolute top-40 right-30 w-6 h-8"
                 style={{ 
                   background: 'linear-gradient(to bottom, #228B22 0%, #228B22 60%, #8B4513 60%, #8B4513 100%)',
                   clipPath: 'polygon(50% 0%, 0% 60%, 100% 60%)'
                 }}></div>
            <div className="absolute top-60 left-40 w-6 h-8"
                 style={{ 
                   background: 'linear-gradient(to bottom, #228B22 0%, #228B22 60%, #8B4513 60%, #8B4513 100%)',
                   clipPath: 'polygon(50% 0%, 0% 60%, 100% 60%)'
                 }}></div>
            <div className="absolute top-80 right-20 w-6 h-8"
                 style={{ 
                   background: 'linear-gradient(to bottom, #228B22 0%, #228B22 60%, #8B4513 60%, #8B4513 100%)',
                   clipPath: 'polygon(50% 0%, 0% 60%, 100% 60%)'
                 }}></div>
            
            {/* Clouds - Pixel Art */}
            <div className="absolute top-10 left-20 w-16 h-8 opacity-80"
                 style={{ 
                   background: 'linear-gradient(45deg, #FFFFFF 0%, #F0F8FF 50%, #FFFFFF 100%)',
                   clipPath: 'polygon(0% 50%, 20% 0%, 40% 20%, 60% 0%, 80% 20%, 100% 50%, 80% 100%, 60% 80%, 40% 100%, 20% 80%, 0% 50%)'
                 }}></div>
            <div className="absolute top-30 right-30 w-20 h-10 opacity-80"
                 style={{ 
                   background: 'linear-gradient(45deg, #FFFFFF 0%, #F0F8FF 50%, #FFFFFF 100%)',
                   clipPath: 'polygon(0% 50%, 15% 0%, 35% 20%, 55% 0%, 75% 20%, 100% 50%, 75% 100%, 55% 80%, 35% 100%, 15% 80%, 0% 50%)'
                 }}></div>
            <div className="absolute top-50 left-60 w-12 h-6 opacity-80"
                 style={{ 
                   background: 'linear-gradient(45deg, #FFFFFF 0%, #F0F8FF 50%, #FFFFFF 100%)',
                   clipPath: 'polygon(0% 50%, 25% 0%, 50% 20%, 75% 0%, 100% 50%, 75% 100%, 50% 80%, 25% 100%, 0% 50%)'
                 }}></div>
            </div>
            
          {/* Dynamic Journey Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {mapGoals.length > 1 && (() => {
              // Create a smooth path connecting goals in order
              const sortedGoals = [...mapGoals].sort((a, b) => a.pathIndex - b.pathIndex)
              let pathData = `M ${sortedGoals[0].x}% ${sortedGoals[0].y}%`
              
              for (let i = 1; i < sortedGoals.length; i++) {
                const prevGoal = sortedGoals[i - 1]
                const currentGoal = sortedGoals[i]
                
                // Create smooth curves between goals
                const controlX1 = prevGoal.x + (currentGoal.x - prevGoal.x) * 0.3
                const controlY1 = prevGoal.y
                const controlX2 = prevGoal.x + (currentGoal.x - prevGoal.x) * 0.7
                const controlY2 = currentGoal.y
                
                pathData += ` C ${controlX1}% ${controlY1}%, ${controlX2}% ${controlY2}%, ${currentGoal.x}% ${currentGoal.y}%`
              }
              
              return (
                <path
                  d={pathData}
                  stroke="#8B4513"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.7"
                  strokeDasharray="8,4"
                  className="animate-pulse"
                  style={{ 
                    filter: 'drop-shadow(2px 2px 0px #654321)',
                    imageRendering: 'pixelated'
                  }}
                />
              )
            })()}
            
            {/* Completed path sections */}
            {mapGoals.length > 1 && (() => {
              const sortedGoals = [...mapGoals].sort((a, b) => a.pathIndex - b.pathIndex)
              const completedGoals = sortedGoals.filter(g => g.status === 'completed' || g.progressPercentage >= 100)
              
              if (completedGoals.length > 1) {
                let pathData = `M ${completedGoals[0].x}% ${completedGoals[0].y}%`
                
                for (let i = 1; i < completedGoals.length; i++) {
                  const prevGoal = completedGoals[i - 1]
                  const currentGoal = completedGoals[i]
                  
                  const controlX1 = prevGoal.x + (currentGoal.x - prevGoal.x) * 0.3
                  const controlY1 = prevGoal.y
                  const controlX2 = prevGoal.x + (currentGoal.x - prevGoal.x) * 0.7
                  const controlY2 = currentGoal.y
                  
                  pathData += ` C ${controlX1}% ${controlY1}%, ${controlX2}% ${controlY2}%, ${currentGoal.x}% ${currentGoal.y}%`
                }
                
                return (
                  <path
                    d={pathData}
                    stroke="#22c55e"
                    strokeWidth="5"
                    fill="none"
                    opacity="0.9"
                    className="drop-shadow-lg"
                    style={{ 
                      filter: 'drop-shadow(2px 2px 0px #166534)',
                      imageRendering: 'pixelated'
                    }}
                  />
                )
              }
              return null
            })()}
            
            {/* Path markers for each goal */}
            {mapGoals.map((goal, index) => (
              <circle
                key={`marker-${goal.id}`}
                cx={`${goal.x}%`}
                cy={`${goal.y}%`}
                r="3"
                fill="#8B4513"
                opacity="0.8"
                style={{ imageRendering: 'pixelated' }}
              />
            ))}
          </svg>

          {/* Goals on Map */}
          <div className="relative w-full h-full" style={{ minHeight: '550px', zIndex: 2 }}>
            {mapGoals.map((goal, index) => {
              const isOverdue = goal.mostOverdueDays > 0
              const isComplete = goal.status === 'completed' || goal.progressPercentage >= 100
              const isNearDeadline = goal.daysRemaining > 0 && goal.daysRemaining <= 7
              
              return (
                <div
                  key={goal.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
                  style={{
                    left: `${goal.x}%`,
                    top: `${goal.y}%`
                  }}
                  onClick={() => {
                    setSelectedGoal(goal)
                    setShowGoalDetail(true)
                  }}
                >
                  {/* Goal Marker - Game Style */}
                  <div className="relative">
                    {/* Glow effect for completed goals */}
                    {isComplete && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-50 scale-125"></div>
                        {/* Floating particles for completed goals */}
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
                              style={{
                                left: `${20 + (i * 10)}%`,
                                top: `${20 + (i * 5)}%`,
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '2s'
                              }}
                            />
                          ))}
                    </div>
                      </>
                    )}
                    
                    {/* Pulse effect for urgent goals */}
                    {isOverdue && (
                      <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                    )}
                    
                    {/* Main marker - smaller and more game-like */}
                    <div className={`relative w-12 h-12 rounded-full shadow-lg border-3 flex items-center justify-center transform transition-all duration-300 hover:scale-110 ${
                      isComplete ? 'border-green-500 bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/50' :
                      isOverdue ? 'border-red-500 bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50 animate-pulse' :
                      isNearDeadline ? 'border-orange-500 bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/50' :
                      'border-blue-500 bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50'
                    }`} style={{ 
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))'
                    }}>
                      <span className="text-lg drop-shadow-lg" style={{ 
                        imageRendering: 'pixelated',
                        filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.5))'
                      }}>{goal.icon || '🎯'}</span>
                      
                      {/* Inner ring for progress */}
                      {!isComplete && (
                        <div className="absolute inset-2 rounded-full border-2 border-white/30">
                          <div 
                            className="absolute inset-0 rounded-full border-2 border-white/60 transition-all duration-1000"
                            style={{ 
                              clipPath: `polygon(0 0, ${goal.progressPercentage}% 0, ${goal.progressPercentage}% 100%, 0 100%)`
                            }}
                          />
                      </div>
              )}
                    </div>
                    
                    {/* Status badge - smaller */}
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                      isComplete ? 'bg-green-500 text-white' :
                      isOverdue ? 'bg-red-500 text-white' :
                      isNearDeadline ? 'bg-orange-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {isComplete ? '✓' : goal.progressPercentage.toFixed(0)}
                  </div>
                    
                    {/* Path number indicator */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold" style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '6px',
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.5))'
                    }}>
                      {goal.pathIndex + 1}
                </div>
                    
                    {/* Goal label - smaller and more compact */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-yellow-100 to-yellow-200 px-2 py-1 rounded-lg shadow-md border border-yellow-400 whitespace-nowrap" style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '6px',
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.3))'
                    }}>
                      <p className="text-xs font-bold text-gray-900 drop-shadow-sm">{goal.title}</p>
                      <p className="text-xs text-gray-700 font-medium">
                        {goal.completedSteps}/{goal.totalSteps}
                      </p>
                </div>
            </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg border border-gray-300">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Legenda</h4>
            <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                <span>Aktivní cíl</span>
                </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-orange-100 border-2 border-orange-500"></div>
                <span>Blízko deadline</span>
                    </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-100 border-2 border-red-500"></div>
                <span>Zpožděný cíl</span>
                  </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-500"></div>
                <span>Dokončený cíl</span>
                    </div>
            </div>
            </div>
            
          {/* Player Position Indicator - Pixel Art */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-white" style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))'
          }}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ imageRendering: 'pixelated' }}></div>
              <span className="text-sm font-bold">HRÁČ</span>
            </div>
            <div className="text-xs opacity-90">
              ÚROVEŇ {Math.floor((goals.filter(g => g.status === 'completed').length * 10 + steps.filter(s => s.completed).length) / 5) + 1}
            </div>
            </div>
            
          {/* Compass - Pixel Art */}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-3 shadow-lg border border-gray-300" style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))'
          }}>
            <Compass className="w-8 h-8 text-gray-700" />
          </div>

          {/* Checkpoint Counter - Pixel Art */}
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-white" style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.3))'
          }}>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="text-sm font-bold">
                {mapGoals.filter(g => g.status === 'completed' || g.progressPercentage >= 100).length}/{mapGoals.length}
              </span>
            </div>
            <div className="text-xs opacity-90">CHECKPOINTY</div>
          </div>
        </div>

        {/* Map Stats - Pixel Art Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200" style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))'
          }}>
            <div className="text-2xl font-bold text-blue-600">{mapGoals.filter(g => g.status === 'active' && g.progressPercentage < 100).length}</div>
            <div className="text-sm text-gray-600">AKTIVNÍ LOKACE</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200" style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))'
          }}>
            <div className="text-2xl font-bold text-green-600">{mapGoals.filter(g => g.status === 'completed' || g.progressPercentage >= 100).length}</div>
            <div className="text-sm text-gray-600">OBJEVENO</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200" style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))'
          }}>
            <div className="text-2xl font-bold text-orange-600">{mapGoals.filter(g => g.daysRemaining <= 7 && g.daysRemaining > 0 && g.progressPercentage < 100).length}</div>
            <div className="text-sm text-gray-600">BLÍZKÉ CÍLE</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200" style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))'
          }}>
            <div className="text-2xl font-bold text-red-600">{mapGoals.filter(g => g.mostOverdueDays > 0 && g.progressPercentage < 100).length}</div>
            <div className="text-sm text-gray-600">ZPOŽDĚNÍ</div>
          </div>
        </div>
      </div>
    )
  }

  const renderLifeJourneyView = () => {
    // Calculate focus over time based on goal activity and progress
    const calculateFocusOverTime = () => {
      const timePoints: { date: Date; areaFocus: Record<string, number> }[] = []
      
      // Get all unique dates from goals and steps
      const allDates = new Set<string>()
      goals.forEach(goal => {
        if (goal.created_at) allDates.add(new Date(goal.created_at).toISOString().split('T')[0])
        if (goal.target_date) allDates.add(new Date(goal.target_date).toISOString().split('T')[0])
      })
      steps.forEach(step => {
        allDates.add(new Date(step.date).toISOString().split('T')[0])
      })
      
      // Sort dates and create time points
      const sortedDates = Array.from(allDates).sort()
      
      sortedDates.forEach(dateStr => {
        const date = new Date(dateStr)
        const areaFocus: Record<string, number> = {}
        
        // Calculate focus for each area based on active goals and completed steps
        areas.forEach(area => {
          const areaGoals = goals.filter(goal => goal.area_id === area.id)
          const areaSteps = steps.filter(step => {
            const goal = goals.find(g => g.id === step.goal_id)
            return goal?.area_id === area.id
          })
          
          // Focus score based on:
          // 1. Number of active goals in this area
          // 2. Recent step completions
          // 3. Progress made
          let focusScore = 0
          
          // Active goals weight
          focusScore += areaGoals.filter(g => g.status === 'active').length * 2
          
          // Recent step completions (within 30 days)
          const thirtyDaysAgo = new Date(date)
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const recentSteps = areaSteps.filter(step => 
            step.completed && 
            new Date(step.completed_at || step.date) >= thirtyDaysAgo &&
            new Date(step.completed_at || step.date) <= date
          )
          focusScore += recentSteps.length * 1.5
          
          // Progress made
          const avgProgress = areaGoals.length > 0 
            ? areaGoals.reduce((sum, goal) => sum + (goal.progress_percentage || 0), 0) / areaGoals.length
            : 0
          focusScore += avgProgress * 0.1
          
          areaFocus[area.id] = focusScore
        })
        
        timePoints.push({ date, areaFocus })
      })
      
      return timePoints
    }

    const timePoints = calculateFocusOverTime()
    
    // Find the dominant area for each time point
    const journeyPoints = timePoints.map(point => {
      const dominantArea = Object.entries(point.areaFocus).reduce((max, [areaId, score]) => 
        score > point.areaFocus[max] ? areaId : max, Object.keys(point.areaFocus)[0]
      )
      return {
        date: point.date,
        dominantArea,
        areaFocus: point.areaFocus
      }
    })

    // Create SVG path for the journey line
    const createJourneyPath = () => {
      if (journeyPoints.length === 0) return ''
      
      const svgWidth = 800
      const svgHeight = 400
      const padding = 60
      const chartWidth = svgWidth - 2 * padding
      const chartHeight = svgHeight - 2 * padding
      
      const minDate = new Date(Math.min(...journeyPoints.map(p => p.date.getTime())))
      const maxDate = new Date(Math.max(...journeyPoints.map(p => p.date.getTime())))
      const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const getX = (date: Date) => {
        const daysFromStart = Math.ceil((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
        return padding + (daysFromStart / totalDays) * chartWidth
      }
      
      const getY = (areaId: string) => {
        const areaIndex = areas.findIndex(a => a.id === areaId)
        return padding + (areaIndex / Math.max(areas.length - 1, 1)) * chartHeight
      }
      
      let path = ''
      journeyPoints.forEach((point, index) => {
        const x = getX(point.date)
        const y = getY(point.dominantArea)
        
        if (index === 0) {
          path += `M ${x} ${y}`
        } else {
          path += ` L ${x} ${y}`
        }
      })
      
      return path
    }

    return (
      <div className="space-y-8">
        {/* Life Journey Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <TrendingUp className="w-8 h-8 text-primary-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Životní cesta</h2>
            </div>
          <p className="text-gray-600 mb-8">Čárový graf ukazující, na kterou oblast se soustředíte v čase</p>
          </div>

        {/* Chart Container */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="relative">
            <svg width="100%" height="400" viewBox="0 0 800 400" className="overflow-visible">
              {/* Grid Lines */}
              {areas.map((area, index) => {
                const y = 60 + (index / Math.max(areas.length - 1, 1)) * 280
                return (
                  <g key={area.id}>
                    <line
                      x1="60"
                      y1={y}
                      x2="740"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                    <text
                      x="20"
                      y={y + 5}
                      fontSize="12"
                      fill="#6b7280"
                      textAnchor="end"
                    >
                      {area.name}
                    </text>
                  </g>
                )
              })}

              {/* Time Grid Lines */}
              {(() => {
                const timePoints = calculateFocusOverTime()
                if (timePoints.length === 0) return null
                
                const minDate = new Date(Math.min(...timePoints.map(p => p.date.getTime())))
                const maxDate = new Date(Math.max(...timePoints.map(p => p.date.getTime())))
                const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
                
                const months = []
                const current = new Date(minDate)
                while (current <= maxDate) {
                  months.push(new Date(current))
                  current.setMonth(current.getMonth() + 1)
                }
                
                return months.map((month, index) => {
                  const daysFromStart = Math.ceil((month.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
                  const x = 60 + (daysFromStart / totalDays) * 680
                  
                  return (
                    <g key={index}>
                      <line
                        x1={x}
                        y1="60"
                        x2={x}
                        y2="340"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="1,3"
                      />
                      <text
                        x={x}
                        y="50"
                        fontSize="10"
                        fill="#9ca3af"
                        textAnchor="middle"
                      >
                        {month.toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })}
                      </text>
                    </g>
                  )
                })
              })()}

              {/* Journey Line */}
              <path
                d={createJourneyPath()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {journeyPoints.map((point, index) => {
                const timePoints = calculateFocusOverTime()
                if (timePoints.length === 0) return null
                
                const minDate = new Date(Math.min(...timePoints.map(p => p.date.getTime())))
                const maxDate = new Date(Math.max(...timePoints.map(p => p.date.getTime())))
                const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
                
                const daysFromStart = Math.ceil((point.date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
                const x = 60 + (daysFromStart / totalDays) * 680
                const areaIndex = areas.findIndex(a => a.id === point.dominantArea)
                const y = 60 + (areaIndex / Math.max(areas.length - 1, 1)) * 280
                
                const area = areas.find(a => a.id === point.dominantArea)
                
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={area?.color || '#3b82f6'}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="white"
                    />
                  </g>
                )
              })}

              {/* Today Marker */}
              {(() => {
                const timePoints = calculateFocusOverTime()
                if (timePoints.length === 0) return null
                
                const minDate = new Date(Math.min(...timePoints.map(p => p.date.getTime())))
                const maxDate = new Date(Math.max(...timePoints.map(p => p.date.getTime())))
                const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
                
                const today = new Date()
                const daysFromStart = Math.ceil((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
                const x = 60 + (daysFromStart / totalDays) * 680
                
                return (
                  <g>
                    <line
                      x1={x}
                      y1="60"
                      x2={x}
                      y2="340"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                    <text
                      x={x}
                      y="50"
                      fontSize="10"
                      fill="#ef4444"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      Dnes
                    </text>
                  </g>
                )
              })()}
            </svg>
                  </div>
                      </div>

        {/* Legend and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Legenda</h4>
            <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Životní cesta</span>
                      </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Bod zaměření</span>
                    </div>
              <div className="flex items-center space-x-2">
                <div className="w-0.5 h-3 bg-red-500"></div>
                <span>Dnešní datum</span>
                  </div>
                    </div>
                    </div>

          {/* Current Focus */}
          <div className="bg-primary-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-primary-700 mb-3">Aktuální zaměření</h4>
            {(() => {
              const currentFocus = journeyPoints[journeyPoints.length - 1]
              if (!currentFocus) return <p className="text-xs text-gray-600">Žádná data</p>
              
              const area = areas.find(a => a.id === currentFocus.dominantArea)
              return (
                <div className="text-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: area?.color || '#3b82f6' }}
                    />
                    <span className="font-medium">{area?.name || 'Neznámá oblast'}</span>
                  </div>
                  <p className="text-gray-600">
                    Zaměřujete se na oblast <strong>{area?.name}</strong> na základě vašich aktivních cílů a nedávných úspěchů.
                  </p>
                </div>
              )
            })()}
                    </div>
                  </div>
                    </div>
    )
  }

  const renderCurrentView = () => {
    // Handle game phases first
    if (viewMode === 'daily-game') {
      switch (gamePhase) {
        case 'daily-setup':
          return renderDailySetupView()
        case 'playing':
          return renderDailyGameView()
        case 'menu':
          return renderMenuView()
        default:
          return renderDailySetupView()
      }
    }
    
    // Handle other view modes
    switch (viewMode) {
      case 'timeline':
        return renderTimelineView()
      case 'area-map':
        return renderAreaMapView()
      case 'progress-radar':
        return renderProgressRadarView()
      case 'journey-map':
        return renderJourneyMapView()
      case 'balance-wheel':
        return renderBalanceWheelView()
      case 'focus-matrix':
        return renderFocusMatrixView()
      case 'roadmap':
        return renderRoadmapView()
      case 'life-journey':
        return renderLifeJourneyView()
      case 'rpg-dashboard':
        return renderRPGDashboardView()
      case 'game-map':
        return renderGameMapView()
      default:
        return renderTimelineView()
    }
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Compass className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Přehled vaší cesty</h1>
                </div>
            <p className="text-xl text-gray-600 mb-8">{getMotivationalMessage()}</p>
            </div>

          {/* View Mode Selector */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {viewModes.map((mode) => {
                const IconComponent = mode.icon
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                      viewMode === mode.id
                        ? 'bg-primary-500 text-white border-primary-500 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300 hover:shadow-md'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{mode.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current View */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {renderCurrentView()}
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