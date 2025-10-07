'use client'

import { Goal, Value, DailyStep, Metric, Event } from '@/lib/cesta-db'
import { WorkspaceTab } from './game-tabs/WorkspaceTab'
import { memo } from 'react'

interface GameCenterProps {
  goals: Goal[]
  values: Value[]
  dailySteps: DailyStep[]
  events: Event[]
  metrics: Metric[]
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
  metrics, 
  selectedStep, 
  selectedEvent, 
  onValueUpdate, 
  onGoalUpdate, 
  onStepUpdate, 
  onEventComplete, 
  onEventPostpone 
}: GameCenterProps) {
  return (
    <WorkspaceTab 
      goals={goals}
      values={values}
      dailySteps={dailySteps}
      events={events}
      metrics={metrics}
      selectedStep={selectedStep}
      selectedEvent={selectedEvent}
      onValueUpdate={onValueUpdate || (() => {})}
      onGoalUpdate={onGoalUpdate || (() => {})}
      onStepUpdate={onStepUpdate || (() => {})}
      onEventComplete={onEventComplete || (() => {})}
      onEventPostpone={onEventPostpone || (() => {})}
    />
  )
})