'use client'

import { useState, useEffect } from 'react'

interface NeededStepsSettings {
  enabled: boolean
  days_of_week: number[]
  time_hour: number
  time_minute: number
}

export function useNeededStepsTimer(settings: NeededStepsSettings | null) {
  const [shouldShowModal, setShouldShowModal] = useState(false)
  const [lastShownDate, setLastShownDate] = useState<string | null>(null)

  useEffect(() => {
    console.log('Timer hook effect running:', { settings, enabled: settings?.enabled })
    
    // Temporarily allow showing modal even if not enabled for testing
    // if (!settings?.enabled) {
    //   console.log('Settings not enabled, hiding modal')
    //   setShouldShowModal(false)
    //   return
    // }

    const checkTime = () => {
      if (!settings) {
        console.log('No settings available')
        return
      }

      const now = new Date()
      const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const today = now.toDateString()

      // Check if today is in the allowed days (convert Sunday from 0 to 7)
      const dayOfWeek = currentDay === 0 ? 7 : currentDay
      const isAllowedDay = settings.days_of_week?.includes(dayOfWeek) || false

      // Check if current time is at or after the scheduled time
      const scheduledTime = new Date()
      scheduledTime.setHours(settings.time_hour || 9, settings.time_minute || 0, 0, 0)
      const isAfterScheduledTime = now >= scheduledTime

      // Check if we haven't completed the needed steps today yet
      // (This allows showing it even if it's later in the day, as long as not completed)
      const hasNotCompletedToday = lastShownDate !== today

      if (isAllowedDay && isAfterScheduledTime && hasNotCompletedToday) {
        console.log('Showing needed steps modal:', { isAllowedDay, isAfterScheduledTime, hasNotCompletedToday, now, scheduledTime })
        setShouldShowModal(true)
        // Don't set lastShownDate here - only when actually completed
      } else {
        // Hide modal if conditions are not met
        setShouldShowModal(false)
      }
    }

    // Check immediately
    checkTime()

    // Check every minute
    const interval = setInterval(checkTime, 60000)

    return () => clearInterval(interval)
  }, [settings, lastShownDate])

  const hideModal = () => {
    setShouldShowModal(false)
  }

  const markAsCompleted = () => {
    // Mark as completed for today so it won't show again
    const today = new Date().toDateString()
    setLastShownDate(today)
    setShouldShowModal(false)
  }

  return {
    shouldShowModal,
    hideModal,
    markAsCompleted
  }
}
