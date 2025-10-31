'use client'

import { useState, useEffect } from 'react'
import { useGameState } from '../hooks/useGameState'
// import { GoalDetailModal } from '../../../components/GoalDetailModal'

export function GameWorldView() {
  const { gameState, completeTask, addTask, advanceTime, rest, updateGamePhase } = useGameState()
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)

  // Mock goals data - in real app, this would come from API
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Naučit se programovat',
      description: 'Zvládnout základy JavaScriptu',
      category: 'vzdělání',
      priority: 'high',
      energyCost: 20,
      timeRequired: 60,
      experienceReward: 50,
      completed: false
    },
    {
      id: '2',
      title: 'Cvičit každý den',
      description: '30 minut cvičení',
      category: 'zdraví',
      priority: 'medium',
      energyCost: 15,
      timeRequired: 30,
      experienceReward: 30,
      completed: false
    },
    {
      id: '3',
      title: 'Číst knihu',
      description: 'Přečíst 20 stránek',
      category: 'vzdělání',
      priority: 'low',
      energyCost: 10,
      timeRequired: 20,
      experienceReward: 20,
      completed: false
    }
  ])

  const getAvailableTasks = () => {
    return goals.filter(goal => 
      !goal.completed && 
      gameState.energy >= goal.energyCost &&
      gameState.currentTime >= 6 && 
      gameState.currentTime <= 22
    )
  }

  const handleCompleteTask = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (goal) {
      completeTask(goalId)
      setGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, completed: true } : g
      ))
    }
  }

  const handleRest = () => {
    rest(30)
    advanceTime(2)
  }

  const handleAdvanceTime = () => {
    advanceTime(2)
  }

  const availableTasks = getAvailableTasks()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4" style={{
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px'
    }}>
      {/* Game Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Hráč</h1>
              <p className="text-xs text-gray-600">Level {gameState.level} • {gameState.experience} XP</p>
            </div>
          </div>
            <button
              onClick={() => updateGamePhase('daily-setup')}
              className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            >
              NASTAVENÍ
            </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-600">DEN</div>
            <div className="text-lg font-bold text-gray-900">{gameState.currentDay}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">ČAS</div>
            <div className="text-lg font-bold text-gray-900">{gameState.currentTime}:00</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">ENERGIE</div>
            <div className="text-lg font-bold text-gray-900">{gameState.energy}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">DOKONČENO</div>
            <div className="text-lg font-bold text-gray-900">{gameState.dailyStats?.completedTasks || 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">DOSTUPNÉ</div>
            <div className="text-lg font-bold text-gray-900">{availableTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Available Tasks */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">DOSTUPNÉ ÚKOLY</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTasks.map((goal) => (
            <div
              key={goal.id}
              className="p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedGoal(goal)
                setShowGoalModal(true)
              }}
            >
              <h3 className="font-bold text-gray-900 mb-2">{goal.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Energie: {goal.energyCost}</span>
                <span>Čas: {goal.timeRequired}min</span>
                <span>XP: {goal.experienceReward}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCompleteTask(goal.id)
                }}
                className="w-full mt-2 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                DOKONČIT
              </button>
            </div>
          ))}
        </div>
        {availableTasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Žádné dostupné úkoly. Možná potřebuješ odpočinek nebo je pozdě večer.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleAdvanceTime}
          className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-300"
        >
          POSTUPIT ČAS (+2h)
        </button>
        <button
          onClick={handleRest}
          className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-300"
        >
          ODPOČINEK (+30 energie)
        </button>
      </div>

      {/* Goal Detail Modal - TODO: Implement */}
      {showGoalModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">{selectedGoal.title}</h3>
            <p className="text-gray-600 mb-4">{selectedGoal.description}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                ZAVŘÍT
              </button>
              <button
                onClick={() => {
                  handleCompleteTask(selectedGoal.id)
                  setShowGoalModal(false)
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                DOKONČIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
