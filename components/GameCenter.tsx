'use client'

import { Goal, Value, DailyStep, Event } from '@/lib/cesta-db'
import { DailyPlanningTab } from './game-tabs/DailyPlanningTab'
import { NoWorkflowTab } from './game-tabs/NoWorkflowTab'
import { memo, useState, useEffect } from 'react'

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
  const [userWorkflow, setUserWorkflow] = useState<'daily_planning' | 'no_workflow'>('daily_planning')
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(true)

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await fetch('/api/cesta/user-settings')
        if (response.ok) {
          const data = await response.json()
          setUserWorkflow(data.settings?.workflow || 'daily_planning')
        }
      } catch (error) {
        console.error('Error fetching user settings:', error)
      } finally {
        setIsLoadingWorkflow(false)
      }
    }

    fetchUserSettings()
  }, [])

  if (isLoadingWorkflow) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítání workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {userWorkflow === 'daily_planning' ? (
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
      ) : (
        <NoWorkflowTab />
      )}
    </div>
  )
})