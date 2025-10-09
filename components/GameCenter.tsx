'use client'

import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { WorkspaceTab } from './game-tabs/WorkspaceTab'
import { NeededStepsWorkspace } from './NeededStepsWorkspace'
import { memo } from 'react'

interface GameCenterProps {
  goals: Goal[]
  values: Value[]
  dailySteps: DailyStep[]
  events: Event[]
  selectedStep?: DailyStep | null
  selectedEvent?: Event | null
  onValueUpdate?: (value: Value) => void
  onGoalUpdate?: (goal: Goal) => void
  onStepUpdate?: (step: DailyStep) => void
  onEventComplete?: (eventId: string) => void
  onEventPostpone?: (eventId: string) => void
  // Needed Steps props
  showNeededSteps?: boolean
  neededStepsSettings?: any
  onNeededStepsSave?: (steps: any[]) => void
}

export const GameCenter = memo(function GameCenter({ 
  goals, 
  values, 
  dailySteps, 
  events, 
  selectedStep, 
  selectedEvent, 
  onValueUpdate, 
  onGoalUpdate, 
  onStepUpdate, 
  onEventComplete, 
  onEventPostpone,
  showNeededSteps = false,
  neededStepsSettings,
  onNeededStepsSave
}: GameCenterProps) {
  console.log('GameCenter render:', { showNeededSteps, neededStepsSettings })
  
  // Show Needed Steps Workspace if active
  if (showNeededSteps) {
    console.log('Rendering NeededStepsWorkspace directly in GameCenter')
    return (
      <div className="h-full overflow-y-auto">
        <NeededStepsWorkspace
          isActive={true}
          onSave={onNeededStepsSave || (() => {})}
          goals={goals.filter(goal => goal.status === 'active')}
          settings={neededStepsSettings}
        />
      </div>
    )
  }
  
  return (
    <div className="h-full overflow-y-auto">
      <WorkspaceTab 
        goals={goals}
        values={values}
        dailySteps={dailySteps}
        events={events}
        selectedStep={selectedStep}
        selectedEvent={selectedEvent}
        onValueUpdate={onValueUpdate || (() => {})}
        onGoalUpdate={onGoalUpdate || (() => {})}
        onStepUpdate={onStepUpdate || (() => {})}
        onEventComplete={onEventComplete || (() => {})}
        onEventPostpone={onEventPostpone || (() => {})}
      />
    </div>
  )
})