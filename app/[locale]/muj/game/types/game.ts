// Game Types
export type GamePhase = 'daily-setup' | 'playing' | 'menu'

export interface Character {
  id: string
  name: string
  avatar: string
  appearance: {
    hairColor: string
    skinColor: string
    eyeColor: string
  }
  level: number
  experience: number
  createdAt: Date
}

export interface DailyStats {
  energy: number
  mood: number
  focus: number
  date: string
  completedTasks: number
  habitsCompleted: number
}

export interface Habit {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  maxStreak: number
  lastCompleted?: Date
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface GameTask {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  energyCost: number
  timeRequired: number // in minutes
  experienceReward: number
  completed: boolean
  completedAt?: Date
  createdAt: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: string
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  maxProgress: number
}

export interface GameState {
  phase: GamePhase
  character: Character | null
  dailyStats: DailyStats | null
  habits: Habit[]
  tasks: GameTask[]
  achievements: Achievement[]
  currentDay: number
  currentTime: number // 0-23 hours
  energy: number
  experience: number
  level: number
}

export interface GameSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  notificationsEnabled: boolean
  difficulty: 'easy' | 'normal' | 'hard'
  language: string
}

