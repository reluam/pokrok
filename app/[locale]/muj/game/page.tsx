'use client'

import { useGameState } from './hooks/useGameState'
import { OnboardingView } from './components/OnboardingView'
import { CharacterCreationView } from './components/CharacterCreationView'
import { DailySetupView } from './components/DailySetupView'
import { GameWorldView } from './components/GameWorldView'

export default function GamePage() {
  const { gameState, updateGamePhase } = useGameState()

  const renderCurrentView = () => {
    switch (gameState.phase) {
      case 'onboarding':
        return <OnboardingView />
      case 'character-creation':
        return <CharacterCreationView />
      case 'daily-setup':
        return <DailySetupView />
      case 'playing':
        return <GameWorldView />
      default:
        return <OnboardingView />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      {renderCurrentView()}
    </div>
  )
}
