'use client'

import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { DailyPlanningTab } from './game-tabs/DailyPlanningTab'
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
  onEventPostpone
}: GameCenterProps) {
  return (
    <div className="h-full overflow-y-auto">
      <DailyPlanningTab 
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