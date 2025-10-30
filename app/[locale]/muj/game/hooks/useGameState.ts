'use client'

import { useState, useEffect, useCallback } from 'react'
import { GameState, GamePhase, Character, DailyStats, Habit, GameTask, Achievement } from '../types/game'

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'onboarding',
    character: null,
    dailyStats: null,
    habits: [],
    tasks: [],
    achievements: [],
    currentDay: 1,
    currentTime: 6,
    energy: 100,
    experience: 0,
    level: 1
  })

  // Load game state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('gameState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        // Convert date strings back to Date objects
        if (parsed.character?.createdAt) {
          parsed.character.createdAt = new Date(parsed.character.createdAt)
        }
        if (parsed.dailyStats?.date) {
          parsed.dailyStats.date = new Date(parsed.dailyStats.date).toISOString().split('T')[0]
        }
        setGameState(parsed)
      } catch (error) {
        console.error('Failed to load game state:', error)
      }
    }
  }, [])

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState))
  }, [gameState])

  const updateGamePhase = useCallback((phase: GamePhase) => {
    setGameState(prev => ({ ...prev, phase }))
  }, [])

  const createCharacter = useCallback((characterData: Omit<Character, 'id' | 'level' | 'experience' | 'createdAt'>) => {
    const newCharacter: Character = {
      ...characterData,
      id: `char_${Date.now()}`,
      level: 1,
      experience: 0,
      createdAt: new Date()
    }
    setGameState(prev => ({ ...prev, character: newCharacter, phase: 'daily-setup' }))
  }, [])

  const setDailyStats = useCallback((stats: DailyStats) => {
    setGameState(prev => ({ ...prev, dailyStats: stats, energy: stats.energy, phase: 'playing' }))
  }, [])

  const addHabit = useCallback((habit: Habit) => {
    setGameState(prev => ({ ...prev, habits: [...prev.habits, habit] }))
  }, [])

  const updateHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setGameState(prev => ({
      ...prev,
      habits: prev.habits.map(habit => 
        habit.id === habitId ? { ...habit, ...updates } : habit
      )
    }))
  }, [])

  const completeTask = useCallback((taskId: string) => {
    setGameState(prev => {
      const task = prev.tasks.find(t => t.id === taskId)
      if (!task) return prev

      const newExperience = prev.experience + task.experienceReward
      const newLevel = Math.floor(newExperience / 100) + 1
      const newEnergy = Math.max(0, prev.energy - task.energyCost)

      return {
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === taskId 
            ? { ...t, completed: true, completedAt: new Date() }
            : t
        ),
        experience: newExperience,
        level: newLevel,
        energy: newEnergy,
        dailyStats: prev.dailyStats ? {
          ...prev.dailyStats,
          completedTasks: prev.dailyStats.completedTasks + 1
        } : null
      }
    })
  }, [])

  const addTask = useCallback((task: Omit<GameTask, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: GameTask = {
      ...task,
      id: `task_${Date.now()}`,
      completed: false,
      createdAt: new Date()
    }
    setGameState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }))
  }, [])

  const advanceTime = useCallback((hours: number = 2) => {
    setGameState(prev => {
      const newTime = prev.currentTime + hours
      if (newTime >= 24) {
        // New day
        return {
          ...prev,
          currentTime: 6, // Reset to morning
          currentDay: prev.currentDay + 1,
          energy: 100, // Reset energy
          dailyStats: null // Reset daily stats
        }
      }
      return { ...prev, currentTime: newTime }
    })
  }, [])

  const rest = useCallback((energyGain: number = 30) => {
    setGameState(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + energyGain)
    }))
  }, [])

  const unlockAchievement = useCallback((achievementId: string) => {
    setGameState(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement =>
        achievement.id === achievementId
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      )
    }))
  }, [])

  return {
    gameState,
    updateGamePhase,
    createCharacter,
    setDailyStats,
    addHabit,
    updateHabit,
    completeTask,
    addTask,
    advanceTime,
    rest,
    unlockAchievement
  }
}

